import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import EditListingForm from "@/components/EditListingForm";

export default async function EditListingPage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  // 게시글 정보 가져오기
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      listingImages: {
        select: { s3Key: true, id: true, isCover: true },
      },
    },
  });

  // 게시글이 없거나 삭제된 경우
  if (!listing || listing.deleted) {
    return (
      <div className="mt-16 max-w-2xl mx-auto p-4">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  // 본인의 게시글이 아닌 경우
  if (listing.userId !== userId) {
    redirect(`/listings/${id}`);
  }

  // 이미지 URL 생성
  const images = listing.listingImages.map((image) => ({
    id: image.id,
    s3Key: image.s3Key,
    url: getS3Url(image.s3Key),
    isCover: image.isCover,
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-5">
            <h1 className="text-2xl font-bold text-gray-900">게시글 수정</h1>
            <p className="text-sm text-gray-500 mt-1">
              상품 정보를 수정할 수 있습니다
            </p>
          </div>
          <div className="p-6">
            <EditListingForm listing={listing} images={images} />
          </div>
        </div>
      </div>
    </div>
  );
}
