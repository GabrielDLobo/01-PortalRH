import clsx from 'clsx';

export type PillVariant = 'ok' | 'pend' | 'rej' | 'fer';

const STYLES: Record<PillVariant, string> = {
  ok: 'bg-success/10 text-[#047857]',
  pend: 'bg-warning/10 text-[#B45309]',
  rej: 'bg-danger/10 text-[#BE123C]',
  fer: 'bg-cyan/[0.12] text-cyan-700',
};

const DOT: Record<PillVariant, string> = {
  ok: 'bg-success',
  pend: 'bg-warning',
  rej: 'bg-danger',
  fer: 'bg-cyan-600',
};

interface StatusPillProps {
  variant: PillVariant;
  label: string;
}

export default function StatusPill({ variant, label }: StatusPillProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold',
        STYLES[variant]
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', DOT[variant])} aria-hidden="true" />
      {label}
    </span>
  );
}
