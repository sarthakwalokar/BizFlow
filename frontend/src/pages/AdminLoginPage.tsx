import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, Mail, ArrowRight, AlertCircle, KeyRound, Sparkles, Eye, EyeOff } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@bizflow.com');
  const [password, setPassword] = useState('Admin@123456');
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
        setError('Unauthorized access: This portal is strictly restricted to platform administrators.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify admin credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrefillAdmin = (adminEmail: string, adminPass: string) => {
    setEmail(adminEmail);
    setPassword(adminPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-zinc-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-zinc-950 tracking-tight">
              Biz<span className="text-purple-600">Flow</span>
            </span>
          </Link>
        </div>

        <div className="mt-5 text-center space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-semibold">
            <KeyRound className="w-3 h-3" />
            <span>Platform Governance</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
            Administrator Portal
          </h2>
          <p className="text-xs text-zinc-500">
            Tenant governance, system diagnostics, and platform control
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

          {/* Quick Prefill Banner */}
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs text-zinc-700">
            <div>
              <p className="font-semibold text-zinc-900">Platform Super Admin</p>
              <p className="text-[11px] text-zinc-500">admin@bizflow.com</p>
            </div>
            <button
              type="button"
              onClick={() => handlePrefillAdmin('admin@bizflow.com', 'Admin@123456')}
              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Fill</span>
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5" htmlFor="admin-email">
                Admin Email
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
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5" htmlFor="admin-password">
                Password
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
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
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
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Access Admin Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-100 text-center">
            <Link
              to="/login"
              className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              ← Back to Business Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
