export default function ProblemStatementDetailLoading() {
  return (
    <div className="w-full max-w-5xl mx-auto pt-6 animate-pulse">
      <div className="h-10 w-24 bg-gray-100 mb-6"></div>
      
      <div className="space-y-4 mb-8">
        <div className="h-8 w-32 bg-gray-100"></div>
        <div className="h-16 bg-gray-100 w-full"></div>
        <div className="flex gap-4">
          <div className="h-8 w-24 bg-gray-100"></div>
          <div className="h-8 w-24 bg-gray-100"></div>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b-2 border-gray-100 pb-[2px]">
        <div className="h-12 w-32 bg-gray-100"></div>
        <div className="h-12 w-32 bg-gray-100"></div>
      </div>

      <div className="h-96 bg-gray-100 w-full border-2 border-gray-50"></div>
    </div>
  );
}
