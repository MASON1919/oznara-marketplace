import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import MyListingActions from "./MyListingActions";

export default async function MyListings() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return (
      <div className="my-16 px-4 flex flex-col items-start">
        로그인이 필요합니다.
      </div>
    );
  }
  const myListings = await prisma.listing.findMany({
    where: { userId: userId, deleted: false },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      listingImages: {
        where: { isCover: true },
        take: 1,
      },
    },
  });
  const s3Urls = myListings.map((listing) => {
    return getS3Url(listing.listingImages[0].s3Key);
  });
  return (
    <div className="my-16 px-4 flex flex-col items-start">
      <MyListingActions myListings={myListings} s3Urls={s3Urls} />
    </div>
  );
}
