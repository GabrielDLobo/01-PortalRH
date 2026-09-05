import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, icon, className, id, ...rest },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[.09em] text-muted"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={clsx(
            'w-full rounded-[11px] border border-line bg-surface px-3.5 py-[11px] text-sm text-ink placeholder:text-muted',
            'focus:border-cyan focus:outline-none focus:ring-[3px] focus:ring-cyan/[0.16]',
            icon && 'pl-9',
            error && 'border-danger',
            className
          )}
          {...rest}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Input;
