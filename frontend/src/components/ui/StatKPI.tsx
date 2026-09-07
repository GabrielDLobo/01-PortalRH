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

const DELTA_STYLE: Record<DeltaDirection, string> = {
  up: 'text-[#047857] bg-success/10',
  down: 'text-[#BE123C] bg-danger/[0.09]',
  flat: 'text-muted bg-surface-2',
};

interface StatKPIProps {
  icon: ReactNode;
  color: KPIColor;
  label: string;
  value: ReactNode;
  delta?: { direction: DeltaDirection; label: string };
  /** Relative heights (0-100) for the mini bar sparkline shown next to the icon. */
  sparkline?: number[];
}

export default function StatKPI({ icon, color, label, value, delta, sparkline }: StatKPIProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-[18px] shadow-sm">
      <span
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-cyan-600 to-violet opacity-90"
        aria-hidden="true"
      />
      <div className="flex items-center justify-between">
        <div className={clsx('grid h-10 w-10 place-items-center rounded-[11px]', ICON_BG[color])}>
          <span className="h-5 w-5">{icon}</span>
        </div>
        {sparkline && sparkline.length > 0 && (
          <div className="flex h-[26px] items-end gap-[3px]" aria-hidden="true">
            {sparkline.map((height, index) => (
              <i
                key={index}
                className="w-[5px] rounded-[2px] bg-gradient-to-b from-cyan to-cyan/25"
                style={{ height: `${Math.max(8, Math.min(100, height))}%` }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="mt-3.5 text-[12.5px] font-medium text-muted">{label}</div>
      <div className="mt-[3px] font-display text-[30px] font-bold tracking-[-.02em] text-ink [font-variant-numeric:tabular-nums]">
        {value}
      </div>
      {delta && (
        <div
          className={clsx(
            'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11.5px] font-semibold',
            DELTA_STYLE[delta.direction]
          )}
        >
          {delta.direction === 'up' && <span aria-hidden="true">▲</span>}
          {delta.direction === 'down' && <span aria-hidden="true">▼</span>}
          {delta.label}
        </div>
      )}
    </div>
  );
}
