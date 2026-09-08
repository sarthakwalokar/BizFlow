import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { businessApi, BusinessUpdateRequest } from '../../api/business';
import { BusinessType } from '../../api/auth';
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
} from 'lucide-react';

export const BusinessSettingsPage: React.FC = () => {
  const { business, updateBusinessState } = useAuth();

  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('RETAIL');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

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
      setCurrency(business.currency || 'INR');
      setTimezone(business.timezone || 'Asia/Kolkata');
      setTaxRate(business.taxRate ?? 0);
      setTaxName(business.taxName || 'GST');
      setTaxNumber(business.taxNumber || '');
      setTaxInclusive(business.taxInclusive ?? false);
      setBusinessSize(business.businessSize || 'SMALL');
      setInventoryEnabled(business.inventoryEnabled ?? true);
    }
  }, [business]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updateData: BusinessUpdateRequest = {
        name,
        businessType,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        logo: logo || undefined,
        currency,
        timezone,
        taxRate: Number(taxRate),
        taxName: taxName || 'Sales Tax',
        taxNumber: taxNumber || undefined,
        taxInclusive,
        businessSize,
        inventoryEnabled,
      };

      const updated = await businessApi.updateMyBusiness(updateData);
      updateBusinessState(updated);
      setSuccessMessage('Business profile and tax configuration successfully saved!');
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
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your enterprise profile, vertical mode, currency standards, and tax calculation rules.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-800 text-sm">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile & Branding Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">General Information & Branding</h2>
              <p className="text-xs text-slate-500">Legal identity, business vertical, and contact points</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Business Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Coffee & Bistro"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Business Type / Vertical <span className="text-rose-500">*</span>
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white"
              >
                <option value="RETAIL">Retail Store (Products & Goods)</option>
                <option value="RESTAURANT">Restaurant (Menu & Dining)</option>
                <option value="CAFE">Café & Coffee Shop</option>
                <option value="BAKERY">Bakery & Patisserie</option>
                <option value="SALON">Salon & Spa (Services & Products)</option>
                <option value="SERVICE">Service & Consulting Business</option>
                <option value="OTHER">General Commercial Business</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Business Contact Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@business.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Business Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-1234"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Physical Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Suite 400, 100 Main Street, New York, NY 10001"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Brand Logo URL
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                {logo ? (
                  <img
                    src={logo}
                    alt="Logo Preview"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-50"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                    <ImageIcon size={18} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Regional Settings */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Currency & Regional Standards</h2>
              <p className="text-xs text-slate-500">Transaction currencies and timestamp format</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Operating Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white font-medium"
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

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                System Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white font-medium"
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
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Percent size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Tax Settings & Invoicing Rules</h2>
              <p className="text-xs text-slate-500">
                Configure VAT/GST/Sales Tax rates applied to product checkout and service bills
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tax Name / Label
              </label>
              <input
                type="text"
                value={taxName}
                onChange={(e) => setTaxName(e.target.value)}
                placeholder="e.g. Sales Tax, VAT, GST"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 8.5"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tax / VAT Registration No.
              </label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="e.g. US-123456789 or GB999 9999 73"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>
          </div>

          {/* Tax Inclusive Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="space-y-1 pr-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-800">Tax Inclusive Pricing</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                  {taxInclusive ? 'ACTIVE' : 'EXCLUSIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                When enabled, prices shown on products already include {taxName || 'tax'}. When disabled, tax is added on top during checkout.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={taxInclusive}
                onChange={(e) => setTaxInclusive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Live Tax Simulation Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
                <Receipt size={15} className="text-indigo-600" />
                <span>Live Receipt Calculation Preview (Sample Item @ 100.00 {currency})</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-indigo-100">
                <span className="text-slate-400 block text-[10px]">Net Item Price</span>
                <span className="font-bold text-slate-900">
                  {taxInclusive
                    ? (sampleBasePrice - simulatedTaxAmount).toFixed(2)
                    : sampleBasePrice.toFixed(2)}{' '}
                  {currency}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-indigo-100">
                <span className="text-slate-400 block text-[10px]">
                  {taxName} ({taxRate}%)
                </span>
                <span className="font-bold text-indigo-700">
                  +{simulatedTaxAmount.toFixed(2)} {currency}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-indigo-100">
                <span className="text-slate-400 block text-[10px]">Total Customer Billed</span>
                <span className="font-extrabold text-emerald-700">
                  {simulatedTotalPrice.toFixed(2)} {currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Scale Tier & Inventory Control */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Boxes size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Business Scale Tier & Inventory Control</h2>
              <p className="text-xs text-slate-500">
                Configure whether your business runs lean simple stock or advanced multi-location supply chain inventory
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Small Business Option Card */}
            <div
              onClick={() => setBusinessSize('SMALL')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                businessSize === 'SMALL'
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-slate-900">Small Business Tier</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                    Lean Mode
                  </span>
                </div>
                <input
                  type="radio"
                  name="businessSize"
                  checked={businessSize === 'SMALL'}
                  onChange={() => setBusinessSize('SMALL')}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Designed for single-shop retailers, cafés, bakeries, and salons. Simplified product stock tracking with current quantities, low-stock warnings, and fast on-the-fly +/- stock adjustments. Zero complex multi-branch overhead.
              </p>
            </div>

            {/* Large Business Option Card */}
            <div
              onClick={() => setBusinessSize('LARGE')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                businessSize === 'LARGE'
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-slate-900">Large Enterprise Tier</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px]">
                    Full Supply Chain
                  </span>
                </div>
                <input
                  type="radio"
                  name="businessSize"
                  checked={businessSize === 'LARGE'}
                  onChange={() => setBusinessSize('LARGE')}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Full-featured inventory management with multi-location/warehouse support, supplier procurement, purchase intake orders, audit-safe stock movements ledger, and comprehensive inventory valuation analytics.
              </p>
            </div>
          </div>

          {/* Master Inventory Enable/Disable Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="space-y-1 pr-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-800">Inventory & Stock Tracking Module</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    inventoryEnabled
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {inventoryEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                When enabled, the Inventory module will appear in your navigation bar and automatically deduct stock when sales bills are generated.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={inventoryEnabled}
                onChange={(e) => setInventoryEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            <Save size={18} />
            <span>{saving ? 'Saving Changes...' : 'Save Business Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
