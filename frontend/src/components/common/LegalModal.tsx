import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, type, onClose }) => {
  const { t } = useTranslation();
  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-xs">
              {type === 'terms' ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {type === 'terms' ? t('legal.termsTitle', 'Terms of Service') : t('legal.privacyTitle', 'Privacy Policy')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('legal.subtitle', 'BizFlow Business Management Platform • Last Updated: September 2026')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {type === 'terms' ? (
            <>
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-900 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  {t('legal.termsWelcome', 'Welcome to BizFlow! By registering an owner account or operating your business workspace, you agree to these Terms of Service.')}
                </span>
              </div>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">
                  {t('legal.terms1Title', '1. Account Responsibility & Security')}
                </h4>
                <p>
                  {t('legal.terms1Desc', 'As a Business Owner, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your business account. You agree to notify BizFlow immediately of any unauthorized access or breach.')}
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">
                  {t('legal.terms2Title', '2. Permitted Commercial Use')}
                </h4>
                <p>
                  {t('legal.terms2Desc', 'BizFlow provides POS billing, inventory tracking, financial analytics, customer review management, and AI business intelligence for lawful business operations. You agree not to misuse the platform or conduct fraudulent financial transactions.')}
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">
                  {t('legal.terms3Title', '3. Data Ownership & Privacy')}
                </h4>
                <p>
                  {t('legal.terms3Desc', 'You retain 100% full ownership of all your business data, product catalog, sales invoices, customer lists, and financial records. BizFlow will never sell your business data or share customer details with third-party advertisers.')}
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">
                  {t('legal.terms4Title', '4. Service Availability & Support')}
                </h4>
                <p>
                  {t('legal.terms4Desc', 'BizFlow operates on enterprise-grade cloud infrastructure with real-time backups. We strive for 99.9% uptime and continuous performance optimization for POS billing and daily shop operations.')}
                </p>
              </section>
            </>
          ) : (
            <>
              <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-100 text-cyan-950 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <span>
                  {t('legal.privacyWelcome', 'Your privacy and business confidentiality are fundamental to BizFlow. We use industry-standard encryption and strict access controls.')}
                </span>
              </div>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">
                  {t('legal.privacy1Title', '1. Information We Collect')}
                </h4>
                <p>
                  {t('legal.privacy1Desc', 'We collect information necessary to operate your business workspace: business profile (name, category, size, address, contact), owner account details (name, email, phone), and operational data you input (products, orders, invoices).')}
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">
                  {t('legal.privacy2Title', '2. How We Protect Your Data')}
                </h4>
                <p>
                  {t('legal.privacy2Desc', 'All credentials, API communications, and database records are secured using BCrypt hashing, JWT authentication tokens, and TLS/HTTPS encrypted connections. Sensitive keys and configurations are securely isolated.')}
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">
                  {t('legal.privacy3Title', '3. Customer Review & Public URLs')}
                </h4>
                <p>
                  {t('legal.privacy3Desc', 'When you enable Review Boost, only your public business review URL and customer-facing feedback form are visible publicly. All private feedback analytics and moderation remain strictly private to your owner account.')}
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">
                  {t('legal.privacy4Title', '4. Multi-Language & AI Processing')}
                </h4>
                <p>
                  {t('legal.privacy4Desc', 'AI insights and language translations are processed securely in real-time to enhance your store operations, without using your private financial ledger to train public models.')}
                </p>
              </section>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            {t('legal.closeBtn', 'I Understand & Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
