import { Bars3Icon } from '@heroicons/react/24/outline';

interface TopbarProps {
  onMenuClick?: () => void;
}

/**
 * Mobile-only menu trigger. On the v2 shell the page title, breadcrumb and
 * demo badge all live inside each screen's PageHero, so this bar only needs
 * to expose the sidebar toggle below the lg breakpoint.
 */
export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center bg-dark px-4 py-2.5 lg:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menu"
        className="text-[#B9C8D2] hover:text-white"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      <span className="ml-3 font-display text-[15px] font-bold tracking-[-.02em] text-white">
        Portal<span className="text-cyan">RH</span>
      </span>
    </div>
  );
}
