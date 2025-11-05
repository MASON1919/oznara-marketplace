import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId, like } = await req.json();
  const userId = session.user.id;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { userId: true }, // 판매자 ID만 가져오기
  });

  if (userId === listing.userId) {
    return NextResponse.json(
      { error: "본인 상품에는 좋아요를 할 수 없습니다." },
      { status: 400 }
    );
  }

  if (like) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.like.create({ data: { userId, listingId } });
        await tx.listing.update({
          where: { id: listingId },
          data: { likeCount: { increment: 1 } },
        });
      });
    } catch (e) {
      // 중복 찜 시도 시 무시
      if (e.code !== "P2002") throw e;
    }
  } else {
    await prisma.$transaction(async (tx) => {
      const del = await tx.like.deleteMany({ where: { userId, listingId } });
      if (del.count > 0) {
        await tx.listing.update({
          where: { id: listingId },
          data: { likeCount: { decrement: 1 } },
        });
      }
    });
  }

  return NextResponse.json({ ok: true });
}
