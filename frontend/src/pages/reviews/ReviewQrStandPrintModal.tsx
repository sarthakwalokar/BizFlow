import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  Printer,
  X,
  QrCode,
  Star,
  Sparkles,
  Smartphone,
  Download,
  HeartHandshake,
} from 'lucide-react';

interface ReviewQrStandPrintModalProps {
  qrCodeDataUrl?: string;
  reviewUrl?: string;
  onClose: () => void;
}

type StandFormat = 'A4_POSTER' | 'COUNTER_STAND' | 'TABLE_TENT';

export const ReviewQrStandPrintModal: React.FC<ReviewQrStandPrintModalProps> = ({
  qrCodeDataUrl,
  reviewUrl: _reviewUrl,
  onClose,
}) => {
  const { t } = useTranslation();
  const { business } = useAuth();
  const [format, setFormat] = useState<StandFormat>('COUNTER_STAND');

  useEffect(() => {
    document.body.classList.add('receipt-modal-open');
    return () => {
      document.body.classList.remove('receipt-modal-open');
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const businessName = business?.name || 'BIZFLOW PARTNER';
  const businessAddress = business?.address;
  const businessPhone = business?.phone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto receipt-modal-backdrop backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-auto overflow-hidden flex flex-col max-h-[95vh] border border-zinc-200 receipt-modal-container transition-all">
        {/* Controls Toolbar (Hidden during print) */}
        <div className="px-5 py-3.5 bg-zinc-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950 font-bold shrink-0">
              <QrCode size={16} />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold truncate">
                {t('reviews.printModalTitle', 'Review QR Stand & Poster')}
              </h3>
              <p className="text-[11px] text-zinc-400 truncate">
                {businessName}
              </p>
            </div>
          </div>

          {/* Format Selection */}
          <div className="flex items-center bg-zinc-800 p-1 rounded-xl border border-zinc-700 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setFormat('COUNTER_STAND')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                format === 'COUNTER_STAND'
                  ? 'bg-amber-500 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>{t('reviews.formatCounter', 'Counter Stand')}</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat('A4_POSTER')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                format === 'A4_POSTER'
                  ? 'bg-amber-500 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>{t('reviews.formatA4Poster', 'A4 Poster')}</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat('TABLE_TENT')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                format === 'TABLE_TENT'
                  ? 'bg-amber-500 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>{t('reviews.formatTableTent', 'Table Tent')}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Paper Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-100 flex justify-center items-center receipt-printable-content">
          {/* 1. COUNTER STAND FORMAT */}
          {format === 'COUNTER_STAND' && (
            <div
              id="printable-receipt-content"
              className="w-full max-w-[420px] bg-white rounded-3xl border-4 border-amber-400/80 p-6 sm:p-8 text-center space-y-5 shadow-xl text-zinc-900 box-border print:border-2 print:border-zinc-800 print:shadow-none print:p-6 print:max-w-none print:w-[130mm] print:mx-auto"
            >
              {/* Business Logo / Name Header */}
              <div className="space-y-1">
                {business?.logo ? (
                  <img
                    src={business.logo}
                    alt={businessName}
                    className="max-h-12 max-w-[140px] mx-auto object-contain"
                    onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                  />
                ) : (
                  <div className="inline-flex p-2.5 rounded-2xl bg-amber-50 text-amber-600 mb-1">
                    <Sparkles size={24} />
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900">
                  {businessName}
                </h2>
                {businessAddress && (
                  <p className="text-[11px] text-zinc-500 line-clamp-1">{businessAddress}</p>
                )}
              </div>

              {/* 5-Star Banner */}
              <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-950 py-2.5 px-4 rounded-2xl shadow-xs space-y-1">
                <div className="flex justify-center items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={20} className="fill-zinc-950 text-zinc-950" />
                  ))}
                </div>
                <p className="text-xs font-black uppercase tracking-wider">
                  {t('reviews.rateYourExperience', 'How was your experience with us?')}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="bg-zinc-50 border-2 border-dashed border-zinc-300 p-5 rounded-2xl flex flex-col items-center justify-center space-y-3">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Scan QR code to review"
                    className="w-48 h-48 sm:w-52 sm:h-52 bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"
                  />
                ) : (
                  <div className="w-48 h-48 bg-white border border-zinc-200 rounded-xl flex flex-col items-center justify-center text-zinc-300 gap-2">
                    <QrCode size={56} />
                    <span className="text-xs text-zinc-400">QR Code Preview</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                  <Smartphone size={15} className="text-amber-600" />
                  <span>{t('reviews.scanWithCamera', 'Scan with any smartphone camera')}</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="grid grid-cols-3 gap-2 text-[10px] text-zinc-600 pt-1 border-t border-zinc-100">
                <div className="p-2 rounded-xl bg-zinc-50 space-y-0.5">
                  <span className="font-bold text-amber-600 block text-xs">1</span>
                  <span>Open Camera</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 space-y-0.5">
                  <span className="font-bold text-amber-600 block text-xs">2</span>
                  <span>Scan QR Code</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 space-y-0.5">
                  <span className="font-bold text-amber-600 block text-xs">3</span>
                  <span>Share Review</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-[10px] text-zinc-400 pt-2 flex items-center justify-center gap-1">
                <HeartHandshake size={12} className="text-amber-500" />
                <span>{t('reviews.thankYouFeedback', 'Thank you for supporting our local business!')}</span>
              </div>
            </div>
          )}

          {/* 2. FULL A4 POSTER FORMAT */}
          {format === 'A4_POSTER' && (
            <div
              id="printable-receipt-content"
              className="w-full max-w-[500px] bg-white rounded-3xl border-2 border-zinc-300 p-8 sm:p-10 text-center space-y-6 shadow-xl text-zinc-900 box-border print:border-none print:shadow-none print:p-8 print:w-full print:max-w-[180mm] print:mx-auto"
            >
              {/* Header */}
              <div className="border-b-2 border-zinc-100 pb-5 space-y-2">
                {business?.logo && (
                  <img
                    src={business.logo}
                    alt={businessName}
                    className="max-h-16 max-w-[180px] mx-auto object-contain mb-2"
                    onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                  />
                )}
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
                  {businessName}
                </h1>
                <p className="text-xs text-zinc-500 font-medium">{businessAddress || 'Official Customer Review Station'}</p>
              </div>

              {/* Catchy Hook */}
              <div className="space-y-2">
                <div className="flex justify-center items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={28} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950 uppercase tracking-tight">
                  {t('reviews.lovedYourVisit', 'Loved Your Visit with Us?')}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
                  {t('reviews.shareYourThoughts', 'Please take 30 seconds to rate us and share your feedback. Your review helps us grow and serve you even better!')}
                </p>
              </div>

              {/* Large QR Display */}
              <div className="p-6 bg-zinc-50 rounded-3xl border-2 border-zinc-200 inline-block mx-auto shadow-inner space-y-3">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Review QR Code"
                    className="w-56 h-56 sm:w-64 sm:h-64 bg-white p-3 rounded-2xl border border-zinc-300 mx-auto shadow-sm"
                  />
                ) : (
                  <div className="w-56 h-56 bg-white border border-zinc-300 rounded-2xl flex items-center justify-center">
                    <QrCode size={64} className="text-zinc-300" />
                  </div>
                )}
                <div className="px-4 py-1.5 rounded-full bg-amber-500 text-zinc-950 text-xs font-black inline-flex items-center gap-1.5 shadow-xs">
                  <Smartphone size={14} />
                  <span>POINT YOUR CAMERA TO SCAN</span>
                </div>
              </div>

              {/* 3 Step Guide */}
              <div className="grid grid-cols-3 gap-3 text-xs pt-4 border-t border-zinc-100">
                <div className="p-3 rounded-2xl bg-zinc-50 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-zinc-900 text-white font-black text-xs flex items-center justify-center mx-auto">
                    1
                  </div>
                  <span className="font-bold text-zinc-900 block">Open Camera</span>
                  <p className="text-[10px] text-zinc-500">Scan QR Code</p>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-zinc-900 text-white font-black text-xs flex items-center justify-center mx-auto">
                    2
                  </div>
                  <span className="font-bold text-zinc-900 block">Tap Link</span>
                  <p className="text-[10px] text-zinc-500">Opens in seconds</p>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-zinc-900 text-white font-black text-xs flex items-center justify-center mx-auto">
                    3
                  </div>
                  <span className="font-bold text-zinc-900 block">Leave Rating</span>
                  <p className="text-[10px] text-zinc-500">★★★★★ Stars</p>
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 pt-2 font-medium">
                {businessPhone && <span>Customer Care: {businessPhone} • </span>}
                <span>Powered by BizFlow Review Boost</span>
              </div>
            </div>
          )}

          {/* 3. TABLE TENT FORMAT (Double-sided foldable) */}
          {format === 'TABLE_TENT' && (
            <div
              id="printable-receipt-content"
              className="w-full max-w-[400px] bg-white rounded-2xl border-2 border-dashed border-zinc-400 p-6 text-center space-y-4 shadow-xl text-zinc-900 box-border print:border print:border-zinc-400 print:shadow-none print:w-[120mm] print:mx-auto"
            >
              <div className="text-[10px] uppercase font-mono text-zinc-400 border-b border-dashed border-zinc-200 pb-1">
                ✂ Fold along center for dining table / counter tent stand
              </div>

              <div className="space-y-1 pt-2">
                <h3 className="text-lg font-black uppercase text-zinc-900">{businessName}</h3>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs font-bold text-zinc-700">{t('reviews.shareYourExperience', 'Share Your Experience')}</p>
              </div>

              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Review QR Code"
                  className="w-40 h-40 bg-white p-2 rounded-xl border border-zinc-200 mx-auto"
                />
              ) : (
                <div className="w-40 h-40 bg-white border border-zinc-200 rounded-xl mx-auto flex items-center justify-center">
                  <QrCode size={48} className="text-zinc-300" />
                </div>
              )}

              <p className="text-[11px] font-bold text-zinc-800">Scan with phone camera</p>
              <p className="text-[9px] text-zinc-400">{t('reviews.thankYouFeedback', 'Thank you for your valuable feedback!')}</p>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Controls (Hidden during print) */}
        <div className="p-4 bg-white border-t border-zinc-200 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-xs text-zinc-500">
            {format === 'COUNTER_STAND' && 'Format: Counter Stand (5×7 / A5)'}
            {format === 'A4_POSTER' && 'Format: Standard A4 Wall Poster'}
            {format === 'TABLE_TENT' && 'Format: Foldable Dining Table Tent'}
          </div>

          <div className="flex items-center gap-2">
            {qrCodeDataUrl && (
              <a
                href={qrCodeDataUrl}
                download={`review-stand-${businessName.replace(/\s+/g, '-').toLowerCase()}.png`}
                className="px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Download size={14} />
                <span>{t('common.download', 'Download PNG')}</span>
              </a>
            )}

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
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer size={15} />
              <span>{t('reviews.printStandee', 'Print Standee')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
