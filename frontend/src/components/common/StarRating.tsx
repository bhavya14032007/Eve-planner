import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, reviewCount, size = 'sm' }) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-1.5" aria-label={`Rating: ${rating} out of 5 stars`}>
      <div className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= Math.round(rating)
                ? 'fill-amber-500 text-amber-500'
                : 'text-border-strong fill-transparent'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-text-primary">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-xs text-text-muted">({reviewCount})</span>
      )}
    </div>
  );
};
