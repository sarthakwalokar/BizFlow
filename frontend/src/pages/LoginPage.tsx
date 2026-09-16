import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Lock, Mail, ArrowRight, AlertCircle, Shield, Sparkles, Coffee, Laptop, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
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
        navigate('/dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
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
    <div className="min-h-screen bg-[#F7F7F5] text-zinc-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-zinc-950 tracking-tight">
              Biz<span className="text-emerald-600">Flow</span>
            </span>
          </Link>
        </div>

        <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-zinc-950">
          Sign in to your business
        </h2>
        <p className="mt-1 text-center text-xs text-zinc-500">
          Access your POS terminal, analytics, inventory, and management portal
        </p>

        {/* 1-Click Demo Accounts Switcher Bar */}
        <div className="mt-6 bg-white border border-zinc-200 rounded-2xl p-3.5 shadow-card space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Quick Demo Logins (1-Click Fill)
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">Pre-populated accounts</span>
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
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold truncate">{acc.label}</span>
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-emerald-600' : 'text-zinc-400'}`} />
                  </div>
                  <span className="text-[10px] text-zinc-500 truncate mt-0.5">{acc.role}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-card space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-700" htmlFor="login-password">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSelectedDemo('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
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
              id="login-submit-btn"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-100 flex flex-col space-y-2.5 text-center">
            <p className="text-xs text-zinc-500">
              New business owner?{' '}
              <Link to="/signup" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                Register your business
              </Link>
            </p>

            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center space-x-1.5 text-xs text-zinc-400 hover:text-zinc-700 transition-colors pt-1"
            >
              <Shield className="w-3.5 h-3.5 text-zinc-500" />
              <span>Platform Administrator Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
