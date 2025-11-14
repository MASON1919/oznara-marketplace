export default function Loading() {
  return (
    <div className="mt-16 max-w-5xl mx-auto p-4">
      <div className="flex gap-16 items-start animate-pulse">
        {/* 이미지 스켈레톤 */}
        <div className="w-full max-w-[600px]">
          <div className="relative aspect-square bg-gray-200 rounded-2xl" />
        </div>

        {/* 정보 스켈레톤 */}
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-10 bg-gray-200 rounded w-1/2" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
