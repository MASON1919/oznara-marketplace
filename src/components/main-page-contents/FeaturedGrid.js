import { prisma } from "@/lib/prisma";
import { getS3Url } from "@/lib/s3";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";

export default async function FeaturedGrid() {
  // Featured 상품 8개 가져오기 (랜덤 또는 최신순)
  const featuredListings = await prisma.listing.findMany({
    where: {
      deleted: false,
      NOT: {
        transaction: {
          some: {
            status: "Completed",
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      title: true,
      price: true,
      category: true,
      listingImages: {
        where: { isCover: true },
        take: 1,
        select: {
          s3Key: true,
        },
      },
    },
  });

  const listingsWithUrls = featuredListings.map((listing) => ({
    ...listing,
    imageUrl: listing.listingImages[0]
      ? getS3Url(listing.listingImages[0].s3Key)
      : null,
  }));

  // 카테고리별 색상
  const categoryColors = {
    Electronics: "from-blue-500 to-purple-600",
    Furniture: "from-orange-500 to-red-600",
    Clothing: "from-pink-500 to-red-500",
    Sports: "from-green-500 to-emerald-600",
    Books: "from-yellow-500 to-orange-500",
    Others: "from-gray-500 to-gray-700",
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-8">
      {/* 중앙 검색바 */}
      <div className="relative z-10 flex justify-center mb-8">
        <div className="w-full max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="오즈나라에서 상품을 검색해보세요..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-base shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-4 gap-4 h-[600px]">
        {/* 큰 아이템 (좌상단) */}
        {listingsWithUrls[0] && (
          <Link
            href={`/listings/${listingsWithUrls[0].id}`}
            className="col-span-2 row-span-2 relative group overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
              {listingsWithUrls[0].imageUrl && (
                <Image
                  src={listingsWithUrls[0].imageUrl}
                  alt={listingsWithUrls[0].title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <p
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 bg-gradient-to-r ${
                    categoryColors[listingsWithUrls[0].category]
                  }`}
                >
                  {listingsWithUrls[0].category}
                </p>
                <h3 className="text-2xl font-bold mb-2">
                  {listingsWithUrls[0].title}
                </h3>
                <p className="text-xl font-bold">
                  {listingsWithUrls[0].price.toLocaleString()}원
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* 중간 아이템들 */}
        {listingsWithUrls.slice(1, 5).map((listing, index) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className={`relative group overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 ${
              index === 1 ? "row-span-2" : ""
            }`}
          >
            <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
              {listing.imageUrl && (
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <p
                  className={`inline-block px-2 py-1 rounded-full text-xs font-bold mb-1 bg-gradient-to-r ${
                    categoryColors[listing.category]
                  }`}
                >
                  {listing.category}
                </p>
                <h3 className="text-sm font-bold line-clamp-1">
                  {listing.title}
                </h3>
                <p className="text-base font-bold">
                  {listing.price.toLocaleString()}원
                </p>
              </div>
            </div>
          </Link>
        ))}

        {/* 하단 아이템들 */}
        {listingsWithUrls.slice(5, 8).map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="relative group overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
              {listing.imageUrl && (
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <p
                  className={`inline-block px-2 py-1 rounded-full text-xs font-bold mb-1 bg-gradient-to-r ${
                    categoryColors[listing.category]
                  }`}
                >
                  {listing.category}
                </p>
                <h3 className="text-sm font-bold line-clamp-1">
                  {listing.title}
                </h3>
                <p className="text-base font-bold">
                  {listing.price.toLocaleString()}원
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
