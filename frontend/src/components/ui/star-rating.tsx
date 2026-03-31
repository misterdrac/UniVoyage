interface StarRatingProps {
  rating: number; // 0–5
}

export const StarRating = ({ rating }: StarRatingProps) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, rating - (star - 1)));
        return (
          <div key={star} className="relative text-sm">
            <span className="text-white/30">☆</span>
            <span
              className="absolute inset-0 overflow-hidden text-yellow-400"
              style={{ width: `${fill * 100}%` }}
            >
              ★
            </span>
          </div>
        );
      })}
      <span className="text-xs text-white/70 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};