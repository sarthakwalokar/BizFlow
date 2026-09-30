import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { BusinessType } from '../api/auth';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { LegalModal } from '../components/common/LegalModal';
import {
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  MapPin,
  Store,
  Building2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Sparkles,
  Check,
} from 'lucide-react';

interface BusinessTypeCategory {
  category: string;
  options: { value: BusinessType; labelKey: string; defaultLabel: string }[];
}

const businessCategories: BusinessTypeCategory[] = [
  {
    category: 'Retail & Consumer Goods',
    options: [
      { value: 'RETAIL', labelKey: 'business.typeRetail', defaultLabel: 'Retail Store / General Shop' },
      { value: 'GROCERY', labelKey: 'business.typeGrocery', defaultLabel: 'Grocery & Kirana Store' },
      { value: 'SUPERMARKET', labelKey: 'business.typeSupermarket', defaultLabel: 'Supermarket / Hypermarket' },
      { value: 'CLOTHING', labelKey: 'business.typeClothing', defaultLabel: 'Clothing, Fashion & Apparel' },
      { value: 'ELECTRONICS', labelKey: 'business.typeElectronics', defaultLabel: 'Electronics & Appliances' },
      { value: 'MOBILE_STORE', labelKey: 'business.typeMobileStore', defaultLabel: 'Mobile Store & Tech Hub' },
      { value: 'PHARMACY', labelKey: 'business.typePharmacy', defaultLabel: 'Pharmacy & Medical Store' },
      { value: 'HARDWARE', labelKey: 'business.typeHardware', defaultLabel: 'Hardware & Electricals' },
      { value: 'FURNITURE', labelKey: 'business.typeFurniture', defaultLabel: 'Furniture & Home Living' },
      { value: 'STATIONERY', labelKey: 'business.typeStationery', defaultLabel: 'Stationery & Books' },
    ],
  },
  {
    category: 'Food, Dining & Hospitality',
    options: [
      { value: 'RESTAURANT', labelKey: 'business.typeRestaurant', defaultLabel: 'Restaurant / Fine Dining' },
      { value: 'CAFE', labelKey: 'business.typeCafe', defaultLabel: 'Café & Bistro' },
      { value: 'BAKERY', labelKey: 'business.typeBakery', defaultLabel: 'Bakery & Patisserie' },
      { value: 'SWEET_SHOP', labelKey: 'business.typeSweetShop', defaultLabel: 'Sweet Shop / Confectionery' },
      { value: 'HOTEL', labelKey: 'business.typeHotel', defaultLabel: 'Hotel & Hospitality' },
      { value: 'CATERING', labelKey: 'business.typeCatering', defaultLabel: 'Catering & Events' },
    ],
  },
  {
    category: 'Personal Care & Wellness',
    options: [
      { value: 'SALON', labelKey: 'business.typeSalon', defaultLabel: 'Salon & Hair Studio' },
      { value: 'BEAUTY_PARLOUR', labelKey: 'business.typeBeautyParlour', defaultLabel: 'Beauty Parlour & Spa' },
      { value: 'FITNESS', labelKey: 'business.typeFitness', defaultLabel: 'Fitness & Gym Studio' },
    ],
  },
  {
    category: 'Professional Services & Trade',
    options: [
      { value: 'SERVICE', labelKey: 'business.typeService', defaultLabel: 'Service Business / Trades' },
      { value: 'REPAIR', labelKey: 'business.typeRepair', defaultLabel: 'Repair & Service Center' },
      { value: 'CONSULTANCY', labelKey: 'business.typeConsultancy', defaultLabel: 'Consultancy & Agency' },
      { value: 'EDUCATION', labelKey: 'business.typeEducation', defaultLabel: 'Education & Coaching Institute' },
      { value: 'OTHER', labelKey: 'business.typeOther', defaultLabel: 'Other / Custom Enterprise' },
    ],
  },
];

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Multi-step state: 1 = Business Details, 2 = Owner Account
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1: Business Details State
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('RETAIL');
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [businessSize, setBusinessSize] = useState<'SMALL' | 'LARGE'>('SMALL');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [gstin, setGstin] = useState('');

  // Step 2: Owner Account State
  const [fullName, setFullName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<string>(i18n.language || 'en');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Validation & UI State
  const [step1Errors, setStep1Errors] = useState<{ [key: string]: string }>({});
  const [step2Errors, setStep2Errors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modal State for Terms / Privacy
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);

  const handleLanguageChange = (langCode: string) => {
    setPreferredLanguage(langCode);
    i18n.changeLanguage(langCode);
  };

  // Password Requirement Evaluation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialOrLower = /[a-z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const calculatePasswordStrength = (): { score: number; label: string; color: string; width: string } => {
    if (!password) return { score: 0, label: 'Not entered', color: 'bg-slate-200', width: 'w-0' };
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;
    if (hasSpecialOrLower) score++;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500', width: 'w-1/4' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-600', width: 'w-3/4' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
      default:
        return { score: 0, label: 'Too short', color: 'bg-rose-400', width: 'w-1/12' };
    }
  };

  const strength = calculatePasswordStrength();
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  // Validate Step 1
  const validateStep1 = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!businessName.trim()) {
      errors.businessName = 'Business name is required (min 2 characters)';
    } else if (businessName.trim().length < 2) {
      errors.businessName = 'Business name must be at least 2 characters';
    }

    if (businessType === 'OTHER' && !customBusinessType.trim()) {
      errors.customBusinessType = 'Please specify your custom business type';
    }

    if (!businessPhone.trim()) {
      errors.businessPhone = 'Primary business contact number is required';
    } else if (businessPhone.trim().replace(/[\s\-\+\(\)]/g, '').length < 7) {
      errors.businessPhone = 'Please enter a valid phone number';
    }

    if (businessEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail.trim())) {
      errors.businessEmail = 'Please enter a valid email address';
    }

    if (pinCode.trim() && !/^[0-9a-zA-Z\s-]{3,10}$/.test(pinCode.trim())) {
      errors.pinCode = 'Please enter a valid postal/PIN code';
    }

    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Validate Step 2
  const validateStep2 = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      errors.fullName = 'Owner full name is required';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Please enter your complete name';
    }

    if (!email.trim()) {
      errors.email = 'Login email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (!isPasswordValid) {
      errors.password = 'Password must meet all security requirements';
    }

    if (!agreeTerms) {
      errors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy to continue';
    }

    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      // Assemble structured business address
      const addressParts = [
        streetAddress.trim(),
        city.trim(),
        stateName.trim(),
        pinCode.trim() ? `PIN: ${pinCode.trim()}` : '',
      ].filter(Boolean);

      const finalAddress = addressParts.join(', ');

      await signup({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: ownerPhone.trim() || businessPhone.trim(),
        businessName: businessName.trim(),
        businessType: businessType,
        businessSize: businessSize,
        businessAddress: finalAddress || undefined,
        businessPhone: businessPhone.trim() || ownerPhone.trim(),
        businessEmail: businessEmail.trim() || email.trim().toLowerCase(),
        taxNumber: gstin.trim() || undefined,
        preferredLanguage,
      });

      // Redirect directly to the short, high-value onboarding flow
      navigate('/onboarding');
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        t('auth.signupError', 'Registration failed. Please verify your information and try again.');

      setApiError(message);

      // If email duplicate error, ensure step 2 shows the indicator specifically for email
      const msgLower = message.toLowerCase();
      if (
        (msgLower.includes('email') && msgLower.includes('already exists')) ||
        (msgLower.includes('email') && msgLower.includes('duplicate')) ||
        msgLower.includes('account with this email')
      ) {
        setStep2Errors((prev) => ({
          ...prev,
          email: 'An account with this email address already exists.',
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased selection:bg-cyan-100 selection:text-blue-900">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Link to="/" className="inline-flex items-center group py-1.5 hover:opacity-95 transition-opacity">
              <img
                src="/Bizflow-logo.png"
                alt="BizFlow"
                className="h-9 sm:h-11 w-auto max-w-[190px] object-contain drop-shadow-2xs"
              />
            </Link>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              {currentStep === 1 ? 'Register Your Business' : 'Create Owner Account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              {currentStep === 1
                ? 'Step 1 of 2: Configure your establishment profile, industry, and location'
                : 'Step 2 of 2: Set up your secure master owner login credentials and workspace preferences'}
            </p>
          </div>
        </div>

        {/* Subtle 2-Step Progress Indicator */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-card">
          <div className="grid grid-cols-2 gap-3 sm:gap-6 relative">
            
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => {
                if (currentStep === 2) setCurrentStep(1);
              }}
              className={`flex items-center space-x-3 p-2.5 sm:p-3 rounded-xl transition-all text-left cursor-pointer ${
                currentStep === 1
                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50/70 border border-blue-200/80 shadow-2xs'
                  : 'bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/60'
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                  currentStep === 1
                    ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-xs'
                    : 'bg-emerald-500 text-white shadow-2xs'
                }`}
              >
                {currentStep === 2 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold truncate ${currentStep === 1 ? 'text-blue-900' : 'text-slate-800'}`}>
                    Business Details
                  </span>
                  {currentStep === 2 && (
                    <span className="hidden sm:inline-block text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                  Name, Category, Size & Contact
                </p>
              </div>
            </button>

            {/* Step 2 Pill */}
            <div
              className={`flex items-center space-x-3 p-2.5 sm:p-3 rounded-xl transition-all text-left ${
                currentStep === 2
                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50/70 border border-blue-200/80 shadow-2xs'
                  : 'bg-slate-50/60 border border-slate-200/50 opacity-85'
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                  currentStep === 2
                    ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold truncate ${currentStep === 2 ? 'text-blue-900' : 'text-slate-700'}`}>
                    Owner Account
                  </span>
                  {currentStep === 2 && (
                    <span className="hidden sm:inline-block text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                  Admin Credentials & Language
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global / API Error Alert */}
        {apiError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block sm:inline">Registration Notice:</span>{' '}
                <span>{apiError}</span>
              </div>
            </div>
            {apiError.toLowerCase().includes('already exists') && (
              <Link
                to="/login"
                className="inline-flex items-center gap-1 font-bold text-blue-700 bg-white hover:bg-blue-50 px-3.5 py-1.5 rounded-lg border border-blue-200 shadow-2xs transition-colors shrink-0 text-xs"
              >
                <span>Sign in here</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-8 md:p-10 border border-slate-200/90 shadow-card">
          
          {/* =========================================================================
              STEP 1: BUSINESS DETAILS FORM
             ========================================================================= */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} className="space-y-6 sm:space-y-7 animate-in fade-in duration-200">
              
              {/* Section Header */}
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Store className="w-4 h-4 text-blue-600" />
                    <span>Business Profile & Location</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter the details of the store, company or enterprise you are registering.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100/80">
                  Step 1 of 2
                </span>
              </div>

              <div className="space-y-5">
                
                {/* Business Name & Business Type Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reg-biz-name">
                      Business / Store Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Store className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        id="reg-biz-name"
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => {
                          setBusinessName(e.target.value);
                          if (step1Errors.businessName) {
                            setStep1Errors((prev) => ({ ...prev, businessName: '' }));
                          }
                        }}
                        placeholder="e.g. Apex Retail & Co."
                        className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          step1Errors.businessName
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                            : 'border-slate-200 focus:border-blue-600 focus:ring-blue-500/20'
                        }`}
                      />
                    </div>
                    {step1Errors.businessName && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{step1Errors.businessName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reg-biz-type">
                      Business Type / Industry Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="reg-biz-type"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer font-medium"
                    >
                      {businessCategories.map((group) => (
                        <optgroup key={group.category} label={`── ${group.category} ──`} className="font-semibold text-slate-700">
                          {group.options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="font-normal text-slate-900 py-1">
                              {t(opt.labelKey, opt.defaultLabel)}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom Business Type (Conditioned on OTHER) */}
                {businessType === 'OTHER' && (
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 animate-in fade-in duration-200">
                    <label className="block text-xs font-semibold text-blue-950 mb-1.5" htmlFor="reg-custom-biz-type">
                      Specify Custom Business Type <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="reg-custom-biz-type"
                      type="text"
                      value={customBusinessType}
                      onChange={(e) => {
                        setCustomBusinessType(e.target.value);
                        if (step1Errors.customBusinessType) {
                          setStep1Errors((prev) => ({ ...prev, customBusinessType: '' }));
                        }
                      }}
                      placeholder="e.g. Organic Farm Store, Event Production, Artisan Pottery"
                      className="w-full px-3.5 py-2.5 bg-white border border-blue-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                    {step1Errors.customBusinessType && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{step1Errors.customBusinessType}</p>
                    )}
                  </div>
                )}

                {/* Business Size Selector Cards */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Business Size & Scale <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Select operational model</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Small Business Card */}
                    <button
                      type="button"
                      onClick={() => setBusinessSize('SMALL')}
                      className={`p-3.5 sm:p-4 rounded-xl border text-left flex items-start space-x-3.5 transition-all cursor-pointer relative ${
                        businessSize === 'SMALL'
                          ? 'bg-gradient-to-br from-blue-50/90 to-cyan-50/50 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          businessSize === 'SMALL'
                            ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-950">Small Business / Single Store</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed">
                          Lean setup, direct POS billing and quick operations
                        </p>
                      </div>
                      <div className="absolute top-3.5 right-3.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            businessSize === 'SMALL'
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {businessSize === 'SMALL' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    </button>

                    {/* Growing / Multi-location Card */}
                    <button
                      type="button"
                      onClick={() => setBusinessSize('LARGE')}
                      className={`p-3.5 sm:p-4 rounded-xl border text-left flex items-start space-x-3.5 transition-all cursor-pointer relative ${
                        businessSize === 'LARGE'
                          ? 'bg-gradient-to-br from-blue-50/90 to-cyan-50/50 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          businessSize === 'LARGE'
                            ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-950">Growing / Multi-location Business</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed">
                          Multiple locations, larger operations, inventory and advanced reporting
                        </p>
                      </div>
                      <div className="absolute top-3.5 right-3.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            businessSize === 'LARGE'
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {businessSize === 'LARGE' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Business Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reg-biz-addr">
                    Business Street / Shop Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      id="reg-biz-addr"
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. Shop #12, Ground Floor, Central Commercial Complex"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* City & State (2-column responsive) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reg-biz-city">
                      City / Town
                    </label>
                    <input
                      id="reg-biz-city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai, Bengaluru, Delhi"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reg-biz-state">
                      State / Province
                    </label>
                    <input
                      id="reg-biz-state"
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Maharashtra, Karnataka"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* PIN Code & Optional GSTIN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reg-biz-pin">
                      Postal / PIN Code
                    </label>
                    <input
                      id="reg-biz-pin"
                      type="text"
                      value={pinCode}
                      onChange={(e) => {
                        setPinCode(e.target.value);
                        if (step1Errors.pinCode) {
                          setStep1Errors((prev) => ({ ...prev, pinCode: '' }));
                        }
                      }}
                      placeholder="e.g. 400001 or 560038"
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        step1Errors.pinCode
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-blue-600 focus:ring-blue-500/20'
                      }`}
                    />
                    {step1Errors.pinCode && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{step1Errors.pinCode}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700" htmlFor="reg-biz-gstin">
                        GSTIN / Tax ID <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Can be set later in Settings</span>
                    </div>
                    <input
                      id="reg-biz-gstin"
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 27AAAAA0000A1Z5"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm uppercase text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Business Phone & Business Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reg-biz-phone">
                      Business Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        id="reg-biz-phone"
                        type="tel"
                        required
                        value={businessPhone}
                        onChange={(e) => {
                          setBusinessPhone(e.target.value);
                          if (step1Errors.businessPhone) {
                            setStep1Errors((prev) => ({ ...prev, businessPhone: '' }));
                          }
                        }}
                        placeholder="+91 98765 43210"
                        className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          step1Errors.businessPhone
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                            : 'border-slate-200 focus:border-blue-600 focus:ring-blue-500/20'
                        }`}
                      />
                    </div>
                    {step1Errors.businessPhone ? (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{step1Errors.businessPhone}</p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">Official phone printed on POS bills & receipts</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reg-biz-email">
                      Business Contact Email <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        id="reg-biz-email"
                        type="email"
                        value={businessEmail}
                        onChange={(e) => {
                          setBusinessEmail(e.target.value);
                          if (step1Errors.businessEmail) {
                            setStep1Errors((prev) => ({ ...prev, businessEmail: '' }));
                          }
                        }}
                        placeholder="contact@mybusiness.in"
                        className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          step1Errors.businessEmail
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                            : 'border-slate-200 focus:border-blue-600 focus:ring-blue-500/20'
                        }`}
                      />
                    </div>
                    {step1Errors.businessEmail && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{step1Errors.businessEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500">
                  Already registered?{' '}
                  <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                    Sign in to your account
                  </Link>
                </p>

                <button
                  type="submit"
                  id="signup-step1-next-btn"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <span>Continue to Owner Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              STEP 2: OWNER ACCOUNT & SECURITY FORM
             ========================================================================= */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7 animate-in fade-in duration-200">
              
              {/* Section Header */}
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Owner Master Credentials & Security</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Create the administrative login for managing <span className="font-semibold text-slate-800">{businessName || 'your business'}</span>.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100/80">
                  Step 2 of 2
                </span>
              </div>

              {/* Owner Distinction Callout */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50/90 via-cyan-50/50 to-slate-50 border border-blue-200/80 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-blue-950">Owner Account Distinction:</span> You are registering as the primary business owner. You will have full access to billing, financial analytics, inventory, and staff management permissions.
                </div>
              </div>

              <div className="space-y-5">
                
                {/* Full Name & Owner Personal Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reg-owner-name">
                      Owner Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        id="reg-owner-name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (step2Errors.fullName) {
                            setStep2Errors((prev) => ({ ...prev, fullName: '' }));
                          }
                        }}
                        placeholder="e.g. Arjun Kapoor"
                        className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          step2Errors.fullName
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                            : 'border-slate-200 focus:border-blue-600 focus:ring-blue-500/20'
                        }`}
                      />
                    </div>
                    {step2Errors.fullName && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{step2Errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reg-owner-phone">
                      Owner Mobile Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        id="reg-owner-phone"
                        type="tel"
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Used for owner security alerts and account recovery</p>
                  </div>
                </div>

                {/* Login Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reg-owner-email">
                    Login Email Address (Master Account) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      id="reg-owner-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (step2Errors.email) {
                          setStep2Errors((prev) => ({ ...prev, email: '' }));
                        }
                        if (apiError) setApiError(null);
                      }}
                      placeholder="owner@mybusiness.in"
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        step2Errors.email
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-blue-600 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                  {step2Errors.email ? (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{step2Errors.email}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">This email will be your permanent username for signing in</p>
                  )}
                </div>

                {/* Password with Live Strength Indicator & Checklist */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reg-owner-password">
                    Create Master Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      id="reg-owner-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (step2Errors.password) {
                          setStep2Errors((prev) => ({ ...prev, password: '' }));
                        }
                      }}
                      placeholder="Minimum 8 characters with uppercase & number"
                      className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        step2Errors.password
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-blue-600 focus:ring-blue-500/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Password Strength:</span>
                        <span className={`font-bold ${
                          strength.score <= 1 ? 'text-rose-600' :
                          strength.score === 2 ? 'text-amber-600' :
                          strength.score === 3 ? 'text-blue-600' : 'text-emerald-600'
                        }`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Live Security Requirements Checklist */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        hasMinLength ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {hasMinLength ? <Check className="w-2.5 h-2.5" /> : <span className="w-1 h-1 rounded-full bg-slate-400" />}
                      </div>
                      <span className={hasMinLength ? 'text-emerald-800 font-medium' : 'text-slate-500'}>
                        At least 8 characters
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        hasUppercase ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {hasUppercase ? <Check className="w-2.5 h-2.5" /> : <span className="w-1 h-1 rounded-full bg-slate-400" />}
                      </div>
                      <span className={hasUppercase ? 'text-emerald-800 font-medium' : 'text-slate-500'}>
                        At least 1 uppercase letter (A-Z)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        hasNumber ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {hasNumber ? <Check className="w-2.5 h-2.5" /> : <span className="w-1 h-1 rounded-full bg-slate-400" />}
                      </div>
                      <span className={hasNumber ? 'text-emerald-800 font-medium' : 'text-slate-500'}>
                        At least 1 number (0-9)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        hasSpecialOrLower ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {hasSpecialOrLower ? <Check className="w-2.5 h-2.5" /> : <span className="w-1 h-1 rounded-full bg-slate-400" />}
                      </div>
                      <span className={hasSpecialOrLower ? 'text-emerald-800 font-medium' : 'text-slate-500'}>
                        Lowercase or special symbol
                      </span>
                    </div>
                  </div>
                  {step2Errors.password && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{step2Errors.password}</p>
                  )}
                </div>

                {/* Preferred Language Field */}
                <div>
                  <LanguageSelector
                    label="Preferred Language / पसंदीदा भाषा / पसंतीची भाषा"
                    value={preferredLanguage}
                    onChange={handleLanguageChange}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    BizFlow POS interface and AI business insights will automatically adapt to your chosen language.
                  </p>
                </div>

                {/* Terms of Service & Privacy Policy Checkbox */}
                <div className="pt-2">
                  <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <input
                      id="reg-agree-terms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        if (step2Errors.agreeTerms) {
                          setStep2Errors((prev) => ({ ...prev, agreeTerms: '' }));
                        }
                      }}
                      className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="reg-agree-terms" className="text-xs text-slate-600 select-none cursor-pointer leading-relaxed">
                      I have read and agree to BizFlow's{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setLegalModalType('terms');
                        }}
                        className="font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setLegalModalType('privacy');
                        }}
                        className="font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                      >
                        Privacy Policy
                      </button>
                      .
                    </label>
                  </div>
                  {step2Errors.agreeTerms && (
                    <p className="text-[11px] text-rose-600 mt-1.5 font-medium">{step2Errors.agreeTerms}</p>
                  )}
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Business Details</span>
                </button>

                <button
                  type="submit"
                  disabled={loading || !agreeTerms || !isPasswordValid}
                  id="signup-submit-btn"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Your BizFlow Workspace...</span>
                    </span>
                  ) : (
                    <>
                      <span>Complete Registration & Launch Workspace</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer Note */}
          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              BizFlow Enterprise Cloud • Encrypted with TLS 1.3 & BCrypt • Made for modern commerce
            </p>
          </div>
        </div>
      </div>

      {/* Terms & Privacy Policy Modal */}
      <LegalModal
        isOpen={!!legalModalType}
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
};
