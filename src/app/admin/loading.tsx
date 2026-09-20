export default function AdminLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-48 bg-gray-100"></div>
        <div className="h-10 w-24 bg-gray-100"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100 border-2 border-gray-50"></div>
        ))}
      </div>

      <div className="h-64 bg-gray-100 border-2 border-gray-50"></div>
    </div>
  );
}
