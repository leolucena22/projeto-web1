import { useState } from 'react';
import './StarRating.css';

/**
 * StarRating — Componente de avaliação com estrelas (1-10).
 * Modo interativo (input) e modo display-only.
 */
const StarRating = ({ value = 0, onChange, readOnly = false, max = 10, size = 'md' }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (star) => {
    if (!readOnly && onChange) {
      onChange(star);
    }
  };

  return (
    <div className={`star-rating star-rating-${size} ${readOnly ? 'readonly' : 'interactive'}`}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${star <= (hoverValue || value) ? 'filled' : ''}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHoverValue(star)}
          onMouseLeave={() => !readOnly && setHoverValue(0)}
          disabled={readOnly}
          aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
      {readOnly && value > 0 && (
        <span className="star-rating-value">{value}</span>
      )}
    </div>
  );
};

export default StarRating;
