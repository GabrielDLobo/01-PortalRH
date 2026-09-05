import React from 'react';
import clsx from 'clsx';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 
           'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'leave' | 
           'performance' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  icon?: boolean | React.ReactNode;
  dot?: boolean;
  pulse?: boolean;
}

const variantClasses = {
  default: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  primary: 'bg-primary-100 text-primary-800 border-primary-200',
  secondary: 'bg-secondary-100 text-secondary-800 border-secondary-200',
  success: 'bg-success-100 text-success-800 border-success-200',
  warning: 'bg-warning-100 text-warning-800 border-warning-200',
  danger: 'bg-danger-100 text-danger-800 border-danger-200',
  active: 'bg-success-100 text-success-800 border-success-200',
  inactive: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  pending: 'bg-warning-100 text-warning-800 border-warning-200',
  approved: 'bg-success-100 text-success-800 border-success-200',
  rejected: 'bg-danger-100 text-danger-800 border-danger-200',
  leave: 'bg-accent-purple/10 text-purple-800 border-purple-200',
  performance: 'bg-accent-indigo/10 text-indigo-800 border-indigo-200',
  info: 'bg-accent-cyan/10 text-cyan-800 border-cyan-200',
};

const sizeClasses = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-sm',
};

const iconMap = {
  success: CheckCircleIcon,
  approved: CheckCircleIcon,
  danger: XCircleIcon,
  rejected: XCircleIcon,
  warning: ExclamationTriangleIcon,
  pending: ClockIcon,
  active: UserIcon,
  inactive: UserIcon,
  leave: CalendarIcon,
  performance: StarIcon,
};

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  icon = false,
  dot = false,
  pulse = false,
}) => {
  const IconComponent = icon === true ? iconMap[variant as keyof typeof iconMap] : null;
  
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium border transition-all duration-200',
        variantClasses[variant],
        sizeClasses[size],
        pulse && 'animate-pulse-soft',
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'flex-shrink-0 h-1.5 w-1.5 rounded-full mr-1.5',
            {
              'bg-success-400': variant === 'success' || variant === 'approved' || variant === 'active',
              'bg-danger-400': variant === 'danger' || variant === 'rejected',
              'bg-warning-400': variant === 'warning' || variant === 'pending',
              'bg-neutral-400': variant === 'inactive' || variant === 'default',
              'bg-primary-400': variant === 'primary',
              'bg-purple-400': variant === 'leave',
              'bg-indigo-400': variant === 'performance',
              'bg-cyan-400': variant === 'info',
            }
          )}
        />
      )}
      
      {IconComponent && (
        <IconComponent className={clsx(
          'flex-shrink-0 mr-1',
          size === 'xs' ? 'h-3 w-3' : size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
        )} />
      )}
      
      {icon && typeof icon !== 'boolean' && (
        <span className={clsx(
          'flex-shrink-0 mr-1',
          size === 'xs' ? 'h-3 w-3' : size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
        )}>
          {icon}
        </span>
      )}
      
      <span className="truncate">
        {children}
      </span>
    </span>
  );
};

export default Badge;