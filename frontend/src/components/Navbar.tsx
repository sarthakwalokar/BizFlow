import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, BookOpen, LogIn, UserPlus, LogOut, Shield } from 'lucide-react';
import { SWAGGER_DOCS_URL } from '../api/axios';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'OWNER') return '/dashboard';
    if (user.role === 'STAFF') return '/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-sm shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold tracking-tight text-zinc-900">
                  Biz<span className="text-emerald-600">Flow</span>
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SaaS
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation / Actions */}
        <nav className="flex items-center space-x-2 sm:space-x-3">
          <a
            href={SWAGGER_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-600 hover:text-zinc-900 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-colors"
            id="swagger-docs-link"
          >
            <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
            <span>API Docs</span>
          </a>

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                to={getDashboardPath()}
                className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                <span>Dashboard ({user.role})</span>
              </Link>

              <button
                onClick={logout}
                className="p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
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
                className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-zinc-700 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-zinc-500" />
                <span>Sign In</span>
              </Link>

              <Link
                to="/signup"
                id="nav-signup-btn"
                className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Register Business</span>
                <span className="sm:hidden">Register</span>
              </Link>

              <Link
                to="/admin/login"
                className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
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
