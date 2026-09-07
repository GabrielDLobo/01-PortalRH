import { ReactNode } from 'react';

interface PageHeroProps {
  crumb: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  object3d?: ReactNode;
}

export default function PageHero({ crumb, eyebrow, title, subtitle, actions, object3d }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden bg-[radial-gradient(120%_160%_at_85%_-20%,#12203a,#0A101C_55%,#04070D)] px-5 pb-[92px] pt-[26px] text-white sm:px-[34px] max-[960px]:pb-20">
      <div
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(80%_120%_at_90%_0,#000,transparent_70%)]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,211,238,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-[60px] -top-20 h-[320px] w-[320px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(124,111,240,.28), transparent 65%)' }}
        aria-hidden="true"
      />
      {object3d}

      <div className="relative mb-[22px] flex items-center gap-3.5">
        <span className="text-xs text-[#7F93A0]">
          PortalRH <b className="font-medium text-[#B9C8D2]">/ {crumb}</b>
        </span>
        <span className="ml-auto inline-flex items-center gap-[7px] whitespace-nowrap rounded-full border border-cyan/[0.28] bg-cyan/[0.12] px-3 py-[7px] text-[11.5px] font-semibold text-cyan">
          <i className="h-[7px] w-[7px] animate-pulse rounded-full bg-cyan shadow-[0_0_8px_#22D3EE]" aria-hidden="true" />
          Modo demonstração
        </span>
      </div>

      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-[9px] text-[11.5px] font-semibold uppercase tracking-[.12em] text-cyan">
            {eyebrow}
          </div>
          <h1 className="font-display text-[26px] font-bold text-white sm:text-[30px]">{title}</h1>
          {subtitle && <p className="mt-[9px] max-w-[560px] text-sm text-[#93A6B3]">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}
