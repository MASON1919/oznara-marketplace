import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";
import SearchResults from "@/components/SearchPage/SearchResults";
import PaginationBar from "@/components/SearchPage/PaginationBar";
export default async function SearchPage({ searchParams }) {
  const query = searchParams.query || "";
  const page = parseInt(searchParams.page) || 1;
  const listings = await prisma.listing.findMany({
    include: {
      listingImages: {
        where: { isCover: true },
        select: { s3Key: true },
        take: 1,
      },
    },
    where: {
      title: {
        contains: query,
        mode: "insensitive",
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * 10,
    take: 10,
  });
  const s3Urls = listings.map((listing) => {
    return getS3Url(listing.listingImages[0].s3Key);
  });
  return (
    <div>
      <h2 className="text-2xl font-bold my-6 px-4">"{query}" 검색 결과</h2>
      <SearchResults listings={listings} s3Urls={s3Urls} />
      <PaginationBar currentPage={page} />
    </div>
  );
}
