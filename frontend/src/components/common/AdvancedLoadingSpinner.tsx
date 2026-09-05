import React from 'react';
import clsx from 'clsx';

interface AdvancedLoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse' | 'ring' | 'gradient';
  color?: 'primary' | 'white' | 'gray' | 'success' | 'warning' | 'danger';
  className?: string;
  text?: string;
  overlay?: boolean;
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const colorClasses = {
  primary: 'text-primary-600',
  white: 'text-white',
  gray: 'text-neutral-400',
  success: 'text-success-600',
  warning: 'text-warning-600',
  danger: 'text-danger-600',
};

const AdvancedLoadingSpinner: React.FC<AdvancedLoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  className,
  text,
  overlay = false,
}) => {
  const renderSpinner = () => {
    const baseClasses = clsx(sizeClasses[size], colorClasses[color]);

    switch (variant) {
      case 'dots':
        return (
          <div className={clsx('flex space-x-1', className)}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={clsx(
                  'rounded-full animate-bounce',
                  size === 'xs' ? 'h-1 w-1' :
                  size === 'sm' ? 'h-1.5 w-1.5' :
                  size === 'md' ? 'h-2 w-2' :
                  size === 'lg' ? 'h-3 w-3' : 'h-4 w-4',
                  colorClasses[color].replace('text-', 'bg-')
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );

      case 'bars':
        return (
          <div className={clsx('flex items-end space-x-0.5', className)}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={clsx(
                  'animate-pulse',
                  size === 'xs' ? 'w-0.5 h-3' :
                  size === 'sm' ? 'w-0.5 h-4' :
                  size === 'md' ? 'w-1 h-8' :
                  size === 'lg' ? 'w-1.5 h-12' : 'w-2 h-16',
                  colorClasses[color].replace('text-', 'bg-')
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div
            className={clsx(
              'rounded-full animate-ping',
              baseClasses,
              colorClasses[color].replace('text-', 'bg-'),
              className
            )}
          />
        );

      case 'ring':
        return (
          <div className={clsx(baseClasses, 'animate-spin', className)}>
            <svg className="h-full w-full" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="32"
                strokeDashoffset="32"
                className="animate-spin"
              />
            </svg>
          </div>
        );

      case 'gradient':
        return (
          <div className={clsx(baseClasses, 'animate-spin', className)}>
            <svg className="h-full w-full" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="url(#spinner-gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="32"
                strokeDashoffset="8"
              />
              <defs>
                <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        );

      default: // spinner
        return (
          <div
            className={clsx(
              'animate-spin rounded-full border-2 border-transparent border-t-current border-r-current',
              baseClasses,
              className
            )}
          />
        );
    }
  };

  const content = (
    <div className={clsx(
      'flex flex-col items-center justify-center space-y-2',
      overlay && 'min-h-[120px]'
    )}>
      {renderSpinner()}
      {text && (
        <p className={clsx(
          'text-sm font-medium animate-pulse-soft',
          colorClasses[color]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm animate-fade-in">
        {content}
      </div>
    );
  }

  return content;
};

export default AdvancedLoadingSpinner;