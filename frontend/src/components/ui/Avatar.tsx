import clsx from 'clsx';

const GRADIENTS: Array<[string, string]> = [
  ['#7C6FF0', '#22D3EE'],
  ['#22D3EE', '#06B6D4'],
  ['#FF9E7A', '#F59E0B'],
  ['#7C6FF0', '#06B6D4'],
  ['#22D3EE', '#7C6FF0'],
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-[30px] w-[30px] rounded-lg text-[11px]',
  md: 'h-[34px] w-[34px] rounded-[9px] text-[13px]',
};

export default function Avatar({ name, size = 'sm', className }: AvatarProps) {
  const [from, to] = GRADIENTS[hashName(name) % GRADIENTS.length];
  return (
    <span
      className={clsx(
        'inline-flex flex-none items-center justify-center font-display font-semibold text-white',
        SIZE_CLASSES[size],
        className
      )}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}
