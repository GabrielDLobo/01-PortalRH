import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar, Topbar } from '../ui';
import LoadingSpinner from '../common/LoadingSpinner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isLoading } = useAuth();
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
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
