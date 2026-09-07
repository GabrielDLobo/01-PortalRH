import { ReactNode } from 'react';
import clsx from 'clsx';

interface PageBodyProps {
  children: ReactNode;
  className?: string;
}

export default function PageBody({ children, className }: PageBodyProps) {
  return (
    <div className={clsx('relative -mt-16 px-5 pb-11 sm:px-[34px]', className)}>{children}</div>
  );
}
