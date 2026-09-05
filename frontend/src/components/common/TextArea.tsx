import React, { useState } from 'react';
import clsx from 'clsx';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  autoResize?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      showCharCount = false,
      maxLength,
      resize = 'vertical',
      autoResize = false,
      className,
      onChange,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(props.defaultValue?.toString().length || 0);
    const hasError = !!error;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setCharCount(value.length);
      
      if (autoResize) {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
      
      if (onChange) {
        onChange(e);
      }
    };

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div className={clsx('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={props.id}
            className="mb-1 text-sm font-medium text-neutral-700"
          >
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <textarea
            ref={ref}
            className={clsx(
              'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 px-3 py-2',
              {
                'border-neutral-300 focus:ring-primary-500 focus:border-transparent': !hasError,
                'border-danger-300 focus:ring-danger-500 focus:border-transparent': hasError,
              },
              resizeClasses[resize],
              autoResize && 'overflow-hidden',
              className
            )}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <div className="flex-1">
            {(error || helperText) && (
              <p
                className={clsx(
                  'text-sm',
                  hasError ? 'text-danger-600' : 'text-neutral-500'
                )}
              >
                {error || helperText}
              </p>
            )}
          </div>
          
          {showCharCount && (maxLength || charCount > 0) && (
            <div className={clsx(
              'text-xs',
              maxLength && charCount > maxLength * 0.9 ? 'text-warning-600' :
              maxLength && charCount >= maxLength ? 'text-danger-600' :
              'text-neutral-500'
            )}>
              {charCount}{maxLength && `/${maxLength}`}
            </div>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;