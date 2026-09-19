import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { BusinessType } from '../api/auth';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { 
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

const businessTypeOptions: { value: BusinessType; labelKey: string; defaultLabel: string }[] = [
  { value: 'RETAIL', labelKey: 'business.typeRetail', defaultLabel: 'Retail Store / Shop' },
  { value: 'GROCERY', labelKey: 'business.typeGrocery', defaultLabel: 'Grocery & Kirana Store' },
  { value: 'SUPERMARKET', labelKey: 'business.typeSupermarket', defaultLabel: 'Supermarket / Hypermarket' },
  { value: 'RESTAURANT', labelKey: 'business.typeRestaurant', defaultLabel: 'Restaurant / Fine Dining' },
  { value: 'CAFE', labelKey: 'business.typeCafe', defaultLabel: 'Café & Bistro' },
  { value: 'BAKERY', labelKey: 'business.typeBakery', defaultLabel: 'Bakery & Patisserie' },
  { value: 'SWEET_SHOP', labelKey: 'business.typeSweetShop', defaultLabel: 'Sweet Shop / Confectionery' },
  { value: 'SALON', labelKey: 'business.typeSalon', defaultLabel: 'Salon & Hair Studio' },
  { value: 'BEAUTY_PARLOUR', labelKey: 'business.typeBeautyParlour', defaultLabel: 'Beauty Parlour & Spa' },
  { value: 'CLOTHING', labelKey: 'business.typeClothing', defaultLabel: 'Clothing & Apparel / Boutique' },
  { value: 'ELECTRONICS', labelKey: 'business.typeElectronics', defaultLabel: 'Electronics & Appliances' },
  { value: 'PHARMACY', labelKey: 'business.typePharmacy', defaultLabel: 'Pharmacy & Medical Store' },
  { value: 'HARDWARE', labelKey: 'business.typeHardware', defaultLabel: 'Hardware & Electrical' },
  { value: 'FURNITURE', labelKey: 'business.typeFurniture', defaultLabel: 'Furniture & Home Decor' },
  { value: 'STATIONERY', labelKey: 'business.typeStationery', defaultLabel: 'Stationery & Book Store' },
  { value: 'MOBILE_STORE', labelKey: 'business.typeMobileStore', defaultLabel: 'Mobile Store & Tech Hub' },
  { value: 'REPAIR', labelKey: 'business.typeRepair', defaultLabel: 'Repair & Service Center' },
  { value: 'FITNESS', labelKey: 'business.typeFitness', defaultLabel: 'Fitness & Gym Studio' },
  { value: 'HOTEL', labelKey: 'business.typeHotel', defaultLabel: 'Hotel & Hospitality' },
  { value: 'CATERING', labelKey: 'business.typeCatering', defaultLabel: 'Catering & Event Services' },
  { value: 'SERVICE', labelKey: 'business.typeService', defaultLabel: 'Professional & Trade Services' },
  { value: 'CONSULTANCY', labelKey: 'business.typeConsultancy', defaultLabel: 'Consultancy & Agency' },
  { value: 'EDUCATION', labelKey: 'business.typeEducation', defaultLabel: 'Education & Coaching Institute' },
  { value: 'OTHER', labelKey: 'business.typeOther', defaultLabel: 'Other Commercial Enterprise' },
];

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<string>(i18n.language || 'en');
  
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('RETAIL');
  const [businessSize, setBusinessSize] = useState<'SMALL' | 'LARGE'>('SMALL');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLanguageChange = (langCode: string) => {
    setPreferredLanguage(langCode);
    i18n.changeLanguage(langCode);
  };

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
        preferredLanguage,
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        t('auth.signupError', 'Registration failed. Please verify your information and try again.')
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
          <Link to="/" className="inline-flex items-center justify-center">
            <img
              src="/Bizflow-logo.png"
              alt="BizFlow"
              className="h-12 sm:h-14 w-auto max-w-[210px] object-contain"
            />
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
            {t('auth.signupTitle', 'Register your business with BizFlow')}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
            {t('auth.signupSubtitle', 'Set up your owner account and onboard your business operations in minutes.')}
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
                  <span>{t('auth.businessInformation', '1. Business Information')}</span>
                </h2>
                <p className="text-[11px] text-zinc-500">{t('auth.tellUsAboutBiz', 'Tell us about your company or establishment')}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-biz-name">
                    {t('settings.businessName', 'Business Name')} *
                  </label>
                  <input
                    id="signup-biz-name"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={t('auth.businessNamePlaceholder', 'e.g. Spice Garden Fine Dine')}
                    className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-biz-type">
                    {t('auth.businessTypeVertical', 'Business Type / Industry Vertical')} *
                  </label>
                  <select
                    id="signup-biz-type"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                    className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  >
                    {businessTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(opt.labelKey, opt.defaultLabel)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Business Size Selector */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-2">
                    {t('auth.businessSizeScale', 'Business Size / Scale')} *
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
                        <div className="text-xs font-bold text-zinc-900">{t('landing.smallBusiness', 'Small Business / Single Counter')}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">{t('auth.smallBizDesc', 'Lean stock, direct POS billing, quick operations')}</div>
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
                        <div className="text-xs font-bold text-zinc-900">{t('landing.largeBusiness', 'Large Enterprise / Multi-Branch')}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">{t('auth.largeBizDesc', 'Warehouses, suppliers, inward POs & stock ledger')}</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-biz-addr">
                    {t('settings.address', 'Business Address')}
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
                      placeholder={t('auth.addressPlaceholder', 'e.g. 100 Feet Road, Indiranagar, Bengaluru')}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-biz-phone">
                    {t('settings.phone', 'Business Phone')}
                  </label>
                  <input
                    id="signup-biz-phone"
                    type="tel"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-biz-email">
                    {t('common.email', 'Business Email')}
                  </label>
                  <input
                    id="signup-biz-email"
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="contact@business.in"
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
                  <span>{t('auth.ownerCredentials', '2. Business Owner Credentials')}</span>
                </h2>
                <p className="text-[11px] text-zinc-500">{t('auth.ownerPrivilegesNote', 'You will automatically receive OWNER privileges for this business')}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-owner-name">
                    {t('profile.fullName', 'Full Name')} *
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
                      placeholder={t('auth.ownerNamePlaceholder', 'Arjun Kapoor')}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-owner-phone">
                    {t('profile.phone', 'Owner Phone')}
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
                      placeholder={t('auth.phonePlaceholder', '+91 98765 43210')}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-owner-email">
                    {t('auth.loginEmail', 'Login Email Address')} *
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
                      placeholder={t('auth.emailPlaceholder', 'owner@mybusiness.in')}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1" htmlFor="signup-owner-password">
                    {t('profile.newPassword', 'Password')} *
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
                      placeholder={t('auth.minSixChars', 'Min 6 characters')}
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

                {/* Preferred Language Field */}
                <div className="sm:col-span-2">
                  <LanguageSelector
                    label={t('auth.preferredLanguage', 'Preferred Language / पसंदीदा भाषा / पसंतीची भाषा')}
                    value={preferredLanguage}
                    onChange={handleLanguageChange}
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {t('auth.preferredLanguageHelp', 'Select your preferred language. BizFlow interface and AI business insights will automatically adapt to your selection.')}
                  </p>
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
                  <span>{t('auth.signingUp', 'Creating account...')}</span>
                </span>
              ) : (
                <>
                  <span>{t('auth.signupButton', 'Complete Onboarding & Launch Workspace')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500">
            {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
              {t('auth.loginButton', 'Sign in here')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
