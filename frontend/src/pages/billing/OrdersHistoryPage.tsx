import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { billingApi, Order, PaymentStatus, OrderStatus, PaymentMethod } from '../../api/billing';
import { InvoiceReceiptModal } from '../../components/billing/InvoiceReceiptModal';
import { formatCurrency } from '../../utils/currency';
import {
  Receipt,
  Search,
  Eye,
  Ban,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

export const OrdersHistoryPage: React.FC = () => {
  const { business } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<string>('ALL');
  const [orderStatus, setOrderStatus] = useState<string>('ALL');
  const [paymentMethod, setPaymentMethod] = useState<string>('ALL');

  // Modals state
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currency = business?.currency || 'INR';

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await billingApi.getOrders({
        search: search.trim() || undefined,
        paymentStatus: paymentStatus !== 'ALL' ? (paymentStatus as PaymentStatus) : undefined,
        orderStatus: orderStatus !== 'ALL' ? (orderStatus as OrderStatus) : undefined,
        paymentMethod: paymentMethod !== 'ALL' ? (paymentMethod as PaymentMethod) : undefined,
        size: 50,
      });
      setOrders(res.content);
    } catch (err: any) {
      setErrorMessage('Failed to load orders and billing history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [paymentStatus, orderStatus, paymentMethod]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToCancel) return;
    setCancelling(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updated = await billingApi.cancelOrder(orderToCancel.id, cancelReason);
      setSuccessMessage(`Order "${updated.invoiceNumber}" has been voided/cancelled.`);
      setOrderToCancel(null);
      setCancelReason('');
      fetchOrders();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to cancel order.'
      );
    } finally {
      setCancelling(false);
    }
  };

  // Stats
  const totalCompletedAmount = orders
    .filter((o) => o.orderStatus === 'COMPLETED' && o.paymentStatus === 'COMPLETED')
    .reduce((sum, o) => sum + o.total, 0);

  const totalCancelledCount = orders.filter((o) => o.orderStatus === 'CANCELLED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sales &amp; Invoice History
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Review past transactions, inspect tax invoices, print receipts, and manage sales records
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2.5 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2.5 text-rose-800 text-xs font-semibold">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Invoices Loaded
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {orders.length}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Paid Sales Volume
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {formatCurrency(totalCompletedAmount, currency)}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Voided / Cancelled Bills
          </span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">
            {totalCancelledCount}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice number, customer name, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none"
            >
              <option value="ALL">Payment: All</option>
              <option value="COMPLETED">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none"
            >
              <option value="ALL">Method: All</option>
              <option value="UPI">UPI / QR</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="CREDIT">Credit</option>
            </select>

            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none"
            >
              <option value="ALL">Order Status: All</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Invoice &amp; Date</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Billed By</th>
                <th className="px-5 py-3">Payment Method</th>
                <th className="px-5 py-3">Grand Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs font-medium">
                    Loading invoices...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });
                  const isCancelled = order.orderStatus === 'CANCELLED';

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isCancelled ? 'opacity-60 bg-slate-50/30' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            <Receipt size={15} />
                          </div>
                          <div>
                            <div className="font-mono font-bold text-slate-900 text-xs">
                              {order.invoiceNumber}
                            </div>
                            <div className="text-[10px] text-slate-400">{dateStr}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-800 text-xs block">
                          {order.customer ? order.customer.name : 'Walk-in Customer'}
                        </span>
                        {order.customer?.phone && (
                          <span className="text-[10px] text-slate-400">{order.customer.phone}</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-xs text-slate-600">{order.createdBy}</td>

                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {order.paymentMethod}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-black text-slate-900 text-xs">
                        {formatCurrency(order.total, currency)}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            order.paymentStatus === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : order.paymentStatus === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {order.paymentStatus === 'COMPLETED' ? (
                            <>
                              <CheckCircle2 size={11} className="text-emerald-600" />
                              <span>Paid</span>
                            </>
                          ) : order.paymentStatus === 'CANCELLED' ? (
                            <>
                              <XCircle size={11} className="text-rose-600" />
                              <span>Cancelled</span>
                            </>
                          ) : (
                            <>
                              <Clock size={11} className="text-amber-600" />
                              <span>Pending</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSelectedOrderForView(order)}
                            title="View / Print Invoice"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>

                          {!isCancelled && (
                            <button
                              onClick={() => setOrderToCancel(order)}
                              title="Void / Cancel Invoice"
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Ban size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      {selectedOrderForView && (
        <InvoiceReceiptModal
          order={selectedOrderForView}
          onClose={() => setSelectedOrderForView(null)}
        />
      )}

      {/* Cancel Order Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Ban size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Void &amp; Cancel Invoice</h3>
                <p className="text-xs text-slate-500">Invoice: {orderToCancel.invoiceNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to void this invoice for{' '}
              <span className="font-bold text-slate-900">
                {formatCurrency(orderToCancel.total, currency)}
              </span>
              ? This action is recorded in the ledger and cannot be undone.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reason for Cancellation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer returned items, incorrect billing..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOrderToCancel(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Keep Invoice
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {cancelling ? 'Voiding...' : 'Void Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
