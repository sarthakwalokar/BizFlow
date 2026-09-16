import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BusinessType } from '../api/auth';
import { 
  Layers, 
  User as UserIcon, 
  Mail, 
  Lock, 
  Phone, 
  Building, 
  MapPin, 
  Store, 
  Utensils, 
  Coffee, 
  Cake, 
  Scissors, 
  Wrench, 
  Building2, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

const businessTypesList: { type: BusinessType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { type: 'RETAIL', label: 'Retail Shop', icon: Store },
  { type: 'RESTAURANT', label: 'Restaurant', icon: Utensils },
  { type: 'CAFE', label: 'Café / Bistro', icon: Coffee },
  { type: 'BAKERY', label: 'Bakery', icon: Cake },
  { type: 'SALON', label: 'Salon / Spa', icon: Scissors },
  { type: 'SERVICE', label: 'Service / Trade', icon: Wrench },
  { type: 'OTHER', label: 'Other Commercial', icon: Building2 },
];

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('RETAIL');
  const [businessSize, setBusinessSize] = useState<'SMALL' | 'LARGE'>('SMALL');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signup({
        fullName,
        email,
        password,
        phone,
        businessName,
        businessType,
        businessAddress,
        businessPhone: businessPhone || phone,
        businessEmail: businessEmail || email,
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please verify your information and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-zinc-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5 justify-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-zinc-950 tracking-tight">
              Biz<span className="text-emerald-600">Flow</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Register Your Business
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
            Set up your owner account and onboard your business operations in minutes.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-zinc-200 shadow-card space-y-8">
          
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Business Profile */}
            <div className="space-y-4">
              <div className="border-b border-zinc-100 pb-2">
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>1. Business Information</span>
                </h2>
                <p className="text-[11px] text-zinc-500">Tell us about your company or establishment</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-biz-name">
                    Business Name *
                  </label>
                  <input
                    id="signup-biz-name"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Blue Ridge Artisan Bakery"
                    className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-2">
                    Select Business Vertical *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {businessTypesList.map((item) => {
                      const Icon = item.icon;
                      const isSelected = businessType === item.type;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setBusinessType(item.type)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs ring-1 ring-emerald-600'
                              : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-emerald-600' : 'text-zinc-400'}`} />
                          <span className="text-xs font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Business Size Selector */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-2">
                    Business Size / Scale *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBusinessSize('SMALL')}
                      className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                        businessSize === 'SMALL'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-600'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      <Coffee className={`w-5 h-5 mt-0.5 ${businessSize === 'SMALL' ? 'text-emerald-600' : 'text-zinc-400'}`} />
                      <div>
                        <div className="text-xs font-bold">Small Business / Single Counter</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">Lean stock, simple POS, fast operations</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBusinessSize('LARGE')}
                      className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                        businessSize === 'LARGE'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-600'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      <Building2 className={`w-5 h-5 mt-0.5 ${businessSize === 'LARGE' ? 'text-emerald-600' : 'text-zinc-400'}`} />
                      <div>
                        <div className="text-xs font-bold">Large Enterprise / Multi-Branch</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">Warehouses, suppliers, inward POs</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-biz-addr">
                    Business Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-biz-addr"
                      type="text"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="e.g. 100 Feet Road, Indiranagar, Bengaluru"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-biz-phone">
                    Business Phone
                  </label>
                  <input
                    id="signup-biz-phone"
                    type="tel"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-biz-email">
                    Business Email
                  </label>
                  <input
                    id="signup-biz-email"
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="e.g. contact@bakery.in"
                    className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Owner User Account */}
            <div className="space-y-4">
              <div className="border-b border-zinc-100 pb-2">
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-emerald-600" />
                  <span>2. Business Owner Credentials</span>
                </h2>
                <p className="text-[11px] text-zinc-500">You will automatically receive OWNER privileges for this business</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-owner-name">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-owner-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Arjun Kapoor"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-owner-phone">
                    Owner Phone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-owner-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-owner-email">
                    Login Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-owner-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@mybusiness.in"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-owner-password">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-owner-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
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
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              id="signup-submit-btn"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{loading ? 'Creating Business & Account...' : 'Complete Onboarding & Launch Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
