import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Lock, Mail, ArrowRight, AlertCircle, Shield, Sparkles, Coffee, Laptop } from 'lucide-react';

interface DemoCredential {
  label: string;
  type: 'small' | 'large' | 'admin';
  role: string;
  bizName: string;
  email: string;
  pass: string;
  icon: React.FC<{ className?: string }>;
}

const demoAccounts: DemoCredential[] = [
  {
    label: 'Small Biz Owner',
    type: 'small',
    role: 'Owner',
    bizName: 'Chai & Bites Café',
    email: 'owner@chaiandbites.in',
    pass: 'Owner@12345',
    icon: Coffee,
  },
  {
    label: 'Small Biz Staff',
    type: 'small',
    role: 'Staff / Counter',
    bizName: 'Chai & Bites Café',
    email: 'staff@chaiandbites.in',
    pass: 'Staff@12345',
    icon: Coffee,
  },
  {
    label: 'Large Biz Owner',
    type: 'large',
    role: 'Enterprise Owner',
    bizName: 'Apex Electronics Hub',
    email: 'owner@apexretail.in',
    pass: 'Owner@12345',
    icon: Laptop,
  },
  {
    label: 'Large Biz Staff',
    type: 'large',
    role: 'Store Manager',
    bizName: 'Apex Electronics Hub',
    email: 'manager@apexretail.in',
    pass: 'Staff@12345',
    icon: Laptop,
  },
  {
    label: 'Platform Admin',
    type: 'admin',
    role: 'Super Admin',
    bizName: 'BizFlow Platform',
    email: 'admin@bizflow.com',
    pass: 'Admin@123456',
    icon: Shield,
  },
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('owner@chaiandbites.in');
  const [password, setPassword] = useState('Owner@12345');
  const [selectedDemo, setSelectedDemo] = useState<string>('owner@chaiandbites.in');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillDemo = (acc: DemoCredential) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setSelectedDemo(acc.email);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password });
      if (user.role === 'OWNER') {
        navigate('/dashboard/owner');
      } else if (user.role === 'STAFF') {
        navigate('/dashboard/staff');
      } else if (user.role === 'ADMIN') {
        navigate('/dashboard/admin');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative selection:bg-indigo-600 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-500 transition-colors">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Biz<span className="text-indigo-400">Flow</span>
            </span>
          </Link>
        </div>

        <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-white">
          Sign in to your business
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Access your POS terminal, analytics, inventory, and management portal
        </p>

        {/* 1-Click Demo Accounts Switcher Bar */}
        <div className="mt-6 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Quick Demo Logins (1-Click Fill)
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Pre-populated test accounts</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              const isSelected = selectedDemo === acc.email;
              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold truncate">{acc.label}</span>
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                  </div>
                  <span className="text-[10px] text-slate-400 truncate mt-0.5">{acc.role}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-slate-800/70 rounded-2xl border border-slate-700/80 p-6 sm:p-8 shadow-xl space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 flex items-start space-x-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSelectedDemo('');
                  }}
                  placeholder="owner@chaiandbites.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300" htmlFor="login-password">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSelectedDemo('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit-btn"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-700/60 flex flex-col space-y-2.5 text-center">
            <p className="text-xs text-slate-400">
              New business owner?{' '}
              <Link to="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                Register your business
              </Link>
            </p>

            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors pt-1"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Platform Administrator Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
