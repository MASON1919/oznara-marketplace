import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { uploadToS3, deleteFromS3 } from "@/lib/s3";

/**
 * PATCH: 게시글 수정 API
 * 제목, 설명, 카테고리, 가격, 거래방법, 이미지를 수정할 수 있습니다
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않았습니다." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = session.user.id;

    // 게시글 확인
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        listingImages: true,
      },
    });

    if (!listing || listing.deleted) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 권한 확인
    if (listing.userId !== userId) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const formData = await request.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = parseInt(formData.get("price"));
    const method = formData.get("method");
    const keepImageIds = formData.getAll("keepImageIds");
    const newImageFiles = formData.getAll("newImages");

    // 삭제할 이미지 처리
    const imagesToDelete = listing.listingImages.filter(
      (img) => !keepImageIds.includes(img.id)
    );

    for (const img of imagesToDelete) {
      await deleteFromS3(img.s3Key);
      await prisma.listingImage.delete({
        where: { id: img.id },
      });
    }

    // 새 이미지 업로드
    const uploadedImages = [];
    for (const file of newImageFiles) {
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const s3Key = await uploadToS3(buffer, file.type);
        uploadedImages.push({
          s3Key,
          mime: file.type,
          size: file.size,
          isCover: false,
        });
      }
    }

    // 게시글 업데이트
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        title,
        description,
        category,
        price,
        method,
        listingImages: {
          create: uploadedImages,
        },
      },
    });

    return NextResponse.json({ success: true, listing: updatedListing });
  } catch (error) {
    console.error("게시글 수정 오류:", error);
    return NextResponse.json(
      { error: "게시글 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 게시글 삭제 API
 * soft delete 방식으로 게시글을 삭제합니다 (deleted 플래그를 true로 설정)
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않았습니다." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = session.user.id;

    // 게시글 존재 여부 확인
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing || listing.deleted) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 작성자 본인인지 권한 확인
    if (listing.userId !== userId) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // soft delete 처리 (실제 삭제가 아닌 deleted 플래그 설정)
    await prisma.listing.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("게시글 삭제 오류:", error);
    return NextResponse.json(
      { error: "게시글 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
