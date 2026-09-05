import { ReactNode } from 'react';
import clsx from 'clsx';

export type KPIColor = 'cyan' | 'violet' | 'human' | 'warning';
export type DeltaDirection = 'up' | 'down' | 'flat';

const ICON_BG: Record<KPIColor, string> = {
  cyan: 'bg-cyan/10 text-cyan-700',
  violet: 'bg-violet/10 text-violet',
  human: 'bg-human/[0.16] text-[#E06A3C]',
  warning: 'bg-warning/10 text-[#B45309]',
};

const DELTA_COLOR: Record<DeltaDirection, string> = {
  up: 'text-success',
  down: 'text-danger',
  flat: 'text-muted',
};

interface StatKPIProps {
  icon: ReactNode;
  color: KPIColor;
  label: string;
  value: ReactNode;
  delta?: { direction: DeltaDirection; label: string };
}

export default function StatKPI({ icon, color, label, value, delta }: StatKPIProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-[18px] shadow-sm">
      <div className={clsx('mb-3.5 grid h-[38px] w-[38px] place-items-center rounded-[10px]', ICON_BG[color])}>
        <span className="h-5 w-5">{icon}</span>
      </div>
      <div className="text-[12.5px] font-medium text-muted">{label}</div>
      <div className="mt-[3px] font-display text-[29px] font-bold tracking-[-.02em] text-ink [font-variant-numeric:tabular-nums]">
        {value}
      </div>
      {delta && (
        <div className={clsx('mt-[7px] inline-flex items-center gap-1 text-[11.5px] font-semibold', DELTA_COLOR[delta.direction])}>
          {delta.direction === 'up' && <span aria-hidden="true">▲</span>}
          {delta.direction === 'down' && <span aria-hidden="true">▼</span>}
          {delta.label}
        </div>
      )}
    </div>
  );
}
