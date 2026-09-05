import { SelectHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, className, id, children, ...rest },
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
      <select
        ref={ref}
        id={id}
        className={clsx(
          'w-full rounded-[11px] border border-line bg-surface px-3.5 py-[11px] text-sm text-ink',
          'focus:border-cyan focus:outline-none focus:ring-[3px] focus:ring-cyan/[0.16]',
          className
        )}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
});

export default Select;
