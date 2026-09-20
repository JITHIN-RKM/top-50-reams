export default function Loading() {
  return (
    <div className="w-full max-w-6xl mx-auto p-8 animate-pulse space-y-6">
      <div className="h-10 bg-gray-200 w-1/4 mb-8"></div>
      <div className="space-y-4">
        <div className="h-40 bg-gray-200 w-full border-2 border-gray-100"></div>
        <div className="h-40 bg-gray-200 w-full border-2 border-gray-100"></div>
        <div className="h-40 bg-gray-200 w-full border-2 border-gray-100"></div>
      </div>
    </div>
  );
}
