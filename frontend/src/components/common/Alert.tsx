import React, { useState } from 'react';
import clsx from 'clsx';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

export type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode | boolean;
  actions?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const variantConfig = {
  success: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    title: 'text-success-800',
    message: 'text-success-700',
    icon: 'text-success-600',
    defaultIcon: CheckCircleIcon,
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    title: 'text-warning-800',
    message: 'text-warning-700',
    icon: 'text-warning-600',
    defaultIcon: ExclamationTriangleIcon,
  },
  danger: {
    bg: 'bg-danger-50',
    border: 'border-danger-200',
    title: 'text-danger-800',
    message: 'text-danger-700',
    icon: 'text-danger-600',
    defaultIcon: ExclamationCircleIcon,
  },
  info: {
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    title: 'text-primary-800',
    message: 'text-primary-700',
    icon: 'text-primary-600',
    defaultIcon: InformationCircleIcon,
  },
};

const sizeConfig = {
  sm: {
    padding: 'p-3',
    iconSize: 'h-5 w-5',
    titleSize: 'text-sm',
    messageSize: 'text-sm',
  },
  md: {
    padding: 'p-4',
    iconSize: 'h-5 w-5',
    titleSize: 'text-base',
    messageSize: 'text-sm',
  },
  lg: {
    padding: 'p-6',
    iconSize: 'h-6 w-6',
    titleSize: 'text-lg',
    messageSize: 'text-base',
  },
};

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  children,
  dismissible = false,
  onDismiss,
  icon = true,
  actions,
  className,
  size = 'md',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const config = variantConfig[variant];
  const sizeConf = sizeConfig[size];

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) {
    return null;
  }

  const IconComponent = config.defaultIcon;

  return (
    <div
      className={clsx(
        'rounded-lg border animate-fade-in-up',
        config.bg,
        config.border,
        sizeConf.padding,
        className
      )}
      role="alert"
    >
      <div className="flex">
        {/* Icon */}
        {icon && (
          <div className="flex-shrink-0">
            {icon === true ? (
              <IconComponent className={clsx(sizeConf.iconSize, config.icon)} />
            ) : (
              <div className={clsx(sizeConf.iconSize, config.icon)}>
                {icon}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className={clsx('flex-1', icon && 'ml-3')}>
          {title && (
            <h3 className={clsx(
              'font-semibold',
              sizeConf.titleSize,
              config.title,
              message && 'mb-1'
            )}>
              {title}
            </h3>
          )}

          {message && (
            <p className={clsx(sizeConf.messageSize, config.message)}>
              {message}
            </p>
          )}

          {children && (
            <div className={clsx(
              sizeConf.messageSize,
              config.message,
              (title || message) && 'mt-2'
            )}>
              {children}
            </div>
          )}

          {actions && (
            <div className="mt-3 flex space-x-2">
              {actions}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <div className="flex-shrink-0 ml-3">
            <button
              type="button"
              onClick={handleDismiss}
              className={clsx(
                'inline-flex rounded-md p-1.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
                config.icon,
                'hover:bg-black hover:bg-opacity-10',
                'focus:ring-current'
              )}
              aria-label="Dismiss"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;