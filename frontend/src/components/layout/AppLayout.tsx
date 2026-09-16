import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  Layers,
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
          label: 'Overview',
          path: '/dashboard',
          icon: LayoutDashboard,
          roles: ['OWNER', 'STAFF'],
        },
      ],
    },
    {
      groupTitle: 'Business',
      items: [
        {
          label: 'Products & Services',
          path: '/dashboard/products',
          icon: Package,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: 'Categories',
          path: '/dashboard/categories',
          icon: FolderTree,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: 'Customers',
          path: '/dashboard/customers',
          icon: Contact,
          roles: ['OWNER', 'STAFF'],
        },
      ],
    },
    {
      groupTitle: 'Operations',
      items: [
        {
          label: 'POS Billing',
          path: '/dashboard/pos',
          icon: Receipt,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: 'Invoices & Orders',
          path: '/dashboard/bills',
          icon: CircleDollarSign,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: 'Expenses',
          path: '/dashboard/expenses',
          icon: TrendingDown,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: 'Inventory',
          path: '/dashboard/inventory',
          icon: Boxes,
          roles: ['OWNER', 'STAFF'],
          requiresInventory: true,
        },
      ],
    },
    {
      groupTitle: 'Insights',
      items: [
        {
          label: 'Analytics',
          path: '/dashboard/analytics',
          icon: BarChart3,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: 'Review Boost',
          path: '/dashboard/reviews',
          icon: Star,
          roles: ['OWNER', 'STAFF'],
        },
      ],
    },
    {
      groupTitle: 'Tools',
      items: [
        {
          label: 'AI Assistant',
          path: '/dashboard/ai-assistant',
          icon: Sparkles,
          roles: ['OWNER', 'STAFF'],
        },
        {
          label: 'Reports',
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
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const isItemActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col md:flex-row font-sans text-zinc-900">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Layers size={14} />
            </div>
            <span className="font-extrabold text-zinc-950 tracking-tight text-base">BizFlow</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
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
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white text-zinc-700 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto md:min-h-screen shadow-xl md:shadow-none border-r border-zinc-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Tenant Header */}
          <div className="p-4 border-b border-zinc-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-extrabold text-zinc-950 tracking-tight block">BizFlow</span>
                <span className="text-[10px] text-brand-700 font-bold uppercase tracking-wider">
                  SaaS Business Suite
                </span>
              </div>
            </div>

            {business && (
              <div className="mt-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <Store size={14} />
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="text-xs font-bold text-zinc-900 truncate">{business.name}</h4>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-600"></span>
                    <span className="text-[10px] text-zinc-500 font-medium truncate">
                      {business.businessType || 'Active Store'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-4 flex-1 overflow-y-auto">
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
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
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
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          active
                            ? 'bg-brand-50 text-brand-700 font-bold'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon size={16} className={active ? 'text-brand-600' : 'text-zinc-400'} />
                          <span>{item.label}</span>
                        </div>
                        {active && <ChevronRight size={13} className="text-brand-600" />}
                      </Link>
                    );
                  })}
                </div>
              );
            })}

            {/* Owner Section: Settings & Staff */}
            {isOwner && (
              <div className="space-y-1 pt-2 border-t border-zinc-100">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Administration
                </div>
                <Link
                  to="/dashboard/staff"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname.startsWith('/dashboard/staff')
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Users size={16} className={location.pathname.startsWith('/dashboard/staff') ? 'text-brand-600' : 'text-zinc-400'} />
                    <span>Staff Team</span>
                  </div>
                </Link>

                <Link
                  to="/dashboard/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname.startsWith('/dashboard/settings')
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Settings size={16} className={location.pathname.startsWith('/dashboard/settings') ? 'text-brand-600' : 'text-zinc-400'} />
                    <span>Settings</span>
                  </div>
                </Link>
              </div>
            )}

            {isAdmin && (
              <div className="pt-2 border-t border-zinc-100">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-700">
                  Platform Admin
                </div>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors mt-1"
                >
                  <ShieldAlert size={16} />
                  <span>Admin Portal</span>
                </Link>
              </div>
            )}
          </nav>

          {/* User Profile & Logout Bottom Bar */}
          <div className="p-3 border-t border-zinc-200 bg-white">
            <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-200/80">
              <Link
                to="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 overflow-hidden flex-1 group"
              >
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user?.fullName ? user.fullName.charAt(0) : 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-zinc-900 truncate group-hover:text-brand-600 transition-colors">
                    {user?.fullName}
                  </p>
                  <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-700">
                    {user?.role}
                  </span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="hidden md:flex h-16 bg-white border-b border-zinc-200 px-8 items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center space-x-3">
            <h1 className="text-base font-bold text-zinc-900">
              {business ? business.name : 'BizFlow Platform'}
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

          <div className="flex items-center space-x-4">
            {business && business.taxRate !== undefined && business.taxRate > 0 && (
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-semibold">
                <Percent size={12} className="text-brand-600" />
                <span>
                  {business.taxName || 'GST'}: {business.taxRate}%
                  {business.taxInclusive ? ' (Incl.)' : ''}
                </span>
              </div>
            )}

            <div className="h-5 w-px bg-zinc-200"></div>

            <Link
              to="/dashboard/profile"
              className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity"
            >
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-900">{user?.fullName}</p>
                <p className="text-[10px] text-zinc-500">{user?.email}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.fullName ? user.fullName.charAt(0) : 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#FAFAF9]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

