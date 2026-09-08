import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  Settings,
  UserCheck,
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
} from 'lucide-react';

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

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['OWNER', 'STAFF'],
    },
    {
      label: 'Analytics',
      path: '/dashboard/analytics',
      icon: BarChart3,
      roles: ['OWNER', 'STAFF'],
    },
    {
      label: 'AI Assistant',
      path: '/dashboard/ai-assistant',
      icon: Sparkles,
      roles: ['OWNER', 'STAFF'],
    },
    {
      label: 'POS Billing Terminal',
      path: '/dashboard/pos',
      icon: Receipt,
      roles: ['OWNER', 'STAFF'],
    },
    {
      label: 'Sales & Invoices',
      path: '/dashboard/bills',
      icon: CircleDollarSign,
      roles: ['OWNER', 'STAFF'],
    },
    {
      label: 'Inventory & Stock',
      path: '/dashboard/inventory',
      icon: Boxes,
      roles: ['OWNER', 'STAFF'],
      requiresInventory: true,
    },
    {
      label: 'Operating Expenses',
      path: '/dashboard/expenses',
      icon: TrendingDown,
      roles: ['OWNER', 'STAFF'],
    },
    {
      label: 'Reports & Exports',
      path: '/dashboard/reports',
      icon: FileText,
      roles: ['OWNER', 'STAFF'],
    },
    {
      label: 'Customers & CRM',
      path: '/dashboard/customers',
      icon: Contact,
      roles: ['OWNER', 'STAFF'],
    },
    {
      label: 'Review Boost',
      path: '/dashboard/reviews',
      icon: Star,
      roles: ['OWNER', 'STAFF'],
    },
    {
      label: 'Products Catalog',
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
      label: 'Staff Management',
      path: '/dashboard/staff',
      icon: Users,
      roles: ['OWNER'],
    },
    {
      label: 'Business Settings',
      path: '/dashboard/settings',
      icon: Settings,
      roles: ['OWNER'],
    },
    {
      label: 'My Profile',
      path: '/dashboard/profile',
      icon: UserCheck,
      roles: ['OWNER', 'STAFF', 'ADMIN'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!user || !item.roles.includes(user.role)) return false;
    if (item.requiresInventory && business?.inventoryEnabled === false) return false;
    return true;
  });

  const getBusinessTypeColor = (type?: string) => {
    switch (type) {
      case 'RETAIL':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'RESTAURANT':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CAFE':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'BAKERY':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'SALON':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'SERVICE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              B
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">BizFlow</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {business && (
            <span
              className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getBusinessTypeColor(
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
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto md:min-h-screen shadow-xl md:shadow-none border-r border-slate-800 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Tenant Header */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                B
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-tight block">BizFlow</span>
                <span className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase">
                  SaaS Business Suite
                </span>
              </div>
            </div>

            {business && (
              <div className="mt-3.5 p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  <Store size={16} />
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{business.name}</h4>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-wide truncate">
                      {business.businessType} • ₹ {business.currency || 'INR'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nav Links */}
          <nav className="p-2.5 space-y-1 flex-1 overflow-y-auto">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Core Modules
            </div>

            {filteredNavItems.map((item) => {
              const isActive =
                item.path === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={13} className="text-indigo-200" />}
                </Link>
              );
            })}

            {isAdmin && (
              <div className="pt-2">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-500/80">
                  Platform Admin
                </div>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-all mt-1"
                >
                  <ShieldAlert size={16} />
                  <span>Admin Portal</span>
                </Link>
              </div>
            )}
          </nav>

          {/* User Profile & Logout Bottom Bar */}
          <div className="p-3 border-t border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user?.fullName ? user.fullName.charAt(0) : 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
                  <span
                    className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isOwner
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        : isAdmin
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
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
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="hidden md:flex h-15 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center space-x-3">
            <h1 className="text-base font-bold text-slate-900">
              {business ? business.name : 'BizFlow Platform'}
            </h1>
            {business && (
              <span
                className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${getBusinessTypeColor(
                  business.businessType
                )}`}
              >
                {business.businessType}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {business && business.taxRate !== undefined && business.taxRate > 0 && (
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <Percent size={12} className="text-indigo-600" />
                <span>
                  {business.taxName || 'GST'}: {business.taxRate}%
                  {business.taxInclusive ? ' (Incl.)' : ''}
                </span>
              </div>
            )}

            <div className="h-5 w-px bg-slate-200"></div>

            <div className="flex items-center space-x-2.5">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-[10px] text-slate-500">{user?.email}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.fullName ? user.fullName.charAt(0) : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
