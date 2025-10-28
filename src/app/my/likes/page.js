import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
  //likes, listingImages는 배열, listing은 배열 아님 -> likes[].listing.listingImages[] 이런식으로 접근
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
          찜한 상품이 없습니다.
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
        {likes.map((item, index) => (
          <Link href={`/listings/${item.listing.id}`} key={index}>
            <div
              key={index}
              className="rounded-2xl overflow-hidden border hover:shadow-lg transition-shadow bg-white"
            >
              <div className="aspect-square bg-gray-100">
                <Image
                  src={s3Urls[index]}
                  alt={item.listing.title}
                  className="w-full h-full object-cover"
                  width={300}
                  height={300}
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">
                  {item.listing.title}
                </p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {Number(item.listing.price).toLocaleString()}원
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
