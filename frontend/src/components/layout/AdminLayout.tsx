import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
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
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      label: 'Platform Overview',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Tenants & Businesses',
      path: '/admin/businesses',
      icon: Building2,
    },
    {
      label: 'Platform Users',
      path: '/admin/users',
      icon: Users,
    },
    {
      label: 'Platform Reports',
      path: '/admin/reports',
      icon: BarChart3,
    },
    {
      label: 'System Config',
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
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-xs">
            <ShieldAlert size={18} />
          </div>
          <span className="font-bold text-zinc-900 text-sm tracking-tight">BizFlow Admin</span>
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
          <div className="flex items-center space-x-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-zinc-950 text-base tracking-tight">BizFlow</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                  Admin
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-medium">Platform Governance Center</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-1">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 py-1">
              Platform Administration
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
                      ? 'bg-purple-50 text-purple-700 font-bold'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-purple-600' : 'text-zinc-400'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Badge & Logout */}
        <div className="space-y-2 pt-3 border-t border-zinc-100">
          <div className="flex items-center space-x-2.5 px-2 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-zinc-900 truncate">{user?.fullName || 'Root Admin'}</p>
              <span className="text-[10px] text-purple-700 font-medium flex items-center space-x-1">
                <Zap size={10} className="text-purple-600" />
                <span>Super Administrator</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-zinc-50 hover:bg-red-50 text-zinc-600 hover:text-red-700 border border-zinc-200 hover:border-red-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out Admin</span>
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
