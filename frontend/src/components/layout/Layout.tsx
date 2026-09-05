import React, { useState } from 'react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../common/LoadingSpinner';
import LanguageToggle from '../common/LanguageToggle';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const { t } = useLanguage();

  const navigationItems = [
    { name: t('navigation.dashboard'), href: '/', icon: HomeIcon, roles: ['admin_rh'] },
    { name: t('navigation.employees'), href: '/employees', icon: UsersIcon, roles: ['admin_rh'] },
    { name: t('navigation.admission'), href: '/admission', icon: DocumentTextIcon },
    { name: t('navigation.leaves'), href: '/leaves', icon: CalendarDaysIcon, roles: ['admin_rh'] },
    { name: t('navigation.evaluations'), href: '/evaluations', icon: ChartBarIcon, roles: ['admin_rh'] },
    { name: t('navigation.terminations'), href: '/terminations', icon: ClipboardDocumentListIcon, roles: ['admin_rh'] },
    { name: t('navigation.reports'), href: '/reports', icon: DocumentChartBarIcon, roles: ['admin_rh'] },
  ];

  const canAccessItem = (item: any) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar - seguindo padrão da tela de login */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 transform ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        
        {/* Background Pattern - mesmo da tela de login */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-white rounded-full"></div>
        </div>

        <div className="relative h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-soft-lg">
                <span className="text-lg font-bold text-primary-600">HR</span>
              </div>
              <h2 className="text-xl font-bold text-white">PortalRH</h2>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-white hover:text-primary-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 pb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.first_name || user?.email}
                  </p>
                  <p className="text-xs text-primary-200 truncate">
                    {user?.role_display}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 space-y-2">
            {navigationItems.map((item) => {
              if (!canAccessItem(item)) return null;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group ${
                      isActive
                        ? 'bg-white/20 text-white backdrop-blur-sm border border-white/30'
                        : 'text-primary-100 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-6 space-y-2">
            <NavLink
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-primary-100 hover:bg-white/10 hover:text-white transition-all duration-300"
            >
              <UserCircleIcon className="mr-3 h-5 w-5" />
              {t('navigation.profile')}
            </NavLink>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-primary-100 hover:bg-white/10 hover:text-white transition-all duration-300"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              {t('auth.logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <div className="lg:hidden ml-4">
                  <h1 className="text-xl font-bold text-primary-600">PortalRH</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <LanguageToggle />
                <div className="text-sm text-neutral-600">
                  {user?.first_name || user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;