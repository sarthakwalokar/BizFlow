import React, { useRef } from 'react';
import { Order } from '../../api/billing';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import {
  Printer,
  X,
  Receipt,
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
  const { business } = useAuth();
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const currency = order.currency || business?.currency || 'INR';
  const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto receipt-modal-backdrop">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl my-8 overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 receipt-modal-container">
        {/* Top Header Controls (Hidden during print) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              <Receipt size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Tax Invoice & Receipt</h3>
              <p className="text-[11px] text-slate-400">Order #{order.invoiceNumber || order.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div ref={receiptRef} className="p-6 overflow-y-auto font-mono text-xs space-y-4 flex-1 bg-white receipt-printable-content">
          {/* Business Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300 receipt-section">
            <h2 className="font-sans text-lg font-black text-slate-900 tracking-tight uppercase">
              {business?.name || order.businessName || 'BIZFLOW STORE'}
            </h2>
            <p className="text-[11px] text-slate-500 font-sans">
              {business?.businessType || 'COMMERCIAL ENTERPRISE'}
            </p>
            {business?.address && (
              <p className="text-[10px] text-slate-600 font-sans max-w-xs mx-auto">
                {business.address}
              </p>
            )}
            <div className="text-[10px] text-slate-500 font-sans flex items-center justify-center gap-3 pt-0.5">
              {business?.phone && <span>Tel: {business.phone}</span>}
              {business?.email && <span>Email: {business.email}</span>}
            </div>
            {business?.taxNumber && (
              <p className="text-[10px] text-slate-700 font-sans pt-0.5">
                GSTIN / Tax ID: <span className="font-bold">{business.taxNumber}</span>
              </p>
            )}
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pb-3 border-b border-dashed border-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px]">Invoice No:</span>
              <span className="font-bold text-slate-900">{order.invoiceNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Date / Time:</span>
              <span className="font-semibold text-slate-800">{formattedDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Billed By:</span>
              <span className="font-semibold text-slate-800">{order.createdBy}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Customer:</span>
              <span className="font-bold text-slate-900">
                {order.customer ? order.customer.name : 'Walk-in Customer'}
              </span>
              {order.customer?.phone && (
                <span className="block text-[10px] text-slate-500">{order.customer.phone}</span>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-1.5">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-600 uppercase font-bold">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Rate</th>
                  <th className="py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {order.items.map((item, index) => (
                  <tr key={index} className="py-1">
                    <td className="py-1 pr-2">
                      <span className="font-bold text-slate-900 block">{item.productName}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                        {item.productType}
                      </span>
                    </td>
                    <td className="py-1 text-center text-slate-700">{item.quantity}</td>
                    <td className="py-1 text-right text-slate-700">{formatCurrency(item.unitPrice, currency, { showSymbol: false })}</td>
                    <td className="py-1 text-right font-bold text-slate-900">
                      {formatCurrency(item.total, currency, { showSymbol: false })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-1 pt-3 border-t border-dashed border-slate-300 text-[11px]">
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal, currency)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex items-center justify-between text-rose-600 font-medium">
                <span>Discount Applied</span>
                <span>-{formatCurrency(order.discount, currency)}</span>
              </div>
            )}

            {order.tax > 0 && (
              <div className="flex items-center justify-between text-slate-600">
                <span>
                  {order.taxName || business?.taxName || 'GST'} (
                  {order.taxRate || business?.taxRate || 0}%
                  {order.taxInclusive ? ' incl.' : ''})
                </span>
                <span>
                  {order.taxInclusive ? '(included) ' : '+'}
                  {formatCurrency(order.tax, currency)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t-2 border-slate-900 font-sans text-base font-black text-slate-900">
              <span>GRAND TOTAL</span>
              <span>{formatCurrency(order.total, currency)}</span>
            </div>
          </div>

          {/* Payment & Status Pill */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-sans text-[10px] uppercase font-bold">
                Tender Method:
              </span>
              <span className="font-bold text-slate-900 font-sans text-xs">
                {order.paymentMethod}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-sans text-[10px] uppercase font-bold">
                Payment Status:
              </span>
              <span
                className={`font-bold font-sans text-[10px] px-2 py-0.5 rounded-full ${
                  order.paymentStatus === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.paymentStatus === 'CANCELLED'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>

            {order.notes && (
              <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-200 mt-1">
                Note: {order.notes}
              </div>
            )}
          </div>

          {/* Footer Thank You */}
          <div className="text-center text-[10px] text-slate-500 font-sans pt-2 border-t border-dashed border-slate-300">
            <p className="font-bold text-slate-800">Thank you for your business!</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Powered by BizFlow POS &amp; Business Management</p>
          </div>
        </div>

        {/* Bottom Actions (Hidden during print) */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Printer size={15} />
            <span>Print Receipt</span>
          </button>

          <div className="flex items-center space-x-2">
            {onNewSale && (
              <button
                onClick={() => {
                  onClose();
                  onNewSale();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                New Bill
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
