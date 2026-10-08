import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { RepairJobCard } from '../../../api/modules';
import { formatCurrency } from '../../../utils/currency';
import {
  Printer,
  X,
  Wrench,
  Receipt,
  FileText,
} from 'lucide-react';

interface RepairJobCardPrintModalProps {
  jobCard: RepairJobCard;
  onClose: () => void;
}

export const RepairJobCardPrintModal: React.FC<RepairJobCardPrintModalProps> = ({
  jobCard,
  onClose,
}) => {
  const { t } = useTranslation();
  const { business } = useAuth();
  const currency = business?.currency || 'USD';
  const [printFormat, setPrintFormat] = useState<'A4' | 'RECEIPT'>('A4');

  useEffect(() => {
    document.body.classList.add('receipt-modal-open');
    return () => {
      document.body.classList.remove('receipt-modal-open');
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const businessName = business?.name || 'BIZFLOW REPAIR SERVICES';
  const businessAddress = business?.address;
  const businessPhone = business?.phone;
  const businessEmail = business?.email;
  const businessTaxNumber = business?.taxNumber;

  const totalCost = jobCard.totalFinalCost > 0 ? jobCard.totalFinalCost : jobCard.totalEstimatedCost;
  const formattedCreatedDate = new Date(jobCard.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto receipt-modal-backdrop backdrop-blur-xs">
      <div
        className={`bg-white rounded-2xl w-full shadow-2xl my-auto overflow-hidden flex flex-col max-h-[95vh] border border-zinc-200 receipt-modal-container transition-all duration-200 ${
          printFormat === 'A4' ? 'max-w-3xl' : 'max-w-md'
        }`}
      >
        {/* Top Header Controls (Hidden during print) */}
        <div className="px-5 py-3.5 bg-zinc-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold shrink-0">
              <Wrench size={16} />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold truncate">
                {t('repair.jobCardModalTitle', 'Repair Job Card & Handover Slip')}
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono truncate">
                #{jobCard.jobCardNumber}
              </p>
            </div>
          </div>

          {/* Format Switcher */}
          <div className="flex items-center bg-zinc-800 p-1 rounded-xl border border-zinc-700 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setPrintFormat('A4')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                printFormat === 'A4'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText size={13} />
              <span>{t('receipt.a4Invoice', 'A4 Sheet')}</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat('RECEIPT')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                printFormat === 'RECEIPT'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Receipt size={13} />
              <span>{t('receipt.thermalReceipt', '80mm Slip')}</span>
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-100 flex justify-center items-center receipt-printable-content">
          {/* FORMAT 1: STANDARD FULL A4 HANDOVER SLIP */}
          {printFormat === 'A4' && (
            <div
              id="printable-receipt-content"
              className="w-full max-w-[700px] bg-white border border-slate-300 rounded-xl p-8 space-y-5 shadow-xl text-slate-900 box-border print:border-none print:shadow-none print:p-6 print:w-full print:max-w-[190mm] print:mx-auto"
            >
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
                <div>
                  {business?.logo && (
                    <img
                      src={business.logo}
                      alt={businessName}
                      className="max-h-12 max-w-[140px] object-contain mb-1"
                      onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                    />
                  )}
                  <h1 className="text-xl font-black uppercase text-slate-950">{businessName}</h1>
                  {businessAddress && <p className="text-xs text-slate-600">{businessAddress}</p>}
                  <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-500 font-mono mt-0.5">
                    {businessPhone && <span>Ph: {businessPhone}</span>}
                    {businessEmail && <span>Email: {businessEmail}</span>}
                    {businessTaxNumber && <span className="font-bold text-slate-700">GSTIN: {businessTaxNumber}</span>}
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <span className="px-3 py-1 rounded-lg bg-violet-100 text-violet-900 font-black text-xs border border-violet-200 inline-block uppercase">
                    DEVICE INTAKE SLIP
                  </span>
                  <p className="text-sm font-mono font-black text-slate-950 mt-1">
                    #{jobCard.jobCardNumber}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">Date: {formattedCreatedDate}</p>
                </div>
              </div>

              {/* Status & Priority Badge Bar */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600">Current Status:</span>
                  <span className="font-black px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-[10px] uppercase">
                    {jobCard.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600">Priority:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    jobCard.priority === 'URGENT' || jobCard.priority === 'HIGH'
                      ? 'bg-rose-100 text-rose-800 font-black'
                      : 'bg-slate-200 text-slate-800'
                  }`}>
                    {jobCard.priority}
                  </span>
                </div>
              </div>

              {/* Two Column: Customer Info & Device Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Customer Details Box */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block border-b border-slate-100 pb-1">
                    Customer Information
                  </span>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-950 text-sm">
                      {jobCard.customerName || 'Walk-in Client'}
                    </p>
                    {jobCard.customerPhone && (
                      <p className="text-slate-600 font-mono">Phone: {jobCard.customerPhone}</p>
                    )}
                    {jobCard.customerEmail && (
                      <p className="text-slate-600">Email: {jobCard.customerEmail}</p>
                    )}
                    {jobCard.customerAddress && (
                      <p className="text-slate-500 text-[11px]">Address: {jobCard.customerAddress}</p>
                    )}
                  </div>
                </div>

                {/* Device Details Box */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block border-b border-slate-100 pb-1">
                    Device Details
                  </span>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-950 text-sm">
                      {jobCard.brand || ''} {jobCard.model || jobCard.itemType}
                    </p>
                    <p className="text-slate-600">
                      Category: <span className="font-semibold">{jobCard.itemType}</span>
                    </p>
                    {jobCard.serialOrImei && (
                      <p className="text-slate-700 font-mono text-[11px]">
                        Serial/IMEI: <span className="font-bold">{jobCard.serialOrImei}</span>
                      </p>
                    )}
                    {jobCard.assignedTechnician && (
                      <p className="text-slate-600 text-[11px]">Technician: {jobCard.assignedTechnician}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Problem Description & Work Required */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Reported Issue / Fault Description
                </span>
                <p className="text-slate-900 font-medium bg-white p-2.5 rounded-lg border border-slate-200">
                  {jobCard.problemDescription || 'General diagnosis and repair request.'}
                </p>

                {jobCard.diagnosticNotes && (
                  <div className="pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Technician Diagnostic Notes</span>
                    <p className="text-slate-700 italic text-[11px] mt-0.5">{jobCard.diagnosticNotes}</p>
                  </div>
                )}
              </div>

              {/* Cost & Estimated Completion Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Completion</span>
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    {jobCard.estimatedCompletionDate || 'To be communicated'}
                  </p>
                  <p className="text-[10px] text-slate-400">Subject to spare parts availability</p>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Estimate & Charges</span>
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="font-bold text-slate-700">Total Estimated Cost:</span>
                    <span className="font-black text-base text-emerald-700 font-mono">
                      {formatCurrency(totalCost, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Payment Status:</span>
                    <span className="font-bold uppercase text-slate-800">{jobCard.paymentStatus}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="border-t border-slate-200 pt-3 space-y-1 text-[10px] text-slate-500 leading-normal">
                <p className="font-bold text-slate-700 uppercase">Service Terms & Handover Agreement:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Please present this slip at the time of collecting your repaired device.</li>
                  <li>We are not responsible for software data loss. Customers are advised to backup all personal data before handover.</li>
                  <li>Items not claimed within 30 days of repair completion notification may be disposed or subject to storage surcharge.</li>
                </ul>
              </div>

              {/* Signatures */}
              <div className="border-t-2 border-slate-900 pt-6 flex items-end justify-between">
                <div className="text-center">
                  <div className="h-10 border-b border-dashed border-slate-400 w-36 mb-1" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                    Customer Signature
                  </span>
                </div>

                <div className="text-center">
                  <div className="h-10 border-b-2 border-slate-900 w-40 mb-1" />
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block">
                    Store Authorized Technician
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* FORMAT 2: COMPACT 80MM THERMAL SLIP */}
          {printFormat === 'RECEIPT' && (
            <div
              id="printable-receipt-content"
              className="w-full max-w-[340px] bg-white border border-slate-200 rounded-xl p-5 space-y-3 font-mono text-xs shadow-xl text-slate-900 receipt-format-thermal print:border-none print:shadow-none"
            >
              <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <h2 className="font-black text-sm uppercase">{businessName}</h2>
                <p className="text-[10px] text-slate-500">REPAIR INTAKE SLIP</p>
                {businessPhone && <p className="text-[10px] text-slate-500">Ph: {businessPhone}</p>}
              </div>

              <div className="text-[11px] space-y-1 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between font-bold">
                  <span>Job Card:</span>
                  <span>#{jobCard.jobCardNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[10px]">
                  <span>Date:</span>
                  <span>{formattedCreatedDate}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[10px]">
                  <span>Client:</span>
                  <span>{jobCard.customerName || 'Walk-in'}</span>
                </div>
                {jobCard.customerPhone && (
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>Phone:</span>
                    <span>{jobCard.customerPhone}</span>
                  </div>
                )}
              </div>

              <div className="text-[11px] space-y-1 border-b border-dashed border-slate-300 pb-2">
                <div className="font-bold text-slate-900">
                  {jobCard.brand || ''} {jobCard.model || jobCard.itemType}
                </div>
                {jobCard.serialOrImei && (
                  <div className="text-[10px] text-slate-600">S/N: {jobCard.serialOrImei}</div>
                )}
                <div className="text-[10px] text-slate-600 pt-1">
                  <span className="font-bold">Issue: </span>
                  <span>{jobCard.problemDescription}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs pt-1 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between font-black text-sm">
                  <span>EST. TOTAL:</span>
                  <span>{formatCurrency(totalCost, currency)}</span>
                </div>
                {jobCard.estimatedCompletionDate && (
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Est. Delivery:</span>
                    <span>{jobCard.estimatedCompletionDate}</span>
                  </div>
                )}
              </div>

              <div className="text-center text-[9px] text-slate-500 pt-1 leading-tight">
                Please present this slip for collection.
                <br />
                Thank you for choosing {businessName}!
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-white border-t border-zinc-200 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <p className="text-xs text-zinc-500">
            {printFormat === 'A4' ? 'Standard A4 Handover Sheet' : '80mm Thermal Receipt'}
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
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer size={15} />
              <span>{t('repair.printSlip', 'Print Handover Slip')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
