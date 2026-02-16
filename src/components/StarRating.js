import React from 'react';
import '../component-css/star-rating.css';

export default function StarRating({ rating = 0, onRatingChange = null, size = 'medium', interactive = false }) {
  const [hoveredRating, setHoveredRating] = React.useState(0);
  
  const sizes = {
    small: 16,
    medium: 24,
    large: 32
  };

  const starSize = sizes[size] || sizes.medium;

  function handleClick(value) {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  }

  function handleMouseEnter(value) {
    if (interactive) {
      setHoveredRating(value);
    }
  }

  function handleMouseLeave() {
    if (interactive) {
      setHoveredRating(0);
    }
  }

  const displayRating = interactive ? (hoveredRating || rating) : rating;

  return (
    <div className={`star-rating ${interactive ? 'interactive' : ''}`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          className={`star ${value <= displayRating ? 'filled' : 'empty'}`}
          style={{ fontSize: `${starSize}px` }}
          onClick={() => handleClick(value)}
          onMouseEnter={() => handleMouseEnter(value)}
          onMouseLeave={handleMouseLeave}
          role={interactive ? 'button' : 'img'}
          aria-label={`${value} star${value > 1 ? 's' : ''}`}
          tabIndex={interactive ? 0 : -1}
        >
          {value <= displayRating ? '★' : '☆'}
        </span>
      ))}
      {rating > 0 && (
        <span className="rating-value">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
