import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  rating = 0,
  onChange,
  readOnly = false,
  size = 18,
  showLabel = false
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const activeValue = hoverRating || rating;

  return (
    <div className="star-rating-container">
      <div className="star-rating-stars">
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= activeValue;
          return (
            <button
              key={starValue}
              type="button"
              className={`star-btn ${readOnly ? 'read-only' : 'interactive'} ${isFilled ? 'filled' : 'empty'}`}
              onClick={() => !readOnly && onChange && onChange(starValue)}
              onMouseEnter={() => !readOnly && setHoverRating(starValue)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              disabled={readOnly}
              aria-label={`Rate ${starValue} stars`}
            >
              <Star
                size={size}
                fill={isFilled ? '#f59e0b' : 'transparent'}
                color={isFilled ? '#f59e0b' : '#cbd5e1'}
              />
            </button>
          );
        })}
      </div>
      {showLabel && (
        <span className="star-rating-num">
          {rating ? Number(rating).toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
}
