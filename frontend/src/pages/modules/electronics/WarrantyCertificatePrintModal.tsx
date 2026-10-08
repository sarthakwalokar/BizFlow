import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { DeviceSerialItem } from '../../../api/modules';
import {
  Printer,
  X,
  ShieldCheck,
  Award,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';

interface WarrantyCertificatePrintModalProps {
  device: DeviceSerialItem;
  onClose: () => void;
}

export const WarrantyCertificatePrintModal: React.FC<WarrantyCertificatePrintModalProps> = ({
  device,
  onClose,
}) => {
  const { t } = useTranslation();
  const { business } = useAuth();

  useEffect(() => {
    document.body.classList.add('receipt-modal-open');
    return () => {
      document.body.classList.remove('receipt-modal-open');
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const businessName = business?.name || 'BIZFLOW ELECTRONICS & APPLIANCES';
  const businessAddress = business?.address;
  const businessPhone = business?.phone;
  const businessEmail = business?.email;
  const businessTaxNumber = business?.taxNumber;

  const isExpired = device.warrantyStatus === 'EXPIRED' || device.warrantyStatus === 'VOID';
  const isExpiringSoon = device.warrantyStatus === 'EXPIRING_SOON';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto receipt-modal-backdrop backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-auto overflow-hidden flex flex-col max-h-[95vh] border border-zinc-200 receipt-modal-container transition-all">
        {/* Controls Toolbar (Hidden during print) */}
        <div className="px-5 py-3.5 bg-zinc-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold truncate">
                {t('electronics.warrantyCertificateTitle', 'Warranty Certificate & Ownership Card')}
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono truncate">
                SN: {device.serialNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Printer size={14} />
              <span>{t('electronics.printCertificate', 'Print Certificate')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 Certificate Layout) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-100 flex justify-center items-center receipt-printable-content">
          <div
            id="printable-receipt-content"
            className="w-full max-w-[700px] bg-white border-8 border-double border-slate-900 p-8 sm:p-10 space-y-6 shadow-xl text-slate-900 box-border rounded-xl print:border-4 print:border-slate-900 print:shadow-none print:p-6 print:w-full print:max-w-[190mm] print:mx-auto"
          >
            {/* Certificate Header / Issuer Branding */}
            <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                {business?.logo && (
                  <img
                    src={business.logo}
                    alt={businessName}
                    className="max-h-12 max-w-[140px] object-contain mb-1"
                    onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                  />
                )}
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
                  {businessName}
                </h1>
                {businessAddress && <p className="text-xs text-slate-600">{businessAddress}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-500 font-mono pt-0.5">
                  {businessPhone && <span>Ph: {businessPhone}</span>}
                  {businessEmail && <span>Email: {businessEmail}</span>}
                  {businessTaxNumber && <span className="font-bold text-slate-700">GSTIN: {businessTaxNumber}</span>}
                </div>
              </div>

              <div className="text-right sm:text-right shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-black tracking-wider uppercase">
                  <Award size={14} className="text-amber-400" />
                  <span>OFFICIAL CERTIFICATE</span>
                </div>
                <p className="text-xs font-mono font-bold text-slate-900 mt-2">
                  Ref: CERT-{device.serialNumber.slice(-8).toUpperCase()}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Issued: {new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </p>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="text-center space-y-1 py-1">
              <h2 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-widest">
                CERTIFICATE OF DEVICE OWNERSHIP & WARRANTY
              </h2>
              <p className="text-xs text-slate-500 italic">
                This document certifies the authorized purchase and active warranty coverage for the equipment specified below.
              </p>
            </div>

            {/* Device Details Box */}
            <div className="rounded-xl border border-slate-300 p-4 bg-slate-50/70 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Smartphone size={16} className="text-slate-800" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Hardware Equipment & Serial Identification
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Product Name / Model</span>
                  <span className="font-bold text-slate-950 text-sm block">
                    {device.productName} {device.model ? `(${device.model})` : ''}
                  </span>
                  {device.brand && <span className="text-[11px] text-slate-600 block">Brand: {device.brand}</span>}
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Serial Number (S/N)</span>
                  <span className="font-mono font-black text-base text-slate-950 bg-white px-2 py-0.5 rounded border border-slate-300 inline-block">
                    {device.serialNumber}
                  </span>
                </div>

                {device.imeiNumber && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">IMEI / Identification</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">{device.imeiNumber}</span>
                  </div>
                )}

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Warranty Underwriter</span>
                  <span className="font-bold text-slate-800 text-xs">
                    {device.warrantyProvider || 'Store Standard OEM Warranty'}
                  </span>
                </div>
              </div>
            </div>

            {/* Coverage Timeline & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Purchase Date</span>
                <span className="font-mono font-bold text-slate-900 text-xs block">{device.purchaseDate}</span>
                {device.invoiceNumber && (
                  <span className="text-[10px] text-slate-400 font-mono block">Inv #{device.invoiceNumber}</span>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Coverage Duration</span>
                <span className="font-bold text-slate-900 text-sm block">
                  {device.warrantyMonths} Months
                </span>
                <span className="text-[10px] text-slate-500 block">From date of invoice</span>
              </div>

              <div className={`p-3.5 rounded-xl border space-y-1 ${
                isExpired
                  ? 'border-rose-200 bg-rose-50/50'
                  : isExpiringSoon
                  ? 'border-amber-200 bg-amber-50/50'
                  : 'border-emerald-200 bg-emerald-50/50'
              }`}>
                <span className="text-[10px] uppercase font-bold block text-slate-600">Warranty Expiration</span>
                <span className={`font-mono font-black text-sm block ${
                  isExpired ? 'text-rose-700' : isExpiringSoon ? 'text-amber-700' : 'text-emerald-800'
                }`}>
                  {device.warrantyExpiryDate}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                  isExpired ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  Status: {device.warrantyStatus}
                </span>
              </div>
            </div>

            {/* Registered Customer Owner */}
            <div className="rounded-xl border border-slate-200 p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Registered Equipment Owner</span>
                <span className="font-bold text-slate-900 text-sm block">
                  {device.customerName || 'Retail Customer'}
                </span>
                <span className="text-[11px] text-slate-600">
                  {device.customerPhone ? `Contact: ${device.customerPhone}` : 'Direct In-store Purchase'}
                  {device.customerEmail ? ` • ${device.customerEmail}` : ''}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0">
                <CheckCircle2 size={15} />
                <span>VERIFIED REGISTRATION</span>
              </div>
            </div>

            {/* Terms of Coverage */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-[10px] text-slate-500 leading-relaxed">
              <p className="font-bold text-slate-700 uppercase">Standard Warranty Terms & Guidelines:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Warranty covers manufacturing defects, hardware component malfunctions, and internal electronics failure during normal intended usage.</li>
                <li>Physical drops, liquid ingress/water damage, unauthorized third-party repairs, and removed serial number labels immediately void this certificate.</li>
                <li>Original purchase invoice and this serial warranty certificate must be presented when filing service or replacement claims.</li>
              </ul>
            </div>

            {/* Official Signatures & Seal Section */}
            <div className="border-t-2 border-slate-900 pt-6 flex items-end justify-between gap-6">
              <div className="text-[10px] text-slate-400 space-y-0.5">
                <p>BizFlow Digital Equipment Registry</p>
                <p>Verified on {new Date().toLocaleDateString()}</p>
              </div>

              <div className="flex gap-8 sm:gap-12">
                <div className="text-center">
                  <div className="h-10 border-b border-dashed border-slate-400 w-32 mb-1" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                    Customer Signature
                  </span>
                </div>

                <div className="text-center">
                  <div className="h-10 border-b-2 border-slate-900 w-36 mb-1 flex items-end justify-center pb-1">
                    <span className="text-[10px] font-black text-slate-900 font-mono uppercase">AUTHORIZED STORE</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block">
                    Authorized Signatory & Seal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Controls (Hidden during print) */}
        <div className="p-4 bg-white border-t border-zinc-200 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <p className="text-xs text-zinc-500">
            A4 Certificate Format • Prints cleanly with official border
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              {t('common.close', 'Close')}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer size={15} />
              <span>{t('electronics.printCertificate', 'Print Certificate')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
