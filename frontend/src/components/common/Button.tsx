import React from 'react';
import clsx from 'clsx';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border border-blue-600',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 border border-gray-300',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border border-green-600',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 border border-yellow-500',
  error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-red-600',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border border-gray-300',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner
            size={size === 'sm' ? 'sm' : 'sm'}
            color={variant === 'secondary' || variant === 'ghost' ? 'gray' : 'white'}
            className="mr-2"
          />
          {children}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={clsx('mr-2', size === 'sm' ? 'h-4 w-4' : 'h-5 w-5')}>
              {icon}
            </span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className={clsx('ml-2', size === 'sm' ? 'h-4 w-4' : 'h-5 w-5')}>
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;