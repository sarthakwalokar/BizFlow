import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogIn, UserPlus, LogOut, Shield } from 'lucide-react';
import { SWAGGER_DOCS_URL } from '../api/axios';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();

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
          <Link to="/" className="flex items-center space-x-2.5 py-1">
            <img
              src="/Bizflow-logo.png"
              alt="BizFlow"
              className="h-11 sm:h-12 w-auto max-w-[170px] sm:max-w-[190px] object-contain"
            />
            <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              SaaS
            </span>
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
            <span>{t('nav.apiDocs', 'API Docs')}</span>
          </a>

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                to={getDashboardPath()}
                className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-colors"
              >
                <span>{t('nav.dashboard', 'Dashboard')} ({user.role})</span>
              </Link>

              <button
                onClick={logout}
                className="p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
                title={t('nav.logout', 'Logout')}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('nav.logout', 'Logout')}</span>
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
                <span>{t('nav.signIn', 'Sign In')}</span>
              </Link>

              <Link
                to="/signup"
                id="nav-signup-btn"
                className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('nav.registerBusiness', 'Register Business')}</span>
                <span className="sm:hidden">{t('nav.register', 'Register')}</span>
              </Link>

              <Link
                to="/admin/login"
                className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
                title={t('nav.adminPortal', 'Admin Portal')}
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
