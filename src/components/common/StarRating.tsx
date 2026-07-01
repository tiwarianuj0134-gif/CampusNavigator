import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  showValue?: boolean;
}

export default function StarRating({ rating, max = 5, size = 16, showValue = true }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}
        />
      ))}
      {showValue && <span className="ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300">{rating.toFixed(1)}</span>}
    </div>
  );
}
