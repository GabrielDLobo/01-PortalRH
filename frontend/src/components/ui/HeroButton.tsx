import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface HeroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'ghost';
  icon?: ReactNode;
  children: ReactNode;
}

export default function HeroButton({ variant = 'ghost', icon, children, className, ...rest }: HeroButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center gap-2 rounded-[11px] px-[15px] py-2.5 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'solid'
          ? 'bg-gradient-to-r from-cyan-600 to-violet text-dark shadow-[0_8px_22px_rgba(34,211,238,.3)] hover:brightness-105'
          : 'border border-white/[0.14] bg-white/[0.08] text-[#DCE7ED] hover:bg-white/[0.14]',
        className
      )}
      {...rest}
    >
      {icon && <span className="h-[15px] w-[15px] flex-none">{icon}</span>}
      {children}
    </button>
  );
}
