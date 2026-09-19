import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password });
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        setError(t('admin.unauthorizedAccess', 'Unauthorized access: This portal is strictly restricted to platform administrators.'));
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        t('auth.adminAuthFailed', 'Authentication failed. Please verify admin credentials.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-zinc-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center">
            <img
              src="/Bizflow-logo.png"
              alt="BizFlow"
              className="h-14 sm:h-16 w-auto max-w-[240px] object-contain"
            />
          </Link>
        </div>

        <div className="mt-5 text-center space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[11px] font-semibold">
            <KeyRound className="w-3 h-3" />
            <span>{t('admin.platformGovernance', 'Platform Governance')}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
            {t('admin.portal', 'Administrator Portal')}
          </h2>
          <p className="text-xs text-zinc-500">
            {t('admin.portalSubtitle', 'Tenant governance, system diagnostics, and platform control')}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-card space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5" htmlFor="admin-email">
                {t('admin.adminEmail', 'Admin Email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bizflow.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5" htmlFor="admin-password">
                {t('profile.currentPassword', 'Password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="admin-login-submit-btn"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{loading ? t('auth.loggingIn', 'Authenticating...') : t('admin.accessPortal', 'Access Admin Portal')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-100 text-center">
            <Link
              to="/login"
              className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              ← {t('auth.backToBusinessLogin', 'Back to Business Login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
