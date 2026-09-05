import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar, Topbar } from '../ui';
import LoadingSpinner from '../common/LoadingSpinner';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/employees': 'Funcionários',
  '/leaves': 'Férias',
  '/evaluations': 'Avaliações',
  '/terminations': 'Rescisões',
  '/reports': 'Relatórios',
  '/admission': 'Admissão',
  '/profile': 'Meu perfil',
};

function pageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/employees/')) return 'Funcionário';
  return 'PortalRH';
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isLoading } = useAuth();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="min-w-0 flex-1">
        <Topbar title={pageTitle(pathname)} onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="mx-auto max-w-[1180px] px-4 py-[26px] sm:px-[30px] sm:pb-11">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
