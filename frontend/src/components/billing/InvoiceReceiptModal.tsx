import React, { useState, useEffect, useRef } from 'react';
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
        className={`bg-white rounded-2xl w-full shadow-dropdown my-auto overflow-hidden flex flex-col max-h-[92vh] border border-zinc-200 receipt-modal-container transition-all duration-200 ${
          printFormat === 'A4' ? 'max-w-4xl' : 'max-w-md'
        }`}
      >
        {/* Top Header Controls (Hidden during print) */}
        <div className="px-4 sm:px-5 py-3.5 bg-zinc-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              <Receipt size={16} />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold truncate">Tax Invoice &amp; Receipt</h3>
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
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                printFormat === 'RECEIPT'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="80mm Thermal Receipt format"
            >
              <Receipt size={13} />
              <span className="hidden sm:inline">Receipt (80mm)</span>
              <span className="sm:hidden">Receipt</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat('A4')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                printFormat === 'A4'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Standard Full A4 Tax Invoice format"
            >
              <FileText size={13} />
              <span className="hidden sm:inline">Standard A4</span>
              <span className="sm:hidden">A4</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Bill Area - Rendered directly with 100% visible fidelity */}
        <div
          ref={receiptRef}
          className={`p-4 sm:p-6 overflow-y-auto flex-1 bg-white receipt-printable-content ${
            printFormat === 'RECEIPT' ? 'receipt-format-thermal' : 'receipt-format-a4'
          }`}
        >
          {printFormat === 'RECEIPT' ? (
            /* ==========================================================
               THERMAL RECEIPT FORMAT (80mm)
               ========================================================== */
            <div className="font-mono text-xs space-y-4">
              {/* Business Header */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-zinc-300 receipt-section">
                <h2 className="font-sans text-lg font-black text-zinc-900 tracking-tight uppercase">
                  {businessName}
                </h2>
                <p className="text-[11px] text-zinc-500 font-sans">{businessType}</p>
                {businessAddress && (
                  <p className="text-[10px] text-zinc-600 font-sans max-w-xs mx-auto leading-tight">
                    {businessAddress}
                  </p>
                )}
                <div className="text-[10px] text-zinc-500 font-sans flex items-center justify-center gap-2.5 pt-0.5 flex-wrap">
                  {businessPhone && <span>Tel: {businessPhone}</span>}
                  {businessEmail && <span>Email: {businessEmail}</span>}
                </div>
                {businessTaxNumber && (
                  <p className="text-[10px] text-zinc-700 font-sans pt-0.5">
                    GSTIN / Tax ID: <span className="font-bold">{businessTaxNumber}</span>
                  </p>
                )}
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 pb-3 border-b border-dashed border-zinc-300 receipt-section font-sans">
                <div>
                  <span className="text-zinc-400 block text-[10px]">Invoice No:</span>
                  <span className="font-bold text-zinc-900 font-mono text-xs">
                    {order.invoiceNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400 block text-[10px]">Date &amp; Time:</span>
                  <span className="font-medium text-zinc-800 text-[10px]">{formattedDate}</span>
                </div>

                <div>
                  <span className="text-zinc-400 block text-[10px]">Cashier / Staff:</span>
                  <span className="font-semibold text-zinc-800">
                    {order.createdBy || 'Counter'}
                  </span>
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
                      <span className="text-zinc-500 text-[10px] block font-mono">
                        {order.customer.phone}
                      </span>
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
                          <span className="text-[9px] text-zinc-400 font-mono">
                            {item.productType}
                          </span>
                        </td>
                        <td className="py-1.5 text-center font-mono text-zinc-700">
                          {item.quantity}
                        </td>
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
                  <span className="font-mono font-medium">
                    {formatCurrency(order.subtotal, currency)}
                  </span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount Applied:</span>
                    <span className="font-mono font-bold">
                      -{formatCurrency(order.discount, currency)}
                    </span>
                  </div>
                )}

                {order.tax > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>
                      {order.taxName || 'GST'} ({order.taxRate}%):
                    </span>
                    <span className="font-mono font-medium">
                      +{formatCurrency(order.tax, currency)}
                    </span>
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
          ) : (
            /* ==========================================================
               STANDARD A4 TAX INVOICE FORMAT
               ========================================================== */
            <div className="font-sans text-xs space-y-6 text-zinc-900">
              {/* Header Top: Business Branding & Tax Invoice Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b-2 border-zinc-900 invoice-section">
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center gap-2">
                    {business?.logo ? (
                      <img
                        src={business.logo}
                        alt="Logo"
                        className="w-10 h-10 object-contain rounded-lg border border-zinc-200"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                        {businessName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl font-black tracking-tight text-zinc-950 uppercase leading-none">
                        {businessName}
                      </h1>
                      <p className="text-[11px] text-zinc-500 font-semibold mt-0.5">
                        {businessType}
                      </p>
                    </div>
                  </div>

                  {businessAddress && (
                    <p className="text-xs text-zinc-600 pt-1 leading-relaxed">
                      {businessAddress}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600 pt-0.5">
                    {businessPhone && (
                      <span className="flex items-center gap-1">
                        <Phone size={11} className="text-zinc-400" />
                        <span>{businessPhone}</span>
                      </span>
                    )}
                    {businessEmail && (
                      <span className="flex items-center gap-1">
                        <Mail size={11} className="text-zinc-400" />
                        <span>{businessEmail}</span>
                      </span>
                    )}
                  </div>

                  {businessTaxNumber && (
                    <p className="text-xs text-zinc-800 font-medium pt-0.5">
                      GSTIN / Tax ID: <span className="font-bold text-zinc-950">{businessTaxNumber}</span>
                    </p>
                  )}
                </div>

                {/* Right: Tax Invoice Details Box */}
                <div className="w-full sm:w-64 bg-zinc-50 rounded-xl p-3.5 border border-zinc-200 space-y-2 text-right self-stretch sm:self-auto flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-700">
                      TAX INVOICE
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-left">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Invoice No:</span>
                      <span className="font-mono font-bold text-zinc-900">{order.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Date &amp; Time:</span>
                      <span className="font-medium text-zinc-800 text-[11px]">{formattedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Payment Mode:</span>
                      <span className="font-bold text-zinc-900 uppercase">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Billed By:</span>
                      <span className="font-medium text-zinc-800">{order.createdBy || 'Staff'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billed To / Customer Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 invoice-section">
                <div className="p-3.5 rounded-xl bg-zinc-50/80 border border-zinc-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Billed To (Customer Details)
                  </span>
                  {order.customer ? (
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900">{order.customer.name}</h4>
                      {order.customer.phone && (
                        <p className="text-xs text-zinc-600 font-mono mt-0.5">
                          Phone: {order.customer.phone}
                        </p>
                      )}
                      {order.customer.email && (
                        <p className="text-xs text-zinc-600">{order.customer.email}</p>
                      )}
                      {order.customer.address && (
                        <p className="text-xs text-zinc-500 mt-0.5">{order.customer.address}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-zinc-700">Walk-in Counter Customer</p>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50/80 border border-zinc-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Place of Supply &amp; Order Info
                  </span>
                  <p className="text-xs text-zinc-700">
                    <span className="font-semibold">Store Register:</span> Counter POS Terminal 1
                  </p>
                  <p className="text-xs text-zinc-700">
                    <span className="font-semibold">Currency:</span> {currency}
                  </p>
                  {order.notes && (
                    <p className="text-xs text-zinc-600 italic">
                      <span className="font-semibold not-italic">Notes:</span> {order.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Itemized Table */}
              <div className="invoice-section border border-zinc-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 border-b border-zinc-200 text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 w-24">Type</th>
                      <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                      <th className="py-2.5 px-3 w-28 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 w-28 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-xs">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                        <td className="py-2.5 px-3 text-center text-zinc-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-zinc-900 block">{item.productName}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              item.productType === 'PHYSICAL'
                                ? 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {item.productType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-zinc-800">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-zinc-600">
                          {formatCurrency(item.unitPrice, currency)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-zinc-950 font-mono">
                          {formatCurrency(item.total, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Computation & Summary Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start pt-2 invoice-section">
                {/* Left: Terms and Payment Confirmation */}
                <div className="sm:col-span-7 space-y-2 text-xs text-zinc-600">
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                      Terms &amp; Declarations
                    </span>
                    <ul className="text-[10px] text-zinc-500 list-disc list-inside space-y-0.5">
                      <li>Goods / services once provided are governed by store return policy.</li>
                      <li>This document is a computer-generated tax invoice.</li>
                      <li>Payment has been received in full via {order.paymentMethod}.</li>
                    </ul>
                  </div>
                </div>

                {/* Right: Calculations Breakdown */}
                <div className="sm:col-span-5 bg-zinc-50 rounded-xl border border-zinc-200 p-3.5 space-y-2">
                  <div className="flex justify-between text-zinc-600 text-xs">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold text-zinc-900">
                      {formatCurrency(order.subtotal, currency)}
                    </span>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between text-rose-600 text-xs">
                      <span>Discount:</span>
                      <span className="font-mono font-bold">
                        -{formatCurrency(order.discount, currency)}
                      </span>
                    </div>
                  )}

                  {order.tax > 0 && (
                    <div className="flex justify-between text-zinc-600 text-xs">
                      <span>
                        {order.taxName || 'GST'} ({order.taxRate}%):
                      </span>
                      <span className="font-mono font-semibold text-zinc-900">
                        +{formatCurrency(order.tax, currency)}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t-2 border-zinc-900 flex justify-between items-baseline">
                    <span className="font-extrabold text-zinc-900 text-sm">Grand Total:</span>
                    <span className="font-black text-zinc-950 text-base font-mono">
                      {formatCurrency(order.total, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatory and System Footer */}
              <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-end justify-between gap-6 invoice-section">
                <div className="text-[10px] text-zinc-400 space-y-0.5">
                  <p className="font-bold text-zinc-600">Thank you for choosing {businessName}!</p>
                  <p>BizFlow Unified Commerce • Powered by Intelligent POS</p>
                </div>

                <div className="text-center sm:text-right space-y-8 min-w-[180px]">
                  <div className="h-10 border-b border-dashed border-zinc-400 w-44 ml-auto" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                    Authorized Signatory
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions (Hidden during print) */}
        <div className="p-3.5 sm:p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-3 shrink-0 print:hidden">
          {onNewSale ? (
            <button
              onClick={() => {
                onClose();
                onNewSale();
              }}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold transition-colors cursor-pointer"
            >
              + New Sale
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-white transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 sm:px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer size={15} />
              <span>{printFormat === 'RECEIPT' ? 'Print Receipt' : 'Print A4 Invoice'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
