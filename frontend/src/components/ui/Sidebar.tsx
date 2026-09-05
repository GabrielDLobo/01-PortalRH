import {
  Squares2X2Icon,
  UsersIcon,
  CalendarDaysIcon,
  TrophyIcon,
  UserMinusIcon,
  DocumentChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from './Avatar';

interface NavItem {
  label: string;
  href: string;
  icon: typeof Squares2X2Icon;
  adminOnly?: boolean;
}

const MENU_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: Squares2X2Icon },
  { label: 'Funcionários', href: '/employees', icon: UsersIcon, adminOnly: true },
  { label: 'Férias', href: '/leaves', icon: CalendarDaysIcon },
  { label: 'Avaliações', href: '/evaluations', icon: TrophyIcon, adminOnly: true },
  { label: 'Rescisões', href: '/terminations', icon: UserMinusIcon, adminOnly: true },
  { label: 'Relatórios', href: '/reports', icon: DocumentChartBarIcon, adminOnly: true },
];

const ACCOUNT_ITEMS: NavItem[] = [{ label: 'Meu perfil', href: '/profile', icon: UserCircleIcon }];

function NavGroup({ label, items, isAdmin }: { label: string; items: NavItem[]; isAdmin: boolean }) {
  const visible = items.filter((item) => !item.adminOnly || isAdmin);
  if (visible.length === 0) return null;
  return (
    <>
      <div className="px-2.5 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-[.1em] text-muted">
        {label}
      </div>
      {visible.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          end={item.href === '/'}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-[11px] rounded-[10px] px-[11px] py-[9px] text-[13.5px] font-medium transition-colors',
              isActive
                ? 'bg-gradient-to-r from-cyan/[0.14] to-cyan/[0.04] font-semibold text-cyan-700'
                : 'text-muted hover:bg-surface-2 hover:text-ink'
            )
          }
        >
          <item.icon className="h-[18px] w-[18px] flex-none" />
          {item.label}
        </NavLink>
      ))}
    </>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin_rh';

  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] flex-none flex-col gap-1 border-r border-line bg-surface p-3.5 lg:flex">
      <div className="flex items-center gap-2.5 px-2 pb-[18px] pt-1.5">
        <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-gradient-to-br from-cyan to-violet shadow-[0_4px_14px_rgba(34,211,238,.35)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#04070D"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
            aria-hidden="true"
          >
            <path d="M4 20v-1a5 5 0 0 1 5-5h1" />
            <circle cx="10.5" cy="7.5" r="3.5" />
            <path d="M15 12l2.2 2.2L21 10.4" />
          </svg>
        </span>
        <span className="font-display text-[17px] font-bold tracking-[-.02em] text-ink">
          Portal<b className="text-cyan-700">RH</b>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        <NavGroup label="Menu" items={MENU_ITEMS} isAdmin={isAdmin} />
        <NavGroup label="Conta" items={ACCOUNT_ITEMS} isAdmin={isAdmin} />
      </nav>

      <div className="mt-auto flex items-center gap-2.5 rounded-[11px] border border-line bg-surface-2 p-2.5">
        <Avatar name={user?.full_name || user?.email || '?'} size="md" />
        <span className="min-w-0 flex-1 text-[12.5px] leading-tight">
          <b className="block truncate font-semibold text-ink">{user?.full_name}</b>
          <span className="text-[11px] text-muted">{user?.role_display}</span>
        </span>
        <button
          type="button"
          onClick={logout}
          title="Sair"
          aria-label="Sair"
          className="text-muted transition-colors hover:text-danger"
        >
          <ArrowRightOnRectangleIcon className="h-[18px] w-[18px]" />
        </button>
      </div>
    </aside>
  );
}
