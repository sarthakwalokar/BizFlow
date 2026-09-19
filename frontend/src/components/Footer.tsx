import React from 'react';
import { Database, Shield, Zap, Sparkles, Receipt, BarChart3, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center group">
              <img
                src="/Bizflow-logo-dark.png"
                alt="BizFlow"
                className="h-8 sm:h-9 w-auto max-w-[160px] object-contain group-hover:scale-105 transition-transform"
              />
            </Link>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              {t('footer.subtitle', 'Business management platform for managing and growing your business. High-speed POS billing, real-time inventory, expense tracking, and grounded AI analytics.')}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                ⚡ {t('footer.tagline', 'Modern Commerce')}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                🌐 {t('footer.multilingual', '18 Languages Supported')}
              </span>
            </div>
          </div>

          {/* Core Platform Features */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('footer.platform', 'Features')}
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#features" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-blue-400" />
                  <span>Billing & POS Terminal</span>
                </a>
              </li>
              <li>
                <a href="#ai-assistant" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Business Assistant</span>
                </a>
              </li>
              <li>
                <a href="#analytics" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sales & Expense Analytics</span>
                </a>
              </li>
              <li>
                <a href="#review-boost" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Review Boost (QR Reputation)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('footer.operations', 'Access')}
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/login" className="hover:text-cyan-400 transition-colors">
                  {t('footer.businessLogin', 'Sign In')}
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-cyan-400 transition-colors">
                  {t('footer.createAccount', 'Get Started')}
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-cyan-400 transition-colors">
                  {t('footer.adminPortal', 'Admin Portal')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Reliability */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('footer.infrastructure', 'Security & Tech')}
            </h4>
            <div className="space-y-2 text-xs text-slate-400 font-medium">
              <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>JWT Auth</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>PostgreSQL DB</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Role Protected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BizFlow. Business management platform for managing and growing your business.</p>
          <div className="flex items-center space-x-6 text-slate-400">
            <span>Unified Commerce & POS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
