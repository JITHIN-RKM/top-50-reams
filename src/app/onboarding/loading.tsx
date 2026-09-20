export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-sih-gray flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-pulse">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="h-12 w-12 bg-gray-200 mx-auto mb-4"></div>
        <div className="h-8 w-64 bg-gray-200 mx-auto mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 mx-auto"></div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 border-2 border-gray-100 sm:px-10">
          <div className="space-y-6">
            <div className="h-14 bg-gray-100 w-full"></div>
            <div className="h-14 bg-gray-100 w-full"></div>
            <div className="h-14 bg-gray-100 w-full"></div>
            <div className="h-14 bg-gray-100 w-full"></div>
            <div className="h-12 bg-gray-200 w-full mt-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
