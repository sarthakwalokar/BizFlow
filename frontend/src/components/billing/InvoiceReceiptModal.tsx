import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Order } from '../../api/billing';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import {
  Printer,
  X,
  Receipt,
  CheckCircle2,
  FileText,
  Phone,
  Mail,
} from 'lucide-react';

interface InvoiceReceiptModalProps {
  order: Order;
  onClose: () => void;
  onNewSale?: () => void;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  order,
  onClose,
  onNewSale,
}) => {
  const { t } = useTranslation();
  const { business } = useAuth();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [printFormat, setPrintFormat] = useState<'RECEIPT' | 'A4'>('RECEIPT');

  // Ensure body has the print isolation class while this modal is mounted
  useEffect(() => {
    document.body.classList.add('receipt-modal-open');
    return () => {
      document.body.classList.remove('receipt-modal-open');
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const currency = order.currency || business?.currency || 'USD';
  const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const businessName = business?.name || order.businessName || 'BIZFLOW STORE';
  const businessType = business?.businessType || 'COMMERCIAL ENTERPRISE';
  const businessAddress = business?.address;
  const businessPhone = business?.phone;
  const businessEmail = business?.email;
  const businessTaxNumber = business?.taxNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 overflow-y-auto receipt-modal-backdrop">
      <div
        className={`bg-white rounded-2xl w-full shadow-dropdown my-auto overflow-hidden flex flex-col max-h-[92vh] border border-zinc-200 receipt-modal-container transition-all duration-200 ${printFormat === 'A4' ? 'max-w-4xl' : 'max-w-md'
          }`}
      >
        {/* Top Header Controls (Hidden during print) */}
        <div className="px-4 sm:px-5 py-3.5 bg-zinc-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              <Receipt size={16} />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold truncate">{t('receipt.title', 'Tax Invoice & Receipt')}</h3>
              <p className="text-[11px] text-zinc-400 font-mono truncate">
                #{order.invoiceNumber || order.id}
              </p>
            </div>
          </div>

          {/* Format Switcher (Thermal vs A4) */}
          <div className="flex items-center bg-zinc-800 p-1 rounded-xl border border-zinc-700 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setPrintFormat('RECEIPT')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${printFormat === 'RECEIPT'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
                }`}
              title="80mm Thermal Receipt format"
            >
              <Receipt size={13} />
              <span className="hidden sm:inline">{t('receipt.thermalReceipt', 'Receipt (80mm)')}</span>
              <span className="sm:hidden">{t('receipt.receipt', 'Receipt')}</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat('A4')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${printFormat === 'A4'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
                }`}
              title="Standard Full A4 Tax Invoice format"
            >
              <FileText size={13} />
              <span className="hidden sm:inline">{t('receipt.fullPageA4', 'Full Page (A4)')}</span>
              <span className="sm:hidden">A4</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* =========================================================================
            INVOICE PREVIEW / PRINT CANVAS
           ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-100 flex justify-center">
          <div
            ref={receiptRef}
            id="printable-receipt-content"
            className={`bg-white shadow-sm transition-all duration-200 text-zinc-900 ${printFormat === 'A4'
              ? 'w-full max-w-3xl p-8 sm:p-12 rounded-xl border border-zinc-200 text-xs space-y-6'
              : 'w-[80mm] max-w-[80mm] p-4 rounded-xl border border-zinc-200 font-mono text-[11px] leading-tight space-y-3'
              }`}
          >
            {/* FORMAT 1: 80mm THERMAL RECEIPT VIEW */}
            {printFormat === 'RECEIPT' && (
              <div className="space-y-3">
                {/* Store Header */}
                <div className="text-center space-y-1 pb-2 border-b border-dashed border-zinc-300">
                  <h2 className="font-bold text-sm text-zinc-950 uppercase tracking-tight">
                    {businessName}
                  </h2>
                  <p className="text-[10px] text-zinc-500 uppercase">{businessType}</p>
                  {businessAddress && (
                    <p className="text-[10px] text-zinc-600">{businessAddress}</p>
                  )}
                  {businessPhone && (
                    <p className="text-[10px] text-zinc-600">{t('common.phone', 'Tel')}: {businessPhone}</p>
                  )}
                  {businessTaxNumber && (
                    <p className="text-[10px] font-bold text-zinc-700">
                      GSTIN: {businessTaxNumber}
                    </p>
                  )}
                </div>

                {/* Receipt Metadata */}
                <div className="text-[10px] space-y-0.5 pb-2 border-b border-dashed border-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">{t('receipt.invoiceNum', 'Invoice #')}:</span>
                    <span className="font-bold text-zinc-900">{order.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">{t('common.date', 'Date')}:</span>
                    <span className="text-zinc-700">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">{t('receipt.payment', 'Payment')}:</span>
                    <span className="font-bold text-zinc-900">
                      {order.paymentMethod}
                      {order.payments?.[0]?.transactionReference ? ` (${order.payments[0].transactionReference})` : ''}
                    </span>
                  </div>
                  {order.customer && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{t('receipt.customer', 'Customer')}:</span>
                      <span className="font-bold text-zinc-900">{order.customer.name}</span>
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div>
                  <div className="flex justify-between font-bold text-[10px] uppercase pb-1 border-b border-zinc-900">
                    <span className="w-1/2">{t('receipt.item', 'Item')}</span>
                    <span className="w-1/6 text-center">{t('receipt.qty', 'Qty')}</span>
                    <span className="w-1/3 text-right">{t('receipt.amount', 'Amount')}</span>
                  </div>

                  <div className="divide-y divide-dashed divide-zinc-200 text-[10px] py-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-1">
                        <div className="flex justify-between font-medium">
                          <span className="w-1/2 truncate">{item.productName}</span>
                          <span className="w-1/6 text-center">{item.quantity}</span>
                          <span className="w-1/3 text-right font-bold">
                            {formatCurrency(item.total, currency)}
                          </span>
                        </div>
                        <div className="text-[9px] text-zinc-400">
                          @{formatCurrency(item.unitPrice, currency)}/unit
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtotal, Discount, Tax & Total */}
                <div className="pt-2 border-t border-dashed border-zinc-300 space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">{t('receipt.subtotal', 'Subtotal')}:</span>
                    <span className="font-bold">{formatCurrency(order.subtotal, currency)}</span>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>{t('receipt.discount', 'Discount')}:</span>
                      <span>-{formatCurrency(order.discount, currency)}</span>
                    </div>
                  )}

                  {order.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">
                        {order.taxName || 'GST'} ({order.taxRate}%):
                      </span>
                      <span>{formatCurrency(order.tax, currency)}</span>
                    </div>
                  )}

                  <div className="pt-1 border-t border-zinc-900 flex justify-between text-xs font-black">
                    <span className="uppercase">{t('receipt.totalPayable', 'TOTAL')}:</span>
                    <span>{formatCurrency(order.total, currency)}</span>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="text-center pt-3 border-t border-dashed border-zinc-300 space-y-1 text-[9px] text-zinc-500">
                  <p className="font-semibold text-zinc-800">{t('receipt.thankYou', 'Thank you for your business!')}</p>
                  <p>{t('receipt.comeAgain', 'Please visit again.')}</p>
                  <p className="text-[8px] text-zinc-400 pt-1">
                    Powered by BizFlow POS SaaS
                  </p>
                </div>
              </div>
            )}

            {/* FORMAT 2: FULL PAGE A4 TAX INVOICE VIEW */}
            {printFormat === 'A4' && (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex items-start justify-between pb-6 border-b-2 border-zinc-900">
                  <div className="space-y-1.5">
                    <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
                      {businessName}
                    </h1>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                      {businessType}
                    </p>
                    {businessAddress && (
                      <p className="text-xs text-zinc-600 max-w-sm">{businessAddress}</p>
                    )}
                    <div className="flex flex-wrap gap-4 pt-1 text-xs text-zinc-600">
                      {businessPhone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-zinc-400" />
                          {businessPhone}
                        </span>
                      )}
                      {businessEmail && (
                        <span className="flex items-center gap-1">
                          <Mail size={12} className="text-zinc-400" />
                          {businessEmail}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="inline-block px-3 py-1 bg-zinc-900 text-white font-bold text-xs rounded-md uppercase tracking-wider">
                      {t('receipt.taxInvoice', 'TAX INVOICE')}
                    </span>
                    <p className="font-mono font-bold text-sm text-zinc-900 pt-1">
                      {order.invoiceNumber}
                    </p>
                    <p className="text-xs text-zinc-500">{formattedDate}</p>
                    {businessTaxNumber && (
                      <p className="text-xs font-bold text-zinc-800 pt-1">
                        GSTIN: {businessTaxNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bill To & Payment Info */}
                <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {t('receipt.billedTo', 'Billed To (Customer)')}
                    </span>
                    {order.customer ? (
                      <div className="space-y-0.5">
                        <p className="font-bold text-sm text-zinc-900">{order.customer.name}</p>
                        {order.customer.phone && (
                          <p className="text-xs text-zinc-600">Tel: {order.customer.phone}</p>
                        )}
                        {order.customer.email && (
                          <p className="text-xs text-zinc-600">{order.customer.email}</p>
                        )}
                      </div>
                    ) : (
                      <p className="font-semibold text-xs text-zinc-700">{t('billing.walkInCustomer', 'Walk-in Retail Customer')}</p>
                    )}
                  </div>

                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {t('receipt.paymentDetails', 'Payment Details')}
                    </span>
                    <p className="font-bold text-xs text-zinc-900">
                      {t('receipt.method', 'Method')}: <span className="uppercase">{order.paymentMethod}</span>
                    </p>
                    <p className="text-xs text-zinc-600">
                      {t('receipt.status', 'Status')}: <span className="font-bold text-emerald-600">{order.paymentStatus}</span>
                    </p>
                    {order.payments?.[0]?.transactionReference && (
                      <p className="text-xs font-mono text-zinc-500">
                        Txn ID: {order.payments[0].transactionReference}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-hidden rounded-xl border border-zinc-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-100 text-zinc-700 text-xs font-bold uppercase tracking-wider border-b border-zinc-200">
                        <th className="p-3 w-12 text-center">#</th>
                        <th className="p-3">{t('receipt.itemDescription', 'Item Description')}</th>
                        <th className="p-3 w-24 text-center">{t('receipt.qty', 'Qty')}</th>
                        <th className="p-3 w-32 text-right">{t('receipt.unitPrice', 'Unit Price')}</th>
                        <th className="p-3 w-36 text-right">{t('receipt.total', 'Total')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 text-xs">
                      {order.items.map((item, index) => (
                        <tr key={index} className="hover:bg-zinc-50/50">
                          <td className="p-3 text-center text-zinc-400 font-mono">{index + 1}</td>
                          <td className="p-3 font-semibold text-zinc-900">{item.productName}</td>
                          <td className="p-3 text-center font-bold">{item.quantity}</td>
                          <td className="p-3 text-right text-zinc-600 font-mono">
                            {formatCurrency(item.unitPrice, currency)}
                          </td>
                          <td className="p-3 text-right font-black text-zinc-900 font-mono">
                            {formatCurrency(item.total, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Totals */}
                <div className="flex justify-end">
                  <div className="w-72 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-600">
                      <span>{t('receipt.subtotal', 'Subtotal')}:</span>
                      <span className="font-bold font-mono">{formatCurrency(order.subtotal, currency)}</span>
                    </div>

                    {order.discount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>{t('receipt.discount', 'Discount')}:</span>
                        <span className="font-bold font-mono">-{formatCurrency(order.discount, currency)}</span>
                      </div>
                    )}

                    {order.tax > 0 && (
                      <div className="flex justify-between text-zinc-600">
                        <span>
                          {order.taxName || 'GST'} ({order.taxRate}%):
                        </span>
                        <span className="font-bold font-mono">{formatCurrency(order.tax, currency)}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t-2 border-zinc-900 flex justify-between text-sm font-black text-zinc-950">
                      <span>{t('receipt.grandTotal', 'Grand Total')}:</span>
                      <span className="font-mono">{formatCurrency(order.total, currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Signoff and Terms */}
                <div className="pt-8 border-t border-zinc-200 grid grid-cols-2 gap-6 text-xs text-zinc-500">
                  <div>
                    <h5 className="font-bold text-zinc-800 uppercase mb-1">{t('receipt.termsConditions', 'Terms & Conditions')}</h5>
                    <p className="text-[11px] leading-relaxed">
                      {t('receipt.termsText', '1. Goods once sold are subject to store return policy. 2. Please preserve this invoice for any warranty claims.')}
                    </p>
                  </div>
                  <div className="text-right pt-6">
                    <div className="inline-block border-t border-zinc-400 pt-1 px-8 text-center">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase block">
                        {t('receipt.authorizedSignatory', 'Authorized Signatory')}
                      </span>
                      <span className="text-[9px] text-zinc-400">{businessName}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Modal Actions (Hidden during print) */}
        <div className="p-4 bg-white border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-2 text-xs text-emerald-700 font-semibold">
            <CheckCircle2 size={16} />
            <span>{t('receipt.invoiceSaved', 'Invoice verified & recorded in ledger')}</span>
          </div>

          <div className="flex items-center space-x-2.5">
            {onNewSale && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewSale();
                }}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-colors cursor-pointer"
              >
                + {t('receipt.newSale', 'New Sale')}
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              id="print-invoice-btn"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <Printer size={15} />
              <span>{t('receipt.printReceipt', 'Print Receipt')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
