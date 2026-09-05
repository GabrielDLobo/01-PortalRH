import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export default function Card({ title, subtitle, children, className, bodyClassName }: CardProps) {
  return (
    <div className={clsx('rounded-2xl border border-line bg-surface shadow-sm', className)}>
      {(title || subtitle) && (
        <div className="flex items-center justify-between border-b border-line-2 px-[18px] py-4">
          {title && <h3 className="text-[15px] font-semibold text-ink">{title}</h3>}
          {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
        </div>
      )}
      <div className={clsx('p-[18px]', bodyClassName)}>{children}</div>
    </div>
  );
}
