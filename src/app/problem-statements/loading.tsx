export default function ProblemStatementsLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-12 w-64 bg-gray-100 mb-4"></div>
        <div className="h-6 w-96 bg-gray-100"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Skeleton */}
        <div className="md:col-span-1 space-y-6">
          <div className="h-12 bg-gray-100 w-full"></div>
          <div className="h-40 bg-gray-100 w-full"></div>
          <div className="h-40 bg-gray-100 w-full"></div>
        </div>

        {/* List Skeleton */}
        <div className="md:col-span-3 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-gray-100 w-full border-2 border-gray-50"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
