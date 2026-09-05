import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  help?: string; // Alias for helperText
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      help,
      icon,
      iconPosition = 'left',
      fullWidth = true,
      className,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className={clsx('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={props.id}
            className="mb-1 text-sm font-medium text-neutral-700"
          >
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <div className={clsx('h-5 w-5', hasError ? 'text-error-400' : 'text-neutral-400')}>
                {icon}
              </div>
            </div>
          )}
          
          <input
            ref={ref}
            className={clsx(
              'w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
              {
                'border-neutral-300 focus:ring-primary-500 focus:border-transparent': !hasError,
                'border-error-300 focus:ring-error-500 focus:border-transparent': hasError,
                'pl-10': icon && iconPosition === 'left',
                'pr-10': icon && iconPosition === 'right',
                'px-3 py-2': !icon,
              },
              className
            )}
            {...props}
          />
          
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <div className={clsx('h-5 w-5', hasError ? 'text-error-400' : 'text-neutral-400')}>
                {icon}
              </div>
            </div>
          )}
        </div>
        
        {(error || helperText || help) && (
          <p
            className={clsx(
              'mt-1 text-sm',
              hasError ? 'text-error-600' : 'text-neutral-500'
            )}
          >
            {error || helperText || help}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;