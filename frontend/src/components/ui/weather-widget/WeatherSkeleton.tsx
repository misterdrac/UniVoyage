export const WeatherSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex justify-between items-center mb-2">
      <div className="bg-secondary/30 h-8 w-8 rounded-full"></div>
      <div className="bg-secondary/30 h-6 w-6 rounded-full"></div>
    </div>
    <div className="space-y-2">
      <div className="bg-secondary/30 h-10 w-16 rounded-md"></div>
      <div className="flex items-center">
        <div className="bg-secondary/30 h-3 w-4 rounded-sm mr-1"></div>
        <div className="bg-secondary/30 h-3 w-20 rounded-sm"></div>
      </div>
      <div className="bg-secondary/30 h-3 w-32 rounded-sm"></div>
    </div>
  </div>
)

