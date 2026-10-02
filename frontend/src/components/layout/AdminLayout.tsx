import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Server,
  Activity,
  LucideIcon,
} from 'lucide-react';

interface NavGroup {
  groupTitle?: string;
  items: {
    label: string;
    path: string;
    icon: LucideIcon;
  }[];
}

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bizflow_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bizflow_admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navGroups: NavGroup[] = [
    {
      groupTitle: t('admin.corePlatform', 'Core Platform'),
      items: [
        {
          label: t('admin.overview', 'Platform Overview'),
          path: '/admin/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      groupTitle: t('admin.tenantsAccess', 'Tenants & Access'),
      items: [
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
      ],
    },
    {
      groupTitle: t('admin.intelligenceSystem', 'Intelligence & Governance'),
      items: [
        {
          label: t('admin.reports', 'Platform Intelligence'),
          path: '/admin/reports',
          icon: BarChart3,
        },
        {
          label: t('admin.systemConfig', 'System Configuration'),
          path: '/admin/config',
          icon: Settings,
        },
      ],
    },
  ];

  const isItemActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col md:flex-row font-sans text-slate-900 antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-950 text-white border-b border-slate-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center space-x-2">
            <Link to="/admin/dashboard" className="flex items-center bg-slate-950 px-2 py-1 rounded-xl">
              <img
                src="/Bizflow-logo-dark.png"
                alt="BizFlow"
                className="h-7 sm:h-8 w-auto max-w-[130px] object-contain"
              />
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/30 uppercase">
            {t('common.admin', 'Super Admin')}
          </span>
        </div>
      </header>

      {/* Sidebar Navigation - Sleek Minimalist Navy / Clay Accent */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-slate-950 text-slate-300 flex flex-col justify-between transition-all duration-300 ease-in-out md:static md:inset-auto md:min-h-screen shadow-2xl md:shadow-none border-r border-slate-800/80 ${
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${
          sidebarCollapsed
            ? 'md:w-0 md:opacity-0 md:-translate-x-full md:border-r-0 md:pointer-events-none md:overflow-hidden'
            : 'w-64 md:w-64 md:opacity-100'
        }`}
      >
        <div className="flex flex-col h-full w-64 min-w-[16rem]">
          {/* Logo & Platform Brand Badge */}
          <div className="p-4 border-b border-slate-800/80">
            <Link to="/admin/dashboard" className="flex items-center group py-1">
              <img
                src="/Bizflow-logo-dark.png"
                alt="BizFlow"
                className="h-8 sm:h-9 w-auto max-w-[160px] object-contain group-hover:scale-102 transition-transform"
              />
            </Link>

            {/* Super Admin / Governance Card */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex items-center space-x-3 shadow-inner">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                <ShieldCheck size={18} />
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">
                  {t('admin.platformGovernance', 'Platform Governance')}
                </h4>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span className="text-[10px] text-cyan-300/90 font-semibold tracking-wider uppercase truncate">
                    {t('admin.rootAdmin', 'Super Administrator')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links Hierarchy */}
          <nav className="p-3 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {group.groupTitle && (
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {group.groupTitle}
                  </div>
                )}

                {group.items.map((item) => {
                  const active = isItemActive(item.path);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-gradient-to-r from-brand-600 via-blue-600 to-cyan-600 text-white font-bold shadow-md shadow-brand-600/30'
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
            ))}
          </nav>

          {/* Bottom System Engine Status Widget */}
          <div className="p-3 border-t border-slate-800/80">
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-md space-y-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white flex items-center justify-center shadow-xs">
                  <Activity size={14} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white leading-tight">{t('admin.systemEngine', 'System Engine')}</h5>
                  <span className="text-[10px] text-cyan-400 font-medium">{t('admin.systemEngineStack', 'PostgreSQL 17.6 + Spring')}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {t('admin.tenantIsolationDesc', 'Tenant isolation and real-time audit logging active.')}
              </p>
              <Link
                to="/admin/config"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-1.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[11px] font-bold border border-cyan-500/30 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>{t('admin.systemConfig', 'System Config')}</span>
                <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* User Profile & Logout Bottom Bar */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center space-x-2.5 overflow-hidden flex-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 via-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user?.fullName ? user.fullName.charAt(0) : 'A'}
                </div>
                <div className="overflow-hidden min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {user?.fullName || 'Root Admin'}
                  </p>
                  <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {t('admin.superAdminBadge', 'SUPER ADMIN')}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title={t('admin.signOutAdmin', 'Sign Out Admin')}
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

      {/* Main Content Area with Desktop Top Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F4F6FB]">
        {/* Top Header - Minimalist Claymorphic Surface */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 items-center justify-between sticky top-0 z-20 shadow-xs">
          {/* Left: Sidebar Toggle + Platform Branding Header */}
          <div className="flex items-center space-x-3.5">
            {/* Sidebar Hide / Unhide Toggle Button - Three Line Menu Icon */}
            <button
              onClick={toggleSidebar}
              title={sidebarCollapsed ? t('admin.showSidebar', 'Show sidebar (Ctrl+B)') : t('admin.hideSidebar', 'Hide sidebar (Ctrl+B)')}
              className={`p-2 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center ${
                sidebarCollapsed
                  ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 ring-1 ring-slate-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            >
              <Menu size={19} />
            </button>

            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <ShieldAlert size={15} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                {t('admin.platformManagement', 'BizFlow Platform Management')}
              </h2>
              <span className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider">
                {t('admin.superAdminConsole', 'Super Administrator Console')}
              </span>
            </div>
          </div>

          {/* Right actions: System Status, Multi-Tenant Pill, User & Email */}
          <div className="flex items-center space-x-3.5">
            {/* System Status badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('admin.systemOperational', 'Engine Operational')}</span>
            </div>

            {/* Multi-Tenant SaaS badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full clay-badge-blue text-xs font-bold">
              <Server size={12} className="text-brand-600" />
              <span>{t('admin.multiTenantBadge', 'Multi-Tenant SaaS')}</span>
            </div>

            <div className="h-5 w-px bg-slate-200"></div>

            {/* Admin User Profile Info */}
            <div className="flex items-center space-x-3 p-1 rounded-xl">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.fullName || 'Root Admin'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {user?.email || 'admin@bizflow.io'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.fullName ? user.fullName.charAt(0) : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-7 bg-[#F4F6FB]">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
