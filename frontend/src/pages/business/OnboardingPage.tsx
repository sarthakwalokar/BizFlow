import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { businessApi } from '../../api/business';
import { productsApi, ProductRequest } from '../../api/products';
import { reviewsApi } from '../../api/reviews';
import {
  Building,
  Package,
  Receipt,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  QrCode,
  ChevronRight,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, business, updateBusinessState } = useAuth();
  const navigate = useNavigate();

  // Step Completion State
  const [profileDone, setProfileDone] = useState(false);
  const [productDone, setProductDone] = useState(false);
  const [billDone, setBillDone] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  // Active Interactive Modal: null | 'profile' | 'product' | 'review' | 'sample'
  const [activeModal, setActiveModal] = useState<'profile' | 'product' | 'review' | 'sample' | null>(null);

  // Loading & Feedback
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Form States
  // 1. Profile Form
  const [taxNumber, setTaxNumber] = useState(business?.taxNumber || '');
  const [address, setAddress] = useState(business?.address || '');
  const [phone, setPhone] = useState(business?.phone || '');
  const [email, setEmail] = useState(business?.email || '');

  // 2. Product Form
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('199');
  const [prodCost, setProdCost] = useState('120');
  const [prodStock, setProdStock] = useState('50');
  const [prodType, setProdType] = useState<'PHYSICAL' | 'SERVICE'>('PHYSICAL');

  // 3. Review Form
  const [googleReviewUrl, setGoogleReviewUrl] = useState(business?.publicReviewUrl || '');
  const [reviewPrompt, setReviewPrompt] = useState(business?.reviewPromptMessage || 'Thank you for choosing us! How was your experience today?');

  // Initialize status on mount
  useEffect(() => {
    const storageKey = business?.id ? `bizflow_onboarding_${business.id}` : 'bizflow_onboarding';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.profileDone) setProfileDone(true);
        if (parsed.productDone) setProductDone(true);
        if (parsed.billDone) setBillDone(true);
        if (parsed.reviewDone) setReviewDone(true);
      } catch (e) {
        // ignore
      }
    } else {
      // Auto check if business already has address/phone
      if (business?.address && business?.phone) {
        setProfileDone(true);
      }
    }
  }, [business]);

  const saveProgress = (updates: Partial<{ profileDone: boolean; productDone: boolean; billDone: boolean; reviewDone: boolean }>) => {
    const nextState = {
      profileDone: updates.profileDone ?? profileDone,
      productDone: updates.productDone ?? productDone,
      billDone: updates.billDone ?? billDone,
      reviewDone: updates.reviewDone ?? reviewDone,
    };
    const storageKey = business?.id ? `bizflow_onboarding_${business.id}` : 'bizflow_onboarding';
    localStorage.setItem(storageKey, JSON.stringify(nextState));
  };

  const completedCount = [profileDone, productDone, billDone, reviewDone].filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 4) * 100);

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      const updated = await businessApi.updateMyBusiness({
        name: business?.name || 'My Business',
        taxNumber: taxNumber.trim() || undefined,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });
      updateBusinessState(updated);
      setProfileDone(true);
      saveProgress({ profileDone: true });
      setActiveModal(null);
      setFeedbackMessage({ type: 'success', text: t('onboarding.profileSuccess', 'Business profile updated successfully!') });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.response?.data?.message || t('onboarding.profileError', 'Failed to update business profile') });
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Add Product Handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      await productsApi.createProduct({
        name: prodName.trim(),
        price: parseFloat(prodPrice) || 0,
        costPrice: parseFloat(prodCost) || 0,
        stockQuantity: parseInt(prodStock) || 0,
        trackStock: true,
        productType: prodType,
        active: true,
      });
      setProductDone(true);
      saveProgress({ productDone: true });
      setActiveModal(null);
      setFeedbackMessage({ type: 'success', text: t('onboarding.productAddedMsg', 'Product "{{name}}" added to catalogue!', { name: prodName }) });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.response?.data?.message || t('onboarding.productError', 'Failed to create product') });
    } finally {
      setActionLoading(false);
    }
  };

  // Add 3 Sample Products Handler
  const handleAddSampleCatalog = async () => {
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      const samples: ProductRequest[] = [
        { name: t('onboarding.sampleItem1', 'Standard Item / Starter Pack'), price: 299, costPrice: 180, stockQuantity: 50, trackStock: true, productType: 'PHYSICAL', active: true },
        { name: t('onboarding.sampleItem2', 'Premium Service / Consultation'), price: 999, costPrice: 400, stockQuantity: 100, trackStock: false, productType: 'SERVICE', active: true },
        { name: t('onboarding.sampleItem3', 'Quick Essentials / Add-on'), price: 99, costPrice: 50, stockQuantity: 80, trackStock: true, productType: 'PHYSICAL', active: true },
      ];

      for (const item of samples) {
        await productsApi.createProduct(item);
      }

      setProductDone(true);
      saveProgress({ productDone: true });
      setActiveModal(null);
      setFeedbackMessage({ type: 'success', text: t('onboarding.starterCatalogSuccess', 'Starter catalogue added with 3 ready-to-sell items!') });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.response?.data?.message || t('onboarding.starterCatalogError', 'Failed to generate starter products') });
    } finally {
      setActionLoading(false);
    }
  };

  // Save Review Booster Settings
  const handleSaveReviews = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      await reviewsApi.updateSettings({
        publicReviewUrl: googleReviewUrl.trim() || undefined,
        reviewPromptMessage: reviewPrompt.trim() || undefined,
        reviewEnabled: true,
      });
      setReviewDone(true);
      saveProgress({ reviewDone: true });
      setActiveModal(null);
      setFeedbackMessage({ type: 'success', text: t('onboarding.reviewConfigSuccess', 'Review Boost configured! Customer QR is ready.') });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.response?.data?.message || t('onboarding.reviewConfigError', 'Failed to save review settings') });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishOnboarding = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-cyan-100 selection:text-blue-900">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
          <div className="flex items-center space-x-3">
            <Link to="/dashboard">
              <img
                src="/Bizflow-logo.png"
                alt="BizFlow"
                className="h-9 w-auto max-w-[160px] object-contain"
              />
            </Link>
            <span className="hidden sm:inline-block text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/80">
              {t('onboarding.workspaceSetup', 'Workspace Setup')}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              <span>{t('onboarding.skipToDashboard', 'Skip to Dashboard')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Welcome Banner Card */}
        <div className="relative rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-900 text-white p-6 sm:p-8 shadow-xl overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-cyan-200">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>{t('onboarding.accountCreated', 'Account Created Successfully')}</span>
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t('onboarding.welcomeTitle', 'Welcome to BizFlow, {{name}}!', { name: user?.fullName || t('common.name', 'Business Owner') })}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
                {t('onboarding.welcomeSubtitle', 'Your business workspace for {{businessName}} is ready. Complete these 4 quick setup steps to begin billing and operations.', { businessName: business?.name || t('common.name', 'Your Business') })}
              </p>
            </div>

            {/* Live Progress Bar */}
            <div className="pt-2 space-y-2 max-w-lg">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-100">
                <span>{t('onboarding.progress', 'Onboarding Progress ({{completed}} of 4 completed)', { completed: completedCount })}</span>
                <span className="font-bold text-cyan-300">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-xs">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {feedbackMessage && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{feedbackMessage.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4 Core Onboarding Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Card 1: Complete Business Profile */}
          <div className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all relative ${
            profileDone ? 'border-emerald-200 shadow-xs' : 'border-slate-200/90 shadow-card hover:border-blue-300'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  profileDone
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                }`}>
                  <Building className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {t('onboarding.profileCardTitle', '1. Business Profile & Tax')}
                    </h3>
                    {profileDone && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3" /> {t('onboarding.done', 'Done')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t('onboarding.profileCardDesc', 'Verify address, GSTIN / Tax number, contact numbers, and currency format for invoice printing.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {profileDone ? t('onboarding.profileConfigured', 'Profile configured') : t('onboarding.pendingVerification', 'Pending verification')}
              </span>
              <button
                type="button"
                onClick={() => setActiveModal('profile')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  profileDone
                    ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xs hover:from-blue-700 hover:to-cyan-600'
                }`}
              >
                {profileDone ? t('onboarding.reviewEditProfile', 'Review / Edit Profile') : t('onboarding.configureProfile', 'Configure Profile →')}
              </button>
            </div>
          </div>

          {/* Card 2: Add Product or Service */}
          <div className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all relative ${
            productDone ? 'border-emerald-200 shadow-xs' : 'border-slate-200/90 shadow-card hover:border-blue-300'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  productDone
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-purple-50 text-purple-600 border border-purple-100'
                }`}>
                  <Package className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {t('onboarding.productCardTitle', '2. Add First Product / Service')}
                    </h3>
                    {productDone && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3" /> {t('onboarding.done', 'Done')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t('onboarding.productCardDesc', 'Create your catalogue items with price, cost, barcode SKU, and stock quantities for fast POS lookup.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleAddSampleCatalog}
                disabled={actionLoading}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                {t('onboarding.addSampleItems', '⚡ Add 3 Sample Items')}
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('product')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  productDone
                    ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xs hover:from-blue-700 hover:to-cyan-600'
                }`}
              >
                {productDone ? t('onboarding.addAnotherItem', '+ Add Another Item') : t('onboarding.addFirstItem', '+ Add First Item →')}
              </button>
            </div>
          </div>

          {/* Card 3: Create First Bill / Test POS */}
          <div className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all relative ${
            billDone ? 'border-emerald-200 shadow-xs' : 'border-slate-200/90 shadow-card hover:border-blue-300'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  billDone
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {t('onboarding.billCardTitle', '3. Create Your First POS Bill')}
                    </h3>
                    {billDone && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3" /> {t('onboarding.done', 'Done')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t('onboarding.billCardDesc', 'Test the high-speed POS terminal with keyboard shortcuts, split payments (Cash / UPI / Card), and thermal receipt prints.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setBillDone(true);
                  saveProgress({ billDone: true });
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {billDone ? t('onboarding.markedAsCompleted', 'Marked as completed') : t('onboarding.markAsReady', 'Mark as ready')}
              </button>
              <Link
                to="/dashboard/pos"
                onClick={() => {
                  setBillDone(true);
                  saveProgress({ billDone: true });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xs hover:from-blue-700 hover:to-cyan-600 transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('onboarding.launchPos', 'Launch POS Terminal')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Enable Review Boost */}
          <div className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all relative ${
            reviewDone ? 'border-emerald-200 shadow-xs' : 'border-slate-200/90 shadow-card hover:border-blue-300'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  reviewDone
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  <Star className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {t('onboarding.reviewCardTitle', '4. Enable Review Boost & QR')}
                    </h3>
                    {reviewDone && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3" /> {t('onboarding.done', 'Done')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t('onboarding.reviewCardDesc', 'Set up your Google Business Review link and generate high-resolution QR counter standees to collect 5-star customer reviews.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {reviewDone ? t('onboarding.reviewActive', 'Review QR Active') : t('onboarding.boostTrust', 'Boost customer trust')}
              </span>
              <button
                type="button"
                onClick={() => setActiveModal('review')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewDone
                    ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xs hover:from-blue-700 hover:to-cyan-600'
                }`}
              >
                {reviewDone ? t('onboarding.viewQrSettings', 'View QR / Settings') : t('onboarding.configureReview', 'Configure Review Boost →')}
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Finish Action */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {t('onboarding.readyToStart', 'Ready to start managing your daily operations?')}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('onboarding.readyToStartDesc', 'You can explore analytics, expense tracking, and AI assistant anytime from your owner dashboard.')}
            </p>
          </div>

          <button
            type="button"
            onClick={handleFinishOnboarding}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <span>{t('onboarding.proceedToDashboard', 'Proceed to Main Dashboard')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODALS FOR INLINE ONBOARDING ACTIONS
         ========================================================================= */}

      {/* 1. Profile Edit Modal */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <Building className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {t('onboarding.completeProfileModalTitle', 'Complete Business Profile')}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('onboarding.gstinTax', 'GSTIN / Tax Registration Number')}
                </label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm uppercase"
                />
                <p className="text-[10px] text-slate-400 mt-1">{t('onboarding.gstinHelp', 'Printed on formal GST invoices')}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('onboarding.fullAddress', 'Full Operating Address')}
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop / Unit #, Street, City, State, PIN"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('onboarding.storePhone', 'Store Phone')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('onboarding.storeEmail', 'Store Email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@store.in"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? t('common.saving', 'Saving...') : t('onboarding.saveProfileBtn', 'Save Profile')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Product Modal */}
      {activeModal === 'product' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <Package className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {t('onboarding.addProductModalTitle', 'Add First Product / Service')}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('onboarding.prodNameLabel', 'Product / Service Name')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Arabica Roast Coffee, Cotton Shirt, Consultation"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('onboarding.sellingPriceLabel', 'Selling Price')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="199"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('onboarding.costPriceLabel', 'Cost Price')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={prodCost}
                    onChange={(e) => setProdCost(e.target.value)}
                    placeholder="120"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('onboarding.initialStockLabel', 'Initial Stock Quantity')}
                  </label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="50"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('onboarding.itemTypeLabel', 'Item Type')}
                  </label>
                  <select
                    value={prodType}
                    onChange={(e) => setProdType(e.target.value as 'PHYSICAL' | 'SERVICE')}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm"
                  >
                    <option value="PHYSICAL">{t('onboarding.physicalProduct', 'Physical Product (Stock Tracked)')}</option>
                    <option value="SERVICE">{t('onboarding.serviceItem', 'Service Item')}</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? t('common.loading', 'Creating...') : t('onboarding.addToCatalogue', 'Add to Catalogue')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Review Booster Modal */}
      {activeModal === 'review' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <Star className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  {t('onboarding.reviewModalTitle', 'Review Boost & QR Counter Standee')}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReviews} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('onboarding.googleUrlLabel', 'Google Business Review URL')}
                </label>
                <input
                  type="url"
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/your-google-place-id/review"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {t('onboarding.googleUrlHelp', '5-star ratings will automatically redirect customers to this Google link.')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('onboarding.customerPromptLabel', 'Customer Prompt Message')}
                </label>
                <input
                  type="text"
                  value={reviewPrompt}
                  onChange={(e) => setReviewPrompt(e.target.value)}
                  placeholder="Thank you for shopping with us! How was your visit?"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <QrCode className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  {t('onboarding.directReviewLink', 'Your direct customer review link:')} <strong className="break-all">{window.location.origin}/review/{business?.reviewSlug || business?.id || 'store'}</strong>
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? t('common.saving', 'Saving...') : t('onboarding.activateReview', 'Activate Review Booster')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
