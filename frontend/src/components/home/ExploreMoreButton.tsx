import { useCallback } from "react";
import { ChevronDown } from "lucide-react";

export function ExploreMoreButton() {
  const handleClick = useCallback(() => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  }, []);

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
      <button
        onClick={handleClick}
        className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors group"
        aria-label="Explore more content"
      >
        <span className="text-sm font-medium">Explore More</span>
        <ChevronDown className="w-6 h-6 animate-bounce" />
      </button>
    </div>
  );
}
