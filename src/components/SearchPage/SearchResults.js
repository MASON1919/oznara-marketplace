"use client";
import Image from "next/image";
import Link from "next/link";
export default function SearchResults({ listings, s3Urls }) {
  if (!listings?.length) {
    return (
      <div className="py-20 text-center text-gray-500">
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
      {listings.map((item, index) => (
        <Link href={`/listings/${item.id}`} key={item.id || index}>
          <div
            key={item.id || index}
            className="rounded-2xl overflow-hidden border hover:shadow-lg transition-shadow bg-white"
          >
            <div className="aspect-square bg-gray-100">
              <Image
                src={s3Urls[index]}
                alt={item.title}
                className="w-full h-full object-cover"
                width={300}
                height={300}
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-800 line-clamp-1">
                {item.title}
              </p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {Number(item.price).toLocaleString()}원
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
