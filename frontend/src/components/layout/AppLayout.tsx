import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  ShieldAlert,
  Percent,
  ChevronRight,
  Receipt,
  CircleDollarSign,
  TrendingDown,
  Contact,
  Star,
  Boxes,
  BarChart3,
  FileText,
  Sparkles,
  FolderTree,
  LucideIcon
} from 'lucide-react';

interface NavGroup {
  groupTitle?: string;
  items: {
    label: string;
    path: string;
    icon: LucideIcon;
    roles: ('OWNER' | 'STAFF' | 'ADMIN')[];
    requiresInventory?: boolean;
    ownerOnly?: boolean;
  }[];
}

export const AppLayout: React.FC = () => {
  const { user, business, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOwner = user?.role === 'OWNER';
  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups: NavGroup[] = [
    {
      items: [
        {
          label: t('nav.overview', 'Overview'),
          path: '/dashboard',
          icon: LayoutDashboard,
          roles: ['OWNER', 'STAFF'],
        },
      ],
    },
    {
      groupTitle: t('nav.business', 'Business'),
      items: [
        {
          label: t('nav.products', 'Products & Services'),
          path: '/dashboard/products',
          icon: Package,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: t('nav.categories', 'Categories'),
          path: '/dashboard/categories',
          icon: FolderTree,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: t('nav.customers', 'Customers'),
          path: '/dashboard/customers',
          icon: Contact,
          roles: ['OWNER', 'STAFF'],
        },
      ],
    },
    {
      groupTitle: t('nav.operations', 'Operations'),
      items: [
        {
          label: t('nav.pos', 'POS Billing'),
          path: '/dashboard/pos',
          icon: Receipt,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: t('nav.bills', 'Invoices & Orders'),
          path: '/dashboard/bills',
          icon: CircleDollarSign,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: t('nav.expenses', 'Expenses'),
          path: '/dashboard/expenses',
          icon: TrendingDown,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: t('nav.inventory', 'Inventory'),
          path: '/dashboard/inventory',
          icon: Boxes,
          roles: ['OWNER', 'STAFF'],
          requiresInventory: true,
        },
      ],
    },
    {
      groupTitle: t('nav.insights', 'Insights'),
      items: [
        {
          label: t('nav.analytics', 'Analytics'),
          path: '/dashboard/analytics',
          icon: BarChart3,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: t('nav.reviews', 'Review Boost'),
          path: '/dashboard/reviews',
          icon: Star,
          roles: ['OWNER', 'STAFF'],
        },
      ],
    },
    {
      groupTitle: t('nav.tools', 'Tools'),
      items: [
        {
          label: t('nav.aiAssistant', 'AI Assistant'),
          path: '/dashboard/ai-assistant',
          icon: Sparkles,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: t('nav.reports', 'Reports'),
          path: '/dashboard/reports',
          icon: FileText,
          roles: ['OWNER', 'STAFF'],
        },
      ],
    },
  ];

  const getBusinessTypeBadgeColor = (type?: string) => {
    switch (type) {
      case 'RETAIL':
        return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'RESTAURANT':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'CAFE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'BAKERY':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'SALON':
      case 'BEAUTY_PARLOUR':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'MOBILE_STORE':
      case 'ELECTRONICS':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'SERVICE':
        return 'bg-brand-50 text-brand-700 border-brand-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const isItemActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-950 text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center space-x-2">
            <Link to="/dashboard" className="flex items-center">
              <img
                src="/Bizflow-logo.png"
                alt="BizFlow"
                className="h-8 w-auto max-w-[140px] object-contain"
              />
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {business && (
            <span
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getBusinessTypeBadgeColor(
                business.businessType
              )}`}
            >
              {business.businessType}
            </span>
          )}
        </div>
      </header>

      {/* Sidebar Navigation - Sleek Navy Theme matching reference */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto md:min-h-screen shadow-2xl md:shadow-none border-r border-slate-800/70 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Tenant Header */}
          <div className="p-4 border-b border-slate-800/80">
            <Link to="/dashboard" className="flex items-center group py-1">
              <img
                src="/Bizflow-logo-dark.png"
                alt="BizFlow"
                className="h-8 sm:h-9 w-auto max-w-[160px] object-contain group-hover:scale-105 transition-transform"
              />
            </Link>

            {business && (
              <div className="mt-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-cyan-400 border border-brand-500/30 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <Store size={15} />
                </div>
                <div className="overflow-hidden flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{business.name}</h4>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 font-medium truncate">
                      {business.businessType || t('dashboard.activeStore', 'Active Store')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {navGroups.map((group, gIdx) => {
              const visibleItems = group.items.filter((item) => {
                if (!user || !item.roles.includes(user.role)) return false;
                if (item.requiresInventory && business?.inventoryEnabled === false) return false;
                return true;
              });

              if (visibleItems.length === 0) return null;

              return (
                <div key={gIdx} className="space-y-1">
                  {group.groupTitle && (
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {group.groupTitle}
                    </div>
                  )}

                  {visibleItems.map((item) => {
                    const active = isItemActive(item.path);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          active
                            ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold shadow-md shadow-brand-600/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon size={16} className={active ? 'text-white' : 'text-slate-400'} />
                          <span>{item.label}</span>
                        </div>
                        {active && <ChevronRight size={13} className="text-white/80" />}
                      </Link>
                    );
                  })}
                </div>
              );
            })}

            {/* Owner Section: Settings & Staff */}
            {isOwner && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('nav.administration', 'Administration')}
                </div>
                <Link
                  to="/dashboard/staff"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    location.pathname.startsWith('/dashboard/staff')
                      ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Users size={16} className={location.pathname.startsWith('/dashboard/staff') ? 'text-white' : 'text-slate-400'} />
                    <span>{t('nav.staff', 'Staff Team')}</span>
                  </div>
                </Link>

                <Link
                  to="/dashboard/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    location.pathname.startsWith('/dashboard/settings')
                      ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Settings size={16} className={location.pathname.startsWith('/dashboard/settings') ? 'text-white' : 'text-slate-400'} />
                    <span>{t('nav.settings', 'Business Settings')}</span>
                  </div>
                </Link>
              </div>
            )}

            {isAdmin && (
              <div className="pt-2 border-t border-slate-800">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  {t('admin.portal', 'Platform Admin')}
                </div>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-cyan-400 hover:bg-cyan-950/40 hover:text-cyan-300 transition-colors mt-1"
                >
                  <ShieldAlert size={16} />
                  <span>{t('nav.adminDashboard', 'Admin Portal')}</span>
                </Link>
              </div>
            )}
          </nav>

          {/* User Profile & Logout Bottom Bar */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <Link
                to="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 overflow-hidden flex-1 group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user?.fullName ? user.fullName.charAt(0) : 'U'}
                </div>
                <div className="overflow-hidden min-w-0">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                    {user?.fullName}
                  </p>
                  <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                    {user?.role}
                  </span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                title={t('nav.logout', 'Logout')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Top Header matching reference image layout */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200/90 px-8 items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-base font-bold text-slate-900">
                {business ? business.name : t('common.platform', 'BizFlow Platform')}
              </h1>
              {business && (
                <span
                  className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${getBusinessTypeBadgeColor(
                    business.businessType
                  )}`}
                >
                  {business.businessType}
                </span>
              )}
            </div>

            {/* Quick POS & AI Shortcuts in Top Bar */}
            <div className="hidden lg:flex items-center space-x-2">
              <Link
                to="/dashboard/pos"
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
              >
                <Receipt size={13} />
                <span>{t('nav.pos', 'POS Billing')}</span>
              </Link>
              <Link
                to="/dashboard/ai-assistant"
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors"
              >
                <Sparkles size={13} />
                <span>{t('nav.aiAssistant', 'AI Assistant')}</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {business && business.taxRate !== undefined && business.taxRate > 0 && (
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <Percent size={12} className="text-brand-600" />
                <span>
                  {business.taxName || 'GST'}: {business.taxRate}%
                  {business.taxInclusive ? ` (${t('billing.inclusive', 'Incl.')})` : ''}
                </span>
              </div>
            )}

            <div className="h-5 w-px bg-slate-200"></div>

            <Link
              to="/dashboard/profile"
              className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity"
            >
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-[10px] text-slate-500">{user?.email}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.fullName ? user.fullName.charAt(0) : 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/70">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
