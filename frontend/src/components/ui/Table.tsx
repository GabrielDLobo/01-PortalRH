import { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import clsx from 'clsx';

export function TableContainer({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}

export function Th({ children, className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={clsx(
        'border-b border-line-2 bg-surface-2 px-[18px] py-[11px] text-left text-[10.5px] font-semibold uppercase tracking-[.07em] text-muted',
        className
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

export function Td({ children, className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={clsx(
        'whitespace-nowrap border-b border-line-2 px-[18px] py-3 text-[13px] text-ink',
        className
      )}
      {...rest}
    >
      {children}
    </td>
  );
}

export function Tr({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={clsx('hover:bg-surface-2 [&:last-child_td]:border-b-0', className)}>{children}</tr>;
}
