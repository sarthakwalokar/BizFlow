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
  Coffee, 
  Building2, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

const businessTypeOptions: { value: BusinessType; label: string }[] = [
  { value: 'RETAIL', label: 'Retail Store / Shop' },
  { value: 'GROCERY', label: 'Grocery & Kirana Store' },
  { value: 'SUPERMARKET', label: 'Supermarket / Hypermarket' },
  { value: 'RESTAURANT', label: 'Restaurant / Fine Dining' },
  { value: 'CAFE', label: 'Café & Bistro' },
  { value: 'BAKERY', label: 'Bakery & Patisserie' },
  { value: 'SWEET_SHOP', label: 'Sweet Shop / Confectionery' },
  { value: 'SALON', label: 'Salon & Hair Studio' },
  { value: 'BEAUTY_PARLOUR', label: 'Beauty Parlour & Spa' },
  { value: 'CLOTHING', label: 'Clothing & Apparel / Boutique' },
  { value: 'ELECTRONICS', label: 'Electronics & Appliances' },
  { value: 'PHARMACY', label: 'Pharmacy & Medical Store' },
  { value: 'HARDWARE', label: 'Hardware & Electrical' },
  { value: 'FURNITURE', label: 'Furniture & Home Decor' },
  { value: 'STATIONERY', label: 'Stationery & Book Store' },
  { value: 'MOBILE_STORE', label: 'Mobile Store & Tech Hub' },
  { value: 'REPAIR', label: 'Repair & Service Center' },
  { value: 'FITNESS', label: 'Fitness & Gym Studio' },
  { value: 'HOTEL', label: 'Hotel & Hospitality' },
  { value: 'CATERING', label: 'Catering & Event Services' },
  { value: 'SERVICE', label: 'Professional & Trade Services' },
  { value: 'CONSULTANCY', label: 'Consultancy & Agency' },
  { value: 'EDUCATION', label: 'Education & Coaching Institute' },
  { value: 'OTHER', label: 'Other Commercial Enterprise' },
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
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5 justify-center">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-zinc-950 tracking-tight">
              Biz<span className="text-brand-600">Flow</span>
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
                  <Building className="w-4 h-4 text-brand-600" />
                  <span>1. Business Information</span>
                </h2>
                <p className="text-[11px] text-zinc-500">Tell us about your company or establishment</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-biz-name">
                    Business Name *
                  </label>
                  <input
                    id="signup-biz-name"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Spice Garden Fine Dine"
                    className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-biz-type">
                    Business Type / Industry Vertical *
                  </label>
                  <select
                    id="signup-biz-type"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                    className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  >
                    {businessTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Business Size Selector */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-2">
                    Business Size / Scale *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBusinessSize('SMALL')}
                      className={`p-3.5 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                        businessSize === 'SMALL'
                          ? 'bg-brand-50 border-brand-600 text-brand-950 ring-1 ring-brand-600 shadow-xs'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      <Coffee className={`w-5 h-5 mt-0.5 ${businessSize === 'SMALL' ? 'text-brand-600' : 'text-zinc-400'}`} />
                      <div>
                        <div className="text-xs font-bold text-zinc-900">Small Business / Single Counter</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">Lean stock, direct POS billing, quick operations</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBusinessSize('LARGE')}
                      className={`p-3.5 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                        businessSize === 'LARGE'
                          ? 'bg-brand-50 border-brand-600 text-brand-950 ring-1 ring-brand-600 shadow-xs'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      <Building2 className={`w-5 h-5 mt-0.5 ${businessSize === 'LARGE' ? 'text-brand-600' : 'text-zinc-400'}`} />
                      <div>
                        <div className="text-xs font-bold text-zinc-900">Large Enterprise / Multi-Branch</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">Warehouses, suppliers, inward POs & stock ledger</div>
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
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
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
                    className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
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
                    placeholder="e.g. contact@business.in"
                    className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Owner User Account */}
            <div className="space-y-4">
              <div className="border-b border-zinc-100 pb-2">
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-brand-600" />
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
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
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
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
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
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
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
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
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
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </span>
              ) : (
                <>
                  <span>Complete Onboarding & Launch Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
