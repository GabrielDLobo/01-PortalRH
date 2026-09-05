import React from 'react';
import clsx from 'clsx';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean;
  onClick?: () => void;
}

const colorClasses = {
  primary: {
    bg: 'bg-primary-50',
    icon: 'text-primary-600',
    ring: 'ring-primary-500',
  },
  success: {
    bg: 'bg-success-50',
    icon: 'text-success-600',
    ring: 'ring-success-500',
  },
  warning: {
    bg: 'bg-warning-50',
    icon: 'text-warning-600',
    ring: 'ring-warning-500',
  },
  danger: {
    bg: 'bg-danger-50',
    icon: 'text-danger-600',
    ring: 'ring-danger-500',
  },
  info: {
    bg: 'bg-accent-cyan/10',
    icon: 'text-cyan-600',
    ring: 'ring-cyan-500',
  },
  neutral: {
    bg: 'bg-neutral-50',
    icon: 'text-neutral-600',
    ring: 'ring-neutral-500',
  },
};

const sizeClasses = {
  sm: {
    container: 'p-4',
    title: 'text-sm',
    value: 'text-2xl',
    icon: 'h-8 w-8',
    change: 'text-xs',
  },
  md: {
    container: 'p-6',
    title: 'text-sm',
    value: 'text-3xl',
    icon: 'h-10 w-10',
    change: 'text-sm',
  },
  lg: {
    container: 'p-8',
    title: 'text-base',
    value: 'text-4xl',
    icon: 'h-12 w-12',
    change: 'text-sm',
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'neutral',
  size = 'md',
  className,
  loading = false,
  onClick,
}) => {
  const colorConfig = colorClasses[color];
  const sizeConfig = sizeClasses[size];

  const isPositiveChange = change && change > 0;
  const isNegativeChange = change && change < 0;

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('pt-BR').format(val);
    }
    return val;
  };

  if (loading) {
    return (
      <div
        className={clsx(
          'bg-white rounded-xl border border-neutral-200 shadow-soft animate-pulse',
          sizeConfig.container,
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-neutral-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-neutral-200 rounded w-1/3"></div>
          </div>
          <div className={clsx(
            'rounded-full bg-neutral-200',
            sizeConfig.icon
          )}></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-neutral-200 shadow-soft hover:shadow-soft-lg transition-all duration-200',
        'animate-fade-in',
        sizeConfig.container,
        onClick && 'cursor-pointer hover:scale-105 active:scale-95',
        onClick && 'focus:outline-none focus:ring-2 focus:ring-offset-2',
        onClick && colorConfig.ring,
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className={clsx(
            'font-medium text-neutral-600 truncate',
            sizeConfig.title
          )}>
            {title}
          </p>
          
          <p className={clsx(
            'font-bold text-neutral-900 mt-2',
            sizeConfig.value
          )}>
            {formatValue(value)}
          </p>
          
          {change !== undefined && (
            <div className={clsx(
              'flex items-center mt-2',
              sizeConfig.change
            )}>
              <div className={clsx(
                'flex items-center',
                isPositiveChange && 'text-success-600',
                isNegativeChange && 'text-danger-600',
                change === 0 && 'text-neutral-500'
              )}>
                {isPositiveChange && <ArrowUpIcon className="h-3 w-3 mr-1" />}
                {isNegativeChange && <ArrowDownIcon className="h-3 w-3 mr-1" />}
                <span className="font-semibold">
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
              {changeLabel && (
                <span className="text-neutral-500 ml-2">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className={clsx(
            'flex-shrink-0 rounded-full p-2 ml-4',
            colorConfig.bg
          )}>
            <div className={clsx(
              sizeConfig.icon,
              colorConfig.icon
            )}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;