import React from 'react';
import clsx from 'clsx';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  className?: string;
  auto?: boolean; // Auto-fit columns
}

const getResponsiveClasses = (
  value: number | { sm?: number; md?: number; lg?: number; xl?: number } | undefined,
  prefix: string
) => {
  if (!value) return '';
  
  if (typeof value === 'number') {
    return `${prefix}-${value}`;
  }
  
  const classes = [];
  if (value.sm) classes.push(`sm:${prefix}-${value.sm}`);
  if (value.md) classes.push(`md:${prefix}-${value.md}`);
  if (value.lg) classes.push(`lg:${prefix}-${value.lg}`);
  if (value.xl) classes.push(`xl:${prefix}-${value.xl}`);
  
  return classes.join(' ');
};

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = { sm: 4, md: 6, lg: 6, xl: 6 },
  className,
  auto = false,
}) => {
  const colClasses = auto 
    ? 'grid-cols-[repeat(auto-fit,minmax(280px,1fr))]' 
    : getResponsiveClasses(cols, 'grid-cols');
  
  const gapClasses = getResponsiveClasses(gap, 'gap');

  return (
    <div
      className={clsx(
        'grid',
        colClasses,
        gapClasses,
        className
      )}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;