import React from 'react';
import clsx from 'clsx';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

export type RatingValue = 1 | 2 | 3 | 4 | 5;
export type RatingScale = 'excellent' | 'good' | 'satisfactory' | 'needsImprovement' | 'unsatisfactory';

export interface PerformanceRatingProps {
  rating: RatingValue;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showNumeric?: boolean;
  variant?: 'stars' | 'progress' | 'circular' | 'badge';
  interactive?: boolean;
  onChange?: (rating: RatingValue) => void;
  className?: string;
  label?: string;
  description?: string;
}

const ratingLabels: Record<RatingValue, RatingScale> = {
  5: 'excellent',
  4: 'good', 
  3: 'satisfactory',
  2: 'needsImprovement',
  1: 'unsatisfactory'
};

const ratingColors = {
  1: { bg: 'bg-danger-100', text: 'text-danger-800', border: 'border-danger-200', fill: 'fill-danger-500' },
  2: { bg: 'bg-warning-100', text: 'text-warning-800', border: 'border-warning-200', fill: 'fill-warning-500' },
  3: { bg: 'bg-neutral-100', text: 'text-neutral-800', border: 'border-neutral-200', fill: 'fill-neutral-500' },
  4: { bg: 'bg-success-100', text: 'text-success-800', border: 'border-success-200', fill: 'fill-success-500' },
  5: { bg: 'bg-success-100', text: 'text-success-800', border: 'border-success-200', fill: 'fill-success-600' },
};

const PerformanceRating: React.FC<PerformanceRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showLabel = false,
  showNumeric = false,
  variant = 'stars',
  interactive = false,
  onChange,
  className,
  label,
  description,
}) => {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const progressSizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const circularSizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20'
  };

  const handleStarClick = (value: RatingValue) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const renderStars = () => (
    <div className="flex items-center space-x-1">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        
        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleStarClick(starValue as RatingValue)}
            className={clsx(
              sizeClasses[size],
              interactive && 'cursor-pointer hover:scale-110 transition-transform duration-150',
              !interactive && 'cursor-default'
            )}
          >
            {isFilled ? (
              <StarIcon className={clsx(
                sizeClasses[size],
                ratingColors[rating].fill
              )} />
            ) : (
              <StarOutlineIcon className={clsx(
                sizeClasses[size],
                'text-neutral-300'
              )} />
            )}
          </button>
        );
      })}
    </div>
  );

  const renderProgressBar = () => {
    const percentage = (rating / maxRating) * 100;
    
    return (
      <div className={clsx(
        'w-full bg-neutral-200 rounded-full overflow-hidden',
        progressSizeClasses[size]
      )}>
        <div
          className={clsx(
            'h-full transition-all duration-500 ease-out rounded-full',
            rating <= 2 ? 'bg-gradient-to-r from-danger-400 to-danger-500' :
            rating === 3 ? 'bg-gradient-to-r from-warning-400 to-warning-500' :
            'bg-gradient-to-r from-success-400 to-success-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const renderCircular = () => {
    const percentage = (rating / maxRating) * 100;
    const circumference = 2 * Math.PI * 20; // radius = 20
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={clsx('relative', circularSizeClasses[size])}>
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox="0 0 50 50"
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-neutral-200"
          />
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={clsx(
              'transition-all duration-500 ease-out',
              rating <= 2 ? 'text-danger-500' :
              rating === 3 ? 'text-warning-500' :
              'text-success-500'
            )}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={clsx(
            'font-bold',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base',
            ratingColors[rating].text
          )}>
            {rating.toFixed(1)}
          </span>
        </div>
      </div>
    );
  };

  const renderBadge = () => (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border',
      ratingColors[rating].bg,
      ratingColors[rating].text,
      ratingColors[rating].border
    )}>
      {rating.toFixed(1)} ⭐
    </span>
  );

  const renderRatingComponent = () => {
    switch (variant) {
      case 'progress':
        return renderProgressBar();
      case 'circular':
        return renderCircular();
      case 'badge':
        return renderBadge();
      default:
        return renderStars();
    }
  };

  return (
    <div className={clsx('flex flex-col space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      
      <div className="flex items-center space-x-3">
        {renderRatingComponent()}
        
        {showNumeric && variant !== 'badge' && (
          <span className={clsx(
            'font-semibold',
            size === 'sm' ? 'text-sm' : 'text-base',
            ratingColors[rating].text
          )}>
            {rating.toFixed(1)}/{maxRating}
          </span>
        )}
        
        {showLabel && (
          <span className={clsx(
            'font-medium',
            size === 'sm' ? 'text-sm' : 'text-base',
            ratingColors[rating].text
          )}>
            {t(`evaluations.${ratingLabels[rating]}`)}
          </span>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-neutral-600">
          {description}
        </p>
      )}
    </div>
  );
};

export default PerformanceRating;