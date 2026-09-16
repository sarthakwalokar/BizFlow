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

  const currency = business?.currency || 'USD';

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
        'Failed to void order.'
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Sales &amp; Invoices</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            View history of all customer transactions, payment receipts, and audit trail.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle size={15} className="text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 hover:text-red-900 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Filter Controls Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-card space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by invoice number or customer phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Payment Status Filter */}
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="COMPLETED">Paid (Completed)</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled / Void</option>
            </select>

            {/* Order Status Filter */}
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">All Order States</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">All Payment Modes</option>
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="CREDIT">Credit</option>
              <option value="OTHER">Other</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400">
                    Loading invoices...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-500 space-y-1">
                    <Receipt size={32} className="mx-auto text-zinc-300" />
                    <p className="font-bold text-zinc-700">No invoices match criteria</p>
                    <p className="text-[11px] text-zinc-400">Try adjusting your filters or search keyword.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                        {order.invoiceNumber}
                      </td>

                      <td className="py-3 px-4 text-zinc-500 whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-zinc-900 block">
                          {order.customer ? order.customer.name : 'Walk-in Customer'}
                        </span>
                        {order.customer?.phone && (
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {order.customer.phone}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-zinc-600">{order.createdBy || 'Counter'}</td>

                      <td className="py-3 px-4 text-zinc-600">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-[10px] font-bold">
                          {order.items?.length || 0} items
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {order.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-black text-zinc-950">
                        {formatCurrency(order.total, currency)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.paymentStatus === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : order.paymentStatus === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
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

                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedOrderForView(order)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="View Tax Receipt"
                        >
                          <Eye size={15} />
                        </button>

                        {order.paymentStatus !== 'CANCELLED' && (
                          <button
                            onClick={() => setOrderToCancel(order)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Void / Cancel Order"
                          >
                            <Ban size={15} />
                          </button>
                        )}
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

      {/* Cancel / Void Order Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-dropdown space-y-4 border border-zinc-200">
            <div className="flex items-center space-x-2.5 text-rose-600">
              <Ban size={20} />
              <h3 className="text-base font-bold text-zinc-900">Void / Cancel Order</h3>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to void invoice{' '}
              <strong className="text-zinc-900">{orderToCancel.invoiceNumber}</strong> for{' '}
              <strong className="text-zinc-900">{formatCurrency(orderToCancel.total, currency)}</strong>?
              This action marks the order as cancelled and reverses stock if applicable.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Cancellation Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Customer returned goods / duplicate bill"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderToCancel(null)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {cancelling ? 'Voiding...' : 'Confirm Void Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
