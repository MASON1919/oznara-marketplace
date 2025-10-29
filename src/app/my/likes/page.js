import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LikedItemsList from "@/components/LikedItemsList";

export default async function LikesPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  const userId = session.user.id;
  const likes = await prisma.like.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      listing: {
        select: {
          id: true,
          title: true,
          price: true,
          deleted: true,
          listingImages: {
            where: { isCover: true },
            select: { s3Key: true },
            take: 1,
          },
        },
      },
    },
  });

  const s3Urls = likes.map((like) => {
    return getS3Url(like.listing.listingImages[0]?.s3Key);
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mt-16 mb-6 text-center">
        내가 찜한 상품
      </h1>
      {!likes.length && (
        <div className="py-20 text-center text-gray-500">
          찜 한 상품이 없습니다.
        </div>
      )}
      <LikedItemsList likes={likes} s3Urls={s3Urls} />
    </div>
  );
}
