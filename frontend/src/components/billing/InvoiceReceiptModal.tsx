import React, { useRef } from 'react';
import { Order } from '../../api/billing';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import {
  Printer,
  X,
  Receipt,
  CheckCircle2
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

  const currency = order.currency || business?.currency || 'USD';
  const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto receipt-modal-backdrop">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-dropdown my-8 overflow-hidden flex flex-col max-h-[90vh] border border-zinc-200 receipt-modal-container">
        {/* Top Header Controls (Hidden during print) */}
        <div className="px-5 py-3.5 bg-zinc-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
              <Receipt size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Tax Invoice &amp; Receipt</h3>
              <p className="text-[11px] text-zinc-400">Order #{order.invoiceNumber || order.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div ref={receiptRef} className="p-6 overflow-y-auto font-mono text-xs space-y-4 flex-1 bg-white receipt-printable-content">
          {/* Business Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-zinc-300 receipt-section">
            <h2 className="font-sans text-lg font-black text-zinc-900 tracking-tight uppercase">
              {business?.name || order.businessName || 'BIZFLOW STORE'}
            </h2>
            <p className="text-[11px] text-zinc-500 font-sans">
              {business?.businessType || 'COMMERCIAL ENTERPRISE'}
            </p>
            {business?.address && (
              <p className="text-[10px] text-zinc-600 font-sans max-w-xs mx-auto">
                {business.address}
              </p>
            )}
            <div className="text-[10px] text-zinc-500 font-sans flex items-center justify-center gap-3 pt-0.5">
              {business?.phone && <span>Tel: {business.phone}</span>}
              {business?.email && <span>Email: {business.email}</span>}
            </div>
            {business?.taxNumber && (
              <p className="text-[10px] text-zinc-700 font-sans pt-0.5">
                GSTIN / Tax ID: <span className="font-bold">{business.taxNumber}</span>
              </p>
            )}
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 pb-3 border-b border-dashed border-zinc-300 receipt-section font-sans">
            <div>
              <span className="text-zinc-400 block text-[10px]">Invoice No:</span>
              <span className="font-bold text-zinc-900 font-mono text-xs">{order.invoiceNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-zinc-400 block text-[10px]">Date &amp; Time:</span>
              <span className="font-medium text-zinc-800 text-[10px]">{formattedDate}</span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[10px]">Cashier / Staff:</span>
              <span className="font-semibold text-zinc-800">{order.createdBy || 'Counter'}</span>
            </div>

            <div className="text-right">
              <span className="text-zinc-400 block text-[10px]">Payment Mode:</span>
              <span className="font-bold text-zinc-900 uppercase">{order.paymentMethod}</span>
            </div>

            {order.customer && (
              <div className="col-span-2 pt-1.5 border-t border-zinc-100">
                <span className="text-zinc-400 block text-[10px]">Billed To Customer:</span>
                <span className="font-bold text-zinc-900">{order.customer.name}</span>
                {order.customer.phone && (
                  <span className="text-zinc-500 text-[10px] block font-mono">{order.customer.phone}</span>
                )}
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div className="receipt-section">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-700">
                  <th className="pb-1.5">Item</th>
                  <th className="pb-1.5 text-center">Qty</th>
                  <th className="pb-1.5 text-right">Price</th>
                  <th className="pb-1.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-1.5">
                    <td className="py-1.5 font-sans">
                      <span className="font-medium text-zinc-900 block">{item.productName}</span>
                      <span className="text-[9px] text-zinc-400 font-mono">{item.productType}</span>
                    </td>
                    <td className="py-1.5 text-center font-mono text-zinc-700">{item.quantity}</td>
                    <td className="py-1.5 text-right font-mono text-zinc-600">
                      {formatCurrency(item.unitPrice, currency)}
                    </td>
                    <td className="py-1.5 text-right font-bold text-zinc-900 font-mono">
                      {formatCurrency(item.total, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals Calculation */}
          <div className="space-y-1.5 pt-3 border-t-2 border-zinc-800 text-xs receipt-section font-sans">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">{formatCurrency(order.subtotal, currency)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount Applied:</span>
                <span className="font-mono font-bold">-{formatCurrency(order.discount, currency)}</span>
              </div>
            )}

            {order.tax > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>{order.taxName || 'GST'} ({order.taxRate}%):</span>
                <span className="font-mono font-medium">+{formatCurrency(order.tax, currency)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-black text-zinc-950 pt-2 border-t border-zinc-300">
              <span>Grand Total:</span>
              <span className="font-mono">{formatCurrency(order.total, currency)}</span>
            </div>

            <div className="flex justify-between text-[11px] text-zinc-600 pt-1">
              <span>Payment Status:</span>
              <span className="font-bold text-emerald-700 uppercase flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span>{order.paymentStatus}</span>
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4 border-t border-dashed border-zinc-300 text-[10px] text-zinc-500 space-y-1 receipt-section font-sans">
            <p className="font-bold text-zinc-700">Thank you for your business!</p>
            <p>Please visit again • Computer Generated Tax Invoice</p>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden during print) */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-3 shrink-0 print:hidden">
          {onNewSale ? (
            <button
              onClick={() => {
                onClose();
                onNewSale();
              }}
              className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold transition-colors cursor-pointer"
            >
              + New Sale
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-white transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer size={15} />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
