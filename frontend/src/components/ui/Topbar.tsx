import { ReactNode } from 'react';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface TopbarProps {
  title: string;
  actions?: ReactNode;
  onMenuClick?: () => void;
}

export default function Topbar({ title, actions, onMenuClick }: TopbarProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-[18px] border-b border-line bg-bg/85 px-4 py-3.5 backdrop-blur-sm sm:px-[30px]">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menu"
        className="text-muted hover:text-ink lg:hidden"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      <h1 className="text-[19px] font-semibold text-ink">{title}</h1>
      <div className="ml-2 hidden max-w-[340px] flex-1 items-center gap-2.5 rounded-[11px] border border-line bg-surface px-3.5 py-2.5 text-muted md:flex">
        <MagnifyingGlassIcon className="h-4 w-4 flex-none" />
        <input
          placeholder="Buscar funcionário, solicitação..."
          className="w-full border-0 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-muted"
        />
      </div>
      <span className="ml-auto inline-flex items-center gap-[7px] whitespace-nowrap rounded-full border border-cyan/25 bg-cyan/10 px-3 py-[7px] text-xs font-semibold text-cyan-700">
        <i className="h-[7px] w-[7px] animate-pulse rounded-full bg-cyan-600 shadow-[0_0_8px_#22D3EE]" aria-hidden="true" />
        <span className="hidden sm:inline">Modo demonstração</span>
      </span>
      {actions}
    </div>
  );
}
