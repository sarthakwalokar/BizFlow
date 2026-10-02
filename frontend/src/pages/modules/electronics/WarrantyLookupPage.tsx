import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { electronicsApi, WarrantyLookupResult } from '../../../api/modules';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Printer,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const WarrantyLookupPage: React.FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WarrantyLookupResult | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const res = await electronicsApi.lookupWarranty(query.trim());
      setResult(res);
    } catch (err) {
      console.error('Failed to lookup warranty', err);
    } finally {
      setLoading(false);
    }
  };

  const device = result?.device;
  const isExpired = device?.warrantyStatus === 'EXPIRED';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('electronics.warrantyTitle', 'Live Warranty & Device Lookup')}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>{t('electronics.serialVerification', 'Serial Verification')}</span>
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {t('electronics.warrantySubtitle', 'Verify authentic warranty validity, purchase invoice link, and claim eligibility.')}
        </p>
      </div>

      {/* Search Box Card */}
      <div className="clay-card p-6 space-y-4">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              required
              placeholder={t('electronics.searchPlaceholder', 'Enter Serial Number or IMEI...')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck size={16} />
            <span>{loading ? t('common.loading', 'Verifying...') : t('electronics.checkWarranty', 'Check Warranty')}</span>
          </button>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div>
          {!result.found || !device ? (
            <div className="clay-card p-10 text-center text-slate-400 space-y-3">
              <ShieldAlert size={36} className="mx-auto text-rose-400" />
              <div>
                <p className="font-bold text-slate-800 text-sm">{result.message || t('electronics.noDeviceFound', 'No device found')}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {t('electronics.noDeviceDesc', 'Double check the serial number or IMEI for typos.')}
                </p>
              </div>
            </div>
          ) : (
            <div className="clay-card p-6 sm:p-8 space-y-6 border-t-4 border-t-emerald-600">
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                    isExpired ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {isExpired ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{device.productName}</h2>
                    <p className="text-xs text-slate-500">{device.brand} {device.model}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold ${
                      isExpired
                        ? 'bg-rose-100 text-rose-900 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {isExpired ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                    <span>{device.warrantyStatus}</span>
                  </span>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    {device.daysRemaining > 0 ? t('electronics.daysRemaining', '{{count}} days remaining', { count: device.daysRemaining }) : t('electronics.warrantyExpired', 'Warranty Expired')}
                  </p>
                </div>
              </div>

              {/* Specs & Hardware Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-semibold text-slate-400 text-[10px] uppercase block">{t('electronics.serialNumber', 'Serial Number')}</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{device.serialNumber}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-semibold text-slate-400 text-[10px] uppercase block">{t('electronics.imeiNumber', 'IMEI Number')}</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{device.imeiNumber || t('common.notAvailable', 'N/A')}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-semibold text-slate-400 text-[10px] uppercase block">{t('electronics.warrantyProvider', 'Warranty Provider')}</span>
                  <span className="font-bold text-slate-900 text-sm">{device.warrantyProvider || t('electronics.storeStandard', 'Store Standard')}</span>
                </div>
              </div>

              {/* Timeline Grid */}
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">{t('electronics.purchaseDate', 'Purchase Date')}</span>
                  <span className="font-mono font-bold text-slate-900">{device.purchaseDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">{t('electronics.coverageTerm', 'Coverage Term')}</span>
                  <span className="font-bold text-slate-900">{t('electronics.monthsCount', '{{count}} Months', { count: device.warrantyMonths })}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">{t('electronics.warrantyExpiryDate', 'Warranty Expiry Date')}</span>
                  <span className="font-mono font-bold text-emerald-800">{device.warrantyExpiryDate}</span>
                </div>
              </div>

              {/* Customer Ownership */}
              <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block">{t('electronics.registeredOwner', 'Registered Owner')}:</span>
                  <span className="text-slate-600">{device.customerName || t('pos.walkIn', 'Walk-in Customer')} • {device.customerPhone || t('common.none', 'No phone recorded')}</span>
                  {device.invoiceNumber && (
                    <span className="text-[11px] text-slate-400 block font-mono">{t('electronics.invoiceRef', 'Invoice Reference: #{{number}}', { number: device.invoiceNumber })}</span>
                  )}
                </div>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer self-start sm:self-auto shadow-xs"
                >
                  <Printer size={13} />
                  <span>{t('electronics.printCertificate', 'Print Certificate')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
