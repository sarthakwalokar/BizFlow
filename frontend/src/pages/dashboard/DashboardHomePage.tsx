import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productsApi } from '../../api/products';
import { businessApi } from '../../api/business';
import { billingApi, BillingSummary, Order } from '../../api/billing';
import { expensesApi, ExpenseSummaryResponse } from '../../api/expenses';
import { reviewsApi, ReviewAnalytics } from '../../api/reviews';
import { InvoiceReceiptModal } from '../../components/billing/InvoiceReceiptModal';
import { formatCurrency } from '../../utils/currency';
import {
  Package,
  ArrowUpRight,
  Receipt,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Star,
  ShoppingBag,
} from 'lucide-react';

export const DashboardHomePage: React.FC = () => {
  const { user, business } = useAuth();
  const [productCount, setProductCount] = useState<number>(0);
  const [activeProductCount, setActiveProductCount] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummaryResponse | null>(null);
  const [reviewAnalytics, setReviewAnalytics] = useState<ReviewAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  const [activeFeedTab, setActiveFeedTab] = useState<'INVOICES' | 'EXPENSES'>('INVOICES');

  const isOwner = user?.role === 'OWNER';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        setLoading(true);
        const [prodRes, activeProdRes, billingSummary, expSummary] = await Promise.all([
          productsApi.getProducts({ size: 1 }),
          productsApi.getProducts({ active: true, size: 1 }),
          billingApi.getDashboardSummary(),
          expensesApi.getSummary(),
        ]);

        setProductCount(prodRes.totalElements);
        setActiveProductCount(activeProdRes.totalElements);
        setSummary(billingSummary);
        setExpenseSummary(expSummary);

        try {
          const revAna = await reviewsApi.getAnalytics();
          setReviewAnalytics(revAna);
        } catch {
          // non-blocking
        }

        if (isOwner) {
          try {
            const staffList = await businessApi.getStaff();
            setStaffCount(staffList.length);
          } catch {
            // Non-blocking
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardCounts();
  }, [isOwner]);

  const currency = summary?.currency || business?.currency || 'USD';

  const todaySales = summary?.todaySales ?? 0;
  const todayExpenses = summary?.todayExpenses ?? 0;
  const todayNet = summary?.todayNetRevenue ?? (todaySales - todayExpenses);
  const todayOrders = summary?.todayOrdersCount ?? 0;

  const monthSales = summary?.monthSales ?? 0;
  const monthExpenses = summary?.monthExpenses ?? 0;
  const monthNet = summary?.monthNetRevenue ?? (monthSales - monthExpenses);

  const averageRating = reviewAnalytics?.averageRating ?? 5.0;
  const totalReviews = reviewAnalytics?.totalReviews ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            {getGreeting()}, {user?.fullName || 'Business Owner'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Here's what's happening with your business today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/dashboard/pos"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <Receipt size={15} />
            <span>Launch POS Billing</span>
          </Link>

          <Link
            to="/dashboard/analytics"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold border border-zinc-200 shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <BarChart3 size={15} />
            <span>Analytics</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards Grid (Today's Sales, Orders, Expenses, Review Rating) */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Today's Sales */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Today's Sales</span>
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-zinc-950">
              {loading ? '...' : formatCurrency(todaySales, currency)}
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
              <span className="text-zinc-500 font-medium">
                {loading ? '...' : `${todayOrders} bills recorded`}
              </span>
              <Link to="/dashboard/bills" className="text-brand-600 font-semibold hover:underline text-[11px]">
                Invoices →
              </Link>
            </div>
          </div>

          {/* 2. Today's Orders */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Orders</span>
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <ShoppingBag size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-zinc-950">
              {loading ? '...' : todayOrders}
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
              <span className="text-zinc-500 font-medium">Counter transactions</span>
              <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                POS Ready
              </span>
            </div>
          </div>

          {/* 3. Expenses */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Expenses</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-600">
              {loading ? '...' : formatCurrency(todayExpenses, currency)}
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
              <span className="text-zinc-500 font-medium">Daily logged overhead</span>
              <Link to="/dashboard/expenses" className="text-rose-600 font-semibold hover:underline text-[11px]">
                Manage →
              </Link>
            </div>
          </div>

          {/* 4. Review Rating */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Review Rating</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star size={16} className="fill-amber-500 text-amber-500" />
              </div>
            </div>
            <div className="text-2xl font-black text-zinc-950 flex items-center gap-1.5">
              <span>{loading ? '...' : Number(averageRating).toFixed(1)}</span>
              <Star className="w-5 h-5 fill-amber-500 text-amber-500 inline" />
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
              <span className="text-zinc-500 font-medium">{totalReviews} verified reviews</span>
              <Link to="/dashboard/reviews" className="text-amber-700 font-semibold hover:underline text-[11px]">
                QR Boost →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Health Summary Cards: Today vs This Month */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Today's Financial Overview */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Today's Net Margin</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                todayNet >= 0 ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {todayNet >= 0 ? '+ Net Profit' : '- Net Deficit'}
              </span>
            </div>

            <div className="text-3xl font-black text-zinc-950">
              {loading ? '...' : formatCurrency(todayNet, currency)}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-100 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-brand-600 flex items-center gap-1">
                  <TrendingUp size={13} />
                  <span>Revenue Today</span>
                </span>
                <div className="text-base font-extrabold text-zinc-900 mt-0.5">
                  {loading ? '...' : formatCurrency(todaySales, currency)}
                </div>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <TrendingDown size={13} />
                  <span>Expenses Today</span>
                </span>
                <div className="text-base font-extrabold text-zinc-900 mt-0.5">
                  {loading ? '...' : formatCurrency(todayExpenses, currency)}
                </div>
              </div>
            </div>
          </div>

          {/* This Month's Financial Overview */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">This Month's Net Balance</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                monthNet >= 0 ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {monthNet >= 0 ? '+ Monthly Profit' : '- Monthly Deficit'}
              </span>
            </div>

            <div className="text-3xl font-black text-zinc-950">
              {loading ? '...' : formatCurrency(monthNet, currency)}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-100 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-brand-600 flex items-center gap-1">
                  <TrendingUp size={13} />
                  <span>Month's Revenue</span>
                </span>
                <div className="text-base font-extrabold text-zinc-900 mt-0.5">
                  {loading ? '...' : formatCurrency(monthSales, currency)}
                </div>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <TrendingDown size={13} />
                  <span>Month's Expenses</span>
                </span>
                <div className="text-base font-extrabold text-zinc-900 mt-0.5">
                  {loading ? '...' : formatCurrency(monthExpenses, currency)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Feeds: Recent Invoices & Recent Expenses */}
      <section className="bg-white rounded-2xl border border-zinc-200 p-5 md:p-6 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveFeedTab('INVOICES')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFeedTab === 'INVOICES'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Recent Invoices ({summary?.recentOrders.length ?? 0})
            </button>
            <button
              onClick={() => setActiveFeedTab('EXPENSES')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFeedTab === 'EXPENSES'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Recent Expenses ({expenseSummary?.recentExpenses.length ?? 0})
            </button>
          </div>

          <Link
            to={activeFeedTab === 'INVOICES' ? '/dashboard/bills' : '/dashboard/expenses'}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{activeFeedTab === 'INVOICES' ? 'View All Invoices' : 'View All Expenses'}</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Tab 1: Invoices Feed */}
        {activeFeedTab === 'INVOICES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider border-b border-zinc-100">
                  <th className="pb-2.5">Invoice</th>
                  <th className="pb-2.5">Customer</th>
                  <th className="pb-2.5">Billed By</th>
                  <th className="pb-2.5">Method</th>
                  <th className="pb-2.5">Amount</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      Loading recent bills...
                    </td>
                  </tr>
                ) : !summary || summary.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500 space-y-1">
                      <Receipt size={28} className="mx-auto text-zinc-300" />
                      <p className="font-bold text-zinc-700">No transactions recorded yet</p>
                      <p className="text-[11px] text-zinc-400">
                        Open the POS Terminal to create your first customer bill.
                      </p>
                    </td>
                  </tr>
                ) : (
                  summary.recentOrders.map((order) => {
                    const dateStr = new Date(order.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={order.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-2.5 font-mono font-bold text-zinc-900">
                          {order.invoiceNumber}
                          <span className="block text-[10px] text-zinc-400 font-sans font-normal">
                            {dateStr}
                          </span>
                        </td>

                        <td className="py-2.5">
                          <span className="font-semibold text-zinc-800">
                            {order.customer ? order.customer.name : 'Walk-in'}
                          </span>
                        </td>

                        <td className="py-2.5 text-zinc-500">{order.createdBy}</td>

                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                            {order.paymentMethod}
                          </span>
                        </td>

                        <td className="py-2.5 font-black text-zinc-900">
                          {formatCurrency(order.total, currency)}
                        </td>

                        <td className="py-2.5">
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              order.paymentStatus === 'COMPLETED'
                                ? 'bg-brand-50 text-brand-700 border border-brand-200'
                                : order.paymentStatus === 'CANCELLED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {order.paymentStatus === 'COMPLETED' ? (
                              <>
                                <CheckCircle2 size={11} className="text-brand-600" />
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

                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => setSelectedOrderForReceipt(order)}
                            className="p-1 rounded-lg text-zinc-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                            title="View Invoice Receipt"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Expenses Feed */}
        {activeFeedTab === 'EXPENSES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider border-b border-zinc-100">
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Description</th>
                  <th className="pb-2.5">Method</th>
                  <th className="pb-2.5">Logged By</th>
                  <th className="pb-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {!expenseSummary || expenseSummary.recentExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 space-y-1">
                      <Receipt size={28} className="mx-auto text-zinc-300" />
                      <p className="font-bold text-zinc-700">No recent expenses logged</p>
                      <p className="text-[11px] text-zinc-400">
                        Record your business overheads to keep track of spending.
                      </p>
                    </td>
                  </tr>
                ) : (
                  expenseSummary.recentExpenses.slice(0, 5).map((exp) => (
                    <tr key={exp.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-2.5 text-zinc-600 whitespace-nowrap">
                        {new Date(exp.expenseDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-2.5 text-zinc-800 font-medium max-w-xs truncate">
                        {exp.description || '—'}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-bold text-zinc-700">
                          {exp.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 text-zinc-500 text-[11px]">{exp.createdByName || 'System'}</td>
                      <td className="py-2.5 text-right font-black text-rose-600">
                        -{formatCurrency(exp.amount, currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Fast Track Operations & Business Profile Snapshot */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Fast Actions */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Fast Track Operations</h3>
            <p className="text-xs text-zinc-500">Shortcuts to daily business routines</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
            <Link
              to="/dashboard/pos"
              className="p-3.5 rounded-xl border border-brand-200 bg-brand-50/50 hover:bg-brand-50 hover:border-brand-300 transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold mb-1.5 shadow-xs">
                <Receipt size={18} />
              </div>
              <span className="text-xs font-bold text-zinc-900">POS Terminal</span>
              <span className="text-[10px] text-brand-700">Quick Billing</span>
            </Link>

            <Link
              to="/dashboard/expenses"
              className="p-3.5 rounded-xl border border-zinc-200 hover:border-rose-300 hover:bg-rose-50/40 transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold mb-1.5">
                <TrendingDown size={18} />
              </div>
              <span className="text-xs font-bold text-zinc-900">Expenses</span>
              <span className="text-[10px] text-zinc-500">Log Outflows</span>
            </Link>

            <Link
              to="/dashboard/customers"
              className="p-3.5 rounded-xl border border-zinc-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-1.5">
                <Users size={18} />
              </div>
              <span className="text-xs font-bold text-zinc-900">Clients CRM</span>
              <span className="text-[10px] text-zinc-500">Ledger History</span>
            </Link>

            <Link
              to="/dashboard/products"
              className="p-3.5 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-1.5">
                <Package size={18} />
              </div>
              <span className="text-xs font-bold text-zinc-900">Catalog</span>
              <span className="text-[10px] text-zinc-500">{activeProductCount}/{productCount} Items</span>
            </Link>

            {isOwner && (
              <Link
                to="/dashboard/staff"
                className="p-3.5 rounded-xl border border-zinc-200 hover:border-brand-300 hover:bg-brand-50/40 transition-all flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold mb-1.5">
                  <Users size={18} />
                </div>
                <span className="text-xs font-bold text-zinc-900">Staff Team</span>
                <span className="text-[10px] text-zinc-500">{staffCount} Members</span>
              </Link>
            )}
          </div>
        </div>

        {/* Business Profile Snapshot */}
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-zinc-900">Business Details</h3>
              {isOwner && (
                <Link
                  to="/dashboard/settings"
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Settings
                </Link>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-400 text-[10px] block font-medium">Business Name</span>
                <span className="text-zinc-900 font-bold text-sm">{business?.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-zinc-400 text-[10px] block font-medium">Vertical Type</span>
                  <span className="text-zinc-900 font-semibold">{business?.businessType}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-zinc-400 text-[10px] block font-medium">Currency</span>
                  <span className="text-zinc-900 font-bold">{business?.currency || 'USD'}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 space-y-0.5">
                <span className="text-zinc-400 text-[10px] block font-medium">Tax Configuration</span>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-900 font-semibold">
                    {business?.taxName || 'GST'}: {business?.taxRate || 0}%
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      business?.taxInclusive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {business?.taxInclusive ? 'Inclusive' : 'Exclusive'}
                  </span>
                </div>
                {business?.taxNumber && (
                  <span className="text-[10px] text-zinc-500 block pt-0.5">
                    GSTIN: {business.taxNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 text-center">
            <span className="text-[10px] text-zinc-400">
              Tenant ID: #{business?.id} • Protected Multi-Tenant SaaS
            </span>
          </div>
        </div>
      </section>

      {/* Invoice Modal Preview */}
      {selectedOrderForReceipt && (
        <InvoiceReceiptModal
          order={selectedOrderForReceipt}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}
    </div>
  );
};
