export default function DashboardLoading() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Banner Skeleton */}
      <div className="mb-6 h-[88px] bg-gray-100 animate-pulse border-2 border-gray-50"></div>
      
      {/* Tabs Skeleton */}
      <div className="mb-6 flex gap-4 border-b-2 border-gray-100 pb-[2px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 w-28 bg-gray-100 animate-pulse"></div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        <div className="h-64 bg-gray-100 border-2 border-gray-50"></div>
        <div className="h-64 bg-gray-100 border-2 border-gray-50"></div>
      </div>
    </div>
  );
}
