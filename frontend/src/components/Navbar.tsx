import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, BookOpen, LogIn, UserPlus, LogOut, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'OWNER') return '/dashboard/owner';
    if (user.role === 'STAFF') return '/dashboard/staff';
    if (user.role === 'ADMIN') return '/dashboard/admin';
    return '/';
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">Biz<span className="text-brand-400">Flow</span></span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">v1.0.0</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">SaaS Business Management Platform</p>
            </div>
          </Link>
        </div>

        {/* Navigation / Actions */}
        <nav className="flex items-center space-x-2 sm:space-x-3">
          <a
            href="http://localhost:8080/swagger-ui/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-700/60 hover:border-slate-600 transition-all"
            id="swagger-docs-link"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-400" />
            <span>Swagger API</span>
          </a>

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                to={getDashboardPath()}
                className="flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20 transition-all"
              >
                <span>Dashboard ({user.role})</span>
              </Link>

              <button
                onClick={logout}
                className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-800 transition-all flex items-center space-x-1.5 cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                id="nav-login-btn"
                className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-brand-400" />
                <span>Sign In</span>
              </Link>

              <Link
                to="/signup"
                id="nav-signup-btn"
                className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/20 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Register Business</span>
                <span className="sm:hidden">Register</span>
              </Link>

              <Link
                to="/admin/login"
                className="p-1.5 text-slate-400 hover:text-purple-400 rounded-lg hover:bg-slate-900 transition-all"
                title="Admin Portal"
              >
                <Shield className="w-4 h-4" />
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
