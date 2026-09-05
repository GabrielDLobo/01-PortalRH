import React from 'react';
import clsx from 'clsx';

export interface ProgressBarProps {
  label?: string;
  value: number;
  max?: number;
  showValue?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gradient';
  variant?: 'default' | 'striped' | 'animated';
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}

const colorClasses = {
  primary: 'bg-primary-600',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-cyan-500',
  gradient: 'bg-gradient-to-r from-primary-500 to-primary-600',
};

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  max = 100,
  showValue = false,
  showPercentage = true,
  size = 'md',
  color = 'primary',
  variant = 'default',
  className,
  labelClassName,
  valueClassName,
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const displayValue = showPercentage ? `${Math.round(percentage)}%` : value.toString();

  return (
    <div className={clsx('w-full', className)}>
      {/* Label and Value */}
      {(label || showValue || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className={clsx(
              'text-sm font-medium text-neutral-700',
              labelClassName
            )}>
              {label}
            </span>
          )}
          
          {(showValue || showPercentage) && (
            <span className={clsx(
              'text-sm font-semibold text-neutral-900',
              valueClassName
            )}>
              {displayValue}
            </span>
          )}
        </div>
      )}
      
      {/* Progress Bar Container */}
      <div className={clsx(
        'w-full bg-neutral-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        {/* Progress Bar Fill */}
        <div
          className={clsx(
            'h-full transition-all duration-500 ease-out rounded-full relative',
            colorClasses[color],
            variant === 'striped' && 'bg-striped',
            variant === 'animated' && 'animate-pulse-soft'
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Striped Effect */}
          {variant === 'striped' && (
            <div 
              className="absolute inset-0 bg-white bg-opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,.1) 4px, rgba(255,255,255,.1) 8px)'
              }}
            />
          )}
          
          {/* Animated Striped Effect */}
          {variant === 'animated' && (
            <div 
              className="absolute inset-0 bg-white bg-opacity-20 animate-slide-in-right"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,.1) 4px, rgba(255,255,255,.1) 8px)',
                animation: 'slide-right 1s linear infinite'
              }}
            />
          )}
        </div>
      </div>
      
      {/* Additional Information */}
      {max !== 100 && showValue && (
        <div className="mt-1 text-xs text-neutral-500">
          {value} / {max}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;