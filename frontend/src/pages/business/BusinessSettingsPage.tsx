import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { businessApi, BusinessUpdateRequest } from '../../api/business';
import { usersApi } from '../../api/users';
import { BusinessType } from '../../api/auth';
import { formatCurrency } from '../../utils/currency';
import { ButtonSpinner } from '../../components/common/LoadingStates';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import {
  Building2,
  Percent,
  Save,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Globe,
  Receipt,
  Boxes,
  Upload,
  Trash2,
  Link as LinkIcon,
} from 'lucide-react';

export const BusinessSettingsPage: React.FC = () => {
  const { business, user, updateBusinessState, updateUserLanguage } = useAuth();
  const { t, i18n } = useTranslation();

  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('RETAIL');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState('');
  const [logoProcessing, setLogoProcessing] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  // Language settings state
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    user?.preferredLanguage || i18n.language || 'en'
  );
  const [languageSaving, setLanguageSaving] = useState(false);
  const [languageSuccess, setLanguageSuccess] = useState<string | null>(null);

  const handleLanguageChange = async (newLang: string) => {
    setSelectedLanguage(newLang);
    setLanguageSaving(true);
    setLanguageSuccess(null);
    try {
      await usersApi.updateMyLanguage(newLang);
      updateUserLanguage(newLang);
      
      const successMsgs: Record<string, string> = {
        en: 'Language updated successfully',
        hi: 'भाषा सफलतापूर्वक अपडेट की गई',
        mr: 'भाषा यशस्वीरित्या बदलली',
        bn: 'ভাষা সফলভাবে আপডেট করা হয়েছে',
        gu: 'ભાષા સફળતાપૂર્વક અપડેટ કરવામાં આવી',
        ta: 'மொழி வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
        te: 'భాష విజయవంతంగా నవీకరించబడింది',
        kn: 'ಭಾಷೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ',
        ml: 'ഭാഷ വിജയകരമായി പുതുക്കി',
        pa: 'ਭਾਸ਼ਾ ਸਫਲਤਾਪੂਰਵਕ ਅੱਪਡੇਟ ਕੀਤੀ ਗਈ',
        es: 'Idioma actualizado correctamente',
        fr: 'Langue mise à jour avec succès',
        de: 'Sprache erfolgreich aktualisiert',
        pt: 'Idioma atualizado com sucesso',
        ar: 'تم تحديث اللغة بنجاح',
        zh: '语言已成功更新',
        ja: '言語が正常に更新されました',
        ko: '언어가 성공적으로 업데이트되었습니다',
      };
      setLanguageSuccess(successMsgs[newLang] || successMsgs.en);
    } catch {
      setLanguageSuccess(null);
    } finally {
      setLanguageSaving(false);
    }
  };

  // Tax settings
  const [taxRate, setTaxRate] = useState<number>(0);
  const [taxName, setTaxName] = useState('GST');
  const [taxNumber, setTaxNumber] = useState('');
  const [taxInclusive, setTaxInclusive] = useState(false);

  // Business Tier & Inventory
  const [businessSize, setBusinessSize] = useState<'SMALL' | 'LARGE'>('SMALL');
  const [inventoryEnabled, setInventoryEnabled] = useState(true);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (business) {
      setName(business.name || '');
      setBusinessType(business.businessType || 'RETAIL');
      setEmail(business.email || '');
      setPhone(business.phone || '');
      setAddress(business.address || '');
      setLogo(business.logo || '');
      setCurrency(business.currency || 'USD');
      setTimezone(business.timezone || 'Asia/Kolkata');
      setTaxRate(business.taxRate ?? 0);
      setTaxName(business.taxName || 'GST');
      setTaxNumber(business.taxNumber || '');
      setTaxInclusive(business.taxInclusive ?? false);
      setBusinessSize(business.businessSize || 'SMALL');
      setInventoryEnabled(business.inventoryEnabled ?? true);
    }
  }, [business]);

  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error(t('settings.invalidImageType', 'Please select a valid image file (PNG, JPG, WebP, SVG).')));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error(t('settings.imageTooLarge', 'Image size must be less than 5MB.')));
        return;
      }

      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read SVG file.'));
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 512;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png', 0.9);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to parse image file.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  };

  const [logoSaving, setLogoSaving] = useState(false);
  const [logoSuccessMessage, setLogoSuccessMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoProcessing(true);
    setLogoError(null);
    setLogoSuccessMessage(null);
    try {
      const dataUrl = await processImageFile(file);
      setLogo(dataUrl);
    } catch (err: any) {
      setLogoError(err.message || 'Failed to process selected image.');
    } finally {
      setLogoProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    setLogo('');
    setLogoError(null);
    setLogoSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveLogoOnly = async () => {
    setLogoSaving(true);
    setLogoError(null);
    setLogoSuccessMessage(null);

    try {
      const updateData: BusinessUpdateRequest = {
        name: name || business?.name || 'My Business',
        businessType: businessType || business?.businessType || 'RETAIL',
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        logo: logo.trim(),
        currency: currency || business?.currency || 'USD',
        timezone: timezone || business?.timezone || 'Asia/Kolkata',
        taxRate: Number(taxRate ?? business?.taxRate ?? 0),
        taxName: taxName || business?.taxName || 'GST',
        taxNumber: taxNumber || business?.taxNumber || undefined,
        taxInclusive: taxInclusive ?? business?.taxInclusive ?? false,
        businessSize: businessSize || business?.businessSize || 'SMALL',
        inventoryEnabled: inventoryEnabled ?? business?.inventoryEnabled ?? true,
      };

      const updated = await businessApi.updateMyBusiness(updateData);
      updateBusinessState(updated);
      setLogo(updated.logo || '');
      setLogoSuccessMessage(t('settings.logoSaved', 'Logo saved and persisted successfully!'));
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to save business logo. Please try again.';
      setLogoError(msg);
    } finally {
      setLogoSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setLogoSuccessMessage(null);

    try {
      const updateData: BusinessUpdateRequest = {
        name,
        businessType,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        logo: logo.trim(),
        currency,
        timezone,
        taxRate: Number(taxRate),
        taxName: taxName || 'GST',
        taxNumber: taxNumber || undefined,
        taxInclusive,
        businessSize,
        inventoryEnabled,
      };

      const updated = await businessApi.updateMyBusiness(updateData);
      updateBusinessState(updated);
      setLogo(updated.logo || '');
      setSuccessMessage(t('settings.settingsSaved'));
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to save business settings. Please try again.';
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  // Tax simulation calculation for a sample 100 unit item
  const sampleBasePrice = 100;
  const simulatedTaxAmount = taxInclusive
    ? sampleBasePrice - sampleBasePrice / (1 + Number(taxRate) / 100)
    : (sampleBasePrice * Number(taxRate)) / 100;
  const simulatedTotalPrice = taxInclusive ? sampleBasePrice : sampleBasePrice + simulatedTaxAmount;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{t('settings.title')}</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          {t('settings.subtitle')}
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Language Preference Card */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              <Globe size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">{t('settings.languageSection')}</h2>
              <p className="text-xs text-zinc-500">{t('settings.languageDesc')}</p>
            </div>
          </div>
          {languageSaving && (
            <span className="text-xs text-brand-600 font-medium animate-pulse">{t('settings.saving')}</span>
          )}
        </div>

        {languageSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>{languageSuccess}</span>
          </div>
        )}

        <div className="max-w-md">
          <LanguageSelector
            value={selectedLanguage}
            onChange={handleLanguageChange}
          />
          <p className="text-[11px] text-zinc-500 mt-2">
            {t('settings.languageHint')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile & Branding Card */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold">
              <Building2 size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">{t('settings.generalInfo')}</h2>
              <p className="text-xs text-zinc-500">{t('settings.generalInfoDesc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                {t('settings.businessName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Coffee & Bistro"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                {t('settings.businessType')} <span className="text-red-500">*</span>
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs bg-white text-zinc-800"
              >
                <option value="RETAIL">Retail Store / Shop</option>
                <option value="GROCERY">Grocery & Kirana Store</option>
                <option value="SUPERMARKET">Supermarket / Hypermarket</option>
                <option value="RESTAURANT">Restaurant / Fine Dining</option>
                <option value="CAFE">Café & Coffee Shop</option>
                <option value="BAKERY">Bakery & Patisserie</option>
                <option value="SWEET_SHOP">Sweet Shop / Mithai</option>
                <option value="SALON">Salon & Hair Studio</option>
                <option value="BEAUTY_PARLOUR">Beauty Parlour & Spa</option>
                <option value="CLOTHING">Clothing & Apparel / Boutique</option>
                <option value="ELECTRONICS">Electronics & Appliances</option>
                <option value="PHARMACY">Pharmacy & Medical Store</option>
                <option value="HARDWARE">Hardware & Electrical</option>
                <option value="FURNITURE">Furniture & Home Decor</option>
                <option value="STATIONERY">Stationery & Book Store</option>
                <option value="MOBILE_STORE">Mobile Store & Tech Hub</option>
                <option value="REPAIR">Repair & Service Center</option>
                <option value="FITNESS">Gym & Fitness Studio</option>
                <option value="HOTEL">Hotel & Hospitality</option>
                <option value="CATERING">Catering & Event Services</option>
                <option value="SERVICE">Professional & Trade Services</option>
                <option value="CONSULTANCY">Consultancy & Agency</option>
                <option value="EDUCATION">Education & Coaching Center</option>
                <option value="OTHER">Other Commercial Enterprise</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                {t('settings.contactEmail')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@business.com"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                {t('settings.contactPhone')}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-zinc-700">
                {t('settings.physicalAddress')}
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Floor 2, Tech Park, Outer Ring Road, Bengaluru, Karnataka 560103"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                <span>{t('settings.logo', 'Business Brand Logo')}</span>
                <span className="text-[10px] text-zinc-400 font-normal">PNG, JPG, WebP or SVG (Max 5MB)</span>
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-zinc-200 bg-zinc-50/70">
                {/* Logo Preview Box */}
                <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-zinc-300 bg-white flex items-center justify-center p-2 shrink-0 shadow-xs overflow-hidden group">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Business Logo Preview"
                      className="w-full h-full object-contain"
                      onError={() => setLogoError('Failed to display image from provided source.')}
                    />
                  ) : (
                    <div className="text-center p-2 text-zinc-400 flex flex-col items-center">
                      <ImageIcon size={24} className="text-zinc-300 mb-0.5" />
                      <span className="text-[9px] font-medium text-zinc-400">No Logo</span>
                    </div>
                  )}
                  {logoProcessing && (
                    <div className="absolute inset-0 bg-white/85 flex flex-col items-center justify-center space-y-1">
                      <ButtonSpinner className="text-brand-600" />
                      <span className="text-[9px] font-bold text-brand-600">Processing</span>
                    </div>
                  )}
                </div>

                {/* Actions & Inputs */}
                <div className="flex-1 space-y-2.5 w-full">
                  {/* Status Indicator */}
                  {logo !== (business?.logo || '') ? (
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                      <AlertCircle size={12} className="text-amber-600" />
                      <span>Unsaved logo changes • Click "Save Logo" to apply</span>
                    </div>
                  ) : business?.logo ? (
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      <span>Saved &amp; active across all invoices and documents</span>
                    </div>
                  ) : null}

                  {logoSuccessMessage && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{logoSuccessMessage}</span>
                    </div>
                  )}

                  {logoError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-xs font-semibold">
                      <AlertCircle size={14} className="text-rose-600 shrink-0" />
                      <span>{logoError}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      className="hidden"
                    />

                    {/* 1. Upload / Change Logo */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={logoProcessing || logoSaving}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Upload size={13} />
                      <span>{logo ? t('common.changeLogo', 'Change Logo') : t('common.uploadLogo', 'Upload Logo')}</span>
                    </button>

                    {/* 2. Remove Logo */}
                    {logo && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={logoProcessing || logoSaving}
                        className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        <span>{t('common.remove', 'Remove Logo')}</span>
                      </button>
                    )}

                    {/* 3. Dedicated Save Logo Action */}
                    <button
                      type="button"
                      onClick={handleSaveLogoOnly}
                      disabled={logoSaving || logoProcessing || logo === (business?.logo || '')}
                      className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {logoSaving ? (
                        <ButtonSpinner text="Saving Logo..." spinnerColor="text-white" />
                      ) : (
                        <>
                          <Save size={13} />
                          <span>Save Logo</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <LinkIcon size={12} />
                      <span>{showUrlInput ? t('settings.hideUrl', 'Hide URL') : t('settings.enterUrl', 'Paste URL')}</span>
                    </button>
                  </div>

                  {showUrlInput && (
                    <div className="pt-1">
                      <input
                        type="url"
                        value={logo}
                        onChange={(e) => {
                          setLogo(e.target.value);
                          setLogoError(null);
                        }}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                      />
                    </div>
                  )}

                  <p className="text-[11px] text-zinc-500 leading-tight pt-1">
                    {t('settings.logoHint', 'Your logo is securely stored and automatically displayed on POS receipts, tax invoices, PDF exports, and client review pages.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Regional Settings */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold">
              <Globe size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">{t('settings.currencyAndRegional')}</h2>
              <p className="text-xs text-zinc-500">{t('settings.currencyAndRegionalDesc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                {t('settings.operatingCurrency')}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs bg-white text-zinc-800"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CAD">CAD ($) - Canadian Dollar</option>
                <option value="AUD">AUD ($) - Australian Dollar</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
                <option value="AED">AED (د.إ) - UAE Dirham</option>
                <option value="SGD">SGD ($) - Singapore Dollar</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                {t('settings.systemTimezone')}
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs bg-white text-zinc-800"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New York (EST/EDT)</option>
                <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                <option value="America/Los_Angeles">America/Los Angeles (PST/PDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tax Configuration & Simulation */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              <Percent size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">{t('settings.taxSettings')}</h2>
              <p className="text-xs text-zinc-500">
                {t('settings.taxSettingsDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                {t('settings.taxName')}
              </label>
              <input
                type="text"
                value={taxName}
                onChange={(e) => setTaxName(e.target.value)}
                placeholder="e.g. GST, VAT, Sales Tax"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                {t('settings.taxRate')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 18.0"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                {t('settings.taxNumber')}
              </label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="e.g. 29AAAAA0000A1Z5"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
              />
            </div>
          </div>

          {/* Tax Inclusive Toggle */}
          <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-900">{t('settings.taxInclusive')}</span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-medium">
                  {taxInclusive ? t('common.active') : t('common.inactive')}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                {t('settings.taxInclusiveDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={taxInclusive}
                onChange={(e) => setTaxInclusive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>

          {/* Live Tax Simulation Box */}
          <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="flex items-center gap-1.5 text-zinc-700 font-medium text-xs">
              <Receipt size={14} className="text-zinc-500" />
              <span>{t('settings.taxPreview')}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-zinc-200">
                <span className="text-zinc-400 block text-[10px]">{t('settings.netItemPrice')}</span>
                <span className="font-medium text-zinc-900">
                  {formatCurrency(
                    taxInclusive ? sampleBasePrice - simulatedTaxAmount : sampleBasePrice,
                    currency
                  )}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-zinc-200">
                <span className="text-zinc-400 block text-[10px]">
                  {taxName} ({taxRate}%)
                </span>
                <span className="font-medium text-zinc-700">
                  +{formatCurrency(simulatedTaxAmount, currency)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-zinc-200">
                <span className="text-zinc-400 block text-[10px]">{t('settings.totalBilled')}</span>
                <span className="font-bold text-brand-700">
                  {formatCurrency(simulatedTotalPrice, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Scale Tier & Inventory Control */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold">
              <Boxes size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">{t('settings.businessScale')}</h2>
              <p className="text-xs text-zinc-500">
                {t('settings.businessScaleDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Small Business Option Card */}
            <div
              onClick={() => setBusinessSize('SMALL')}
              className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                businessSize === 'SMALL'
                  ? 'border-brand-600 bg-brand-50/30 ring-1 ring-brand-600'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900">{t('settings.smallBizTier')}</span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-medium">
                    {t('settings.smallBizTierBadge')}
                  </span>
                </div>
                <input
                  type="radio"
                  name="businessSize"
                  checked={businessSize === 'SMALL'}
                  onChange={() => setBusinessSize('SMALL')}
                  className="w-3.5 h-3.5 text-brand-600 focus:ring-brand-500"
                />
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                {t('settings.smallBizTierDesc')}
              </p>
            </div>

            {/* Large Business Option Card */}
            <div
              onClick={() => setBusinessSize('LARGE')}
              className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                businessSize === 'LARGE'
                  ? 'border-brand-600 bg-brand-50/30 ring-1 ring-brand-600'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900">{t('settings.largeBizTier')}</span>
                  <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-medium">
                    {t('settings.largeBizTierBadge')}
                  </span>
                </div>
                <input
                  type="radio"
                  name="businessSize"
                  checked={businessSize === 'LARGE'}
                  onChange={() => setBusinessSize('LARGE')}
                  className="w-3.5 h-3.5 text-brand-600 focus:ring-brand-500"
                />
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                {t('settings.largeBizTierDesc')}
              </p>
            </div>
          </div>

          {/* Master Inventory Enable/Disable Toggle */}
          <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-900">{t('settings.inventoryModule')}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    inventoryEnabled
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {inventoryEnabled ? t('common.active') : t('common.inactive')}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                {t('settings.inventoryModuleDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={inventoryEnabled}
                onChange={(e) => setInventoryEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <ButtonSpinner text={t('settings.saving')} spinnerColor="text-white" />
            ) : (
              <>
                <Save size={15} />
                <span>{t('settings.saveSettings')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};



