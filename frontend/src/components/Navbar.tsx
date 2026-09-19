import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'OWNER' || user.role === 'STAFF') return '/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  const navLinks = [
    { label: t('nav.features', 'Features'), href: '#features' },
    { label: t('nav.aiAssistant', 'AI Assistant'), href: '#ai-assistant' },
    { label: t('nav.analytics', 'Analytics'), href: '#analytics' },
    { label: t('nav.reviewBoost', 'Review Boost'), href: '#review-boost' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center space-x-10">
          <Link to="/" className="flex items-center group py-2">
            <img
              src="/Bizflow-logo-dark.png"
              alt="BizFlow"
              className="h-8 sm:h-9 w-auto max-w-[160px] object-contain group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Center: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-slate-300">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="hover:text-cyan-400 transition-colors font-medium tracking-tight text-sm py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right: Auth Actions (NO SEARCH BAR) */}
        <div className="hidden sm:flex items-center space-x-4">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <Link
                to={getDashboardPath()}
                className="flex items-center space-x-2 px-6 py-2.5 text-xs font-bold rounded-full bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-cyan-500/35 hover:-translate-y-0.5"
              >
                <span>{t('nav.dashboard', 'Go to Dashboard')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={logout}
                className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
                title={t('nav.logout', 'Logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                id="nav-login-btn"
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                {t('nav.signIn', 'Sign In')}
              </Link>

              <Link
                to="/signup"
                id="nav-signup-btn"
                className="flex items-center space-x-2 px-6 py-2.5 text-xs font-bold rounded-full text-white bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 shadow-lg shadow-brand-500/25 transition-all hover:shadow-cyan-500/35 hover:-translate-y-0.5"
              >
                <span>{t('landing.getStarted', 'Get Started')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/admin/login"
                className="p-2 text-slate-500 hover:text-slate-300 rounded-full hover:bg-slate-900 transition-colors"
                title={t('nav.adminPortal', 'Admin Portal')}
              >
                <Shield className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center space-x-2">
          <Link
            to="/signup"
            className="px-4 py-2 text-xs font-bold rounded-full text-white bg-gradient-to-r from-brand-600 to-cyan-500 shadow-sm"
          >
            {t('landing.getStarted', 'Get Started')}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-2 pt-1 text-sm font-semibold text-slate-300">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-900 text-cyan-400 font-bold"
            >
              {t('nav.signIn', 'Sign In')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
