import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { businessApi, BusinessUpdateRequest } from '../../api/business';
import { BusinessType } from '../../api/auth';
import { formatCurrency } from '../../utils/currency';
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
  const [currency, setCurrency] = useState('USD');
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
        taxName: taxName || 'GST',
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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Business Settings</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Manage your organization profile, industry vertical, currency, and tax computation rules.
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-800 text-xs">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile & Branding Card */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold">
              <Building2 size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">General Information & Branding</h2>
              <p className="text-xs text-zinc-500">Legal identity, business vertical, and contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Coffee & Bistro"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                Business Type / Vertical <span className="text-red-500">*</span>
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-white text-zinc-800"
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

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                Business Contact Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@business.com"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                Business Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-zinc-700">
                Physical Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Floor 2, Tech Park, Outer Ring Road, Bengaluru, Karnataka 560103"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-zinc-700">
                Brand Logo URL
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
                />
                {logo ? (
                  <img
                    src={logo}
                    alt="Logo Preview"
                    className="w-9 h-9 rounded-lg object-cover border border-zinc-200 bg-zinc-50"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg border border-dashed border-zinc-300 flex items-center justify-center text-zinc-400">
                    <ImageIcon size={15} />
                  </div>
                )}
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
              <h2 className="text-sm font-semibold text-zinc-900">Currency & Regional Standards</h2>
              <p className="text-xs text-zinc-500">Transaction currencies and timestamp format</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                Operating Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-white text-zinc-800"
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
                System Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-white text-zinc-800"
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
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Percent size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Tax Settings & Invoicing Rules</h2>
              <p className="text-xs text-zinc-500">
                Configure GST / VAT / Sales Tax rates applied during invoice checkout
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                Tax Name / Label
              </label>
              <input
                type="text"
                value={taxName}
                onChange={(e) => setTaxName(e.target.value)}
                placeholder="e.g. GST, VAT, Sales Tax"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 18.0"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                GST / Tax Registration No.
              </label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="e.g. 29AAAAA0000A1Z5"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          {/* Tax Inclusive Toggle */}
          <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-900">Tax Inclusive Pricing</span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-medium">
                  {taxInclusive ? 'ACTIVE' : 'EXCLUSIVE'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                When enabled, catalog item prices include {taxName || 'tax'}. When disabled, tax is calculated on top.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={taxInclusive}
                onChange={(e) => setTaxInclusive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Live Tax Simulation Box */}
          <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="flex items-center gap-1.5 text-zinc-700 font-medium text-xs">
              <Receipt size={14} className="text-zinc-500" />
              <span>Receipt Calculation Preview (Sample base item)</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-zinc-200">
                <span className="text-zinc-400 block text-[10px]">Net Item Price</span>
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
                <span className="text-zinc-400 block text-[10px]">Total Billed</span>
                <span className="font-bold text-emerald-700">
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
              <h2 className="text-sm font-semibold text-zinc-900">Business Scale & Inventory Control</h2>
              <p className="text-xs text-zinc-500">
                Choose between streamlined single-counter stock and multi-location supply chain inventory
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Small Business Option Card */}
            <div
              onClick={() => setBusinessSize('SMALL')}
              className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                businessSize === 'SMALL'
                  ? 'border-emerald-600 bg-emerald-50/20'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900">Small Business Tier</span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-medium">
                    Lean Mode
                  </span>
                </div>
                <input
                  type="radio"
                  name="businessSize"
                  checked={businessSize === 'SMALL'}
                  onChange={() => setBusinessSize('SMALL')}
                  className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                For single-location stores, cafés, bakeries, and salons. Simplified stock tracking with current quantities, low-stock warnings, and fast on-the-fly stock adjustments.
              </p>
            </div>

            {/* Large Business Option Card */}
            <div
              onClick={() => setBusinessSize('LARGE')}
              className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                businessSize === 'LARGE'
                  ? 'border-emerald-600 bg-emerald-50/20'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900">Large Enterprise Tier</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-medium">
                    Supply Chain
                  </span>
                </div>
                <input
                  type="radio"
                  name="businessSize"
                  checked={businessSize === 'LARGE'}
                  onChange={() => setBusinessSize('LARGE')}
                  className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Full-featured inventory management with multi-location/warehouse support, supplier procurement, purchase intake orders, audit-safe stock movements ledger, and valuation metrics.
              </p>
            </div>
          </div>

          {/* Master Inventory Enable/Disable Toggle */}
          <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-900">Inventory Module</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    inventoryEnabled
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {inventoryEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                When enabled, the Inventory module will appear in the navigation bar and automatically track stock on sales.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={inventoryEnabled}
                onChange={(e) => setInventoryEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save size={15} />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

