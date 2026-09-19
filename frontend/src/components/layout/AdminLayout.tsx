import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      label: t('admin.overview', 'Platform Overview'),
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: t('admin.businesses', 'Tenants & Businesses'),
      path: '/admin/businesses',
      icon: Building2,
    },
    {
      label: t('admin.users', 'Platform Users'),
      path: '/admin/users',
      icon: Users,
    },
    {
      label: t('admin.reports', 'Platform Reports'),
      path: '/admin/reports',
      icon: BarChart3,
    },
    {
      label: t('admin.systemConfig', 'System Config'),
      path: '/admin/settings',
      icon: Settings,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/admin/dashboard' && (location.pathname === '/admin' || location.pathname === '/admin/dashboard')) {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 bg-white sticky top-0 z-50 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center">
            <img
              src="/Bizflow-logo-dark.png"
              alt="BizFlow"
              className="h-7 sm:h-8 w-auto max-w-[130px] object-contain"
            />
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-50 text-brand-700 border border-brand-200 uppercase">
            {t('common.admin', 'Admin')}
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-zinc-100 text-zinc-700 hover:text-zinc-900 cursor-pointer"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-white border-r border-zinc-200 flex flex-col justify-between p-4 transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-5">
          {/* Brand Logo */}
          <div className="px-2 py-1 space-y-1">
            <div className="flex items-center space-x-2">
              <Link to="/admin/dashboard" className="flex items-center bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 hover:opacity-95 transition-opacity">
                <img
                  src="/Bizflow-logo-dark.png"
                  alt="BizFlow"
                  className="h-7 sm:h-8 w-auto max-w-[140px] object-contain"
                />
              </Link>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-50 text-brand-700 border border-brand-200 uppercase">
                {t('common.admin', 'Admin')}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium pl-0.5">{t('admin.governanceCenter', 'Platform Governance Center')}</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-1">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 py-1">
              {t('admin.platformAdmin', 'Platform Administration')}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-brand-600' : 'text-zinc-400'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Badge & Logout */}
        <div className="space-y-2 pt-3 border-t border-zinc-100">
          <div className="flex items-center space-x-2.5 px-2 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-zinc-900 truncate">{user?.fullName || 'Root Admin'}</p>
              <span className="text-[10px] text-brand-700 font-medium flex items-center space-x-1">
                <Zap size={10} className="text-brand-600" />
                <span>{t('admin.superAdmin', 'Super Administrator')}</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-zinc-50 hover:bg-red-50 text-zinc-600 hover:text-red-700 border border-zinc-200 hover:border-red-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>{t('admin.signOutAdmin', 'Sign Out Admin')}</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      {/* Main Admin Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F7F7F5] min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
