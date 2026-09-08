import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productsApi } from '../../api/products';
import { businessApi } from '../../api/business';
import { billingApi, BillingSummary, Order } from '../../api/billing';
import { expensesApi, ExpenseSummaryResponse } from '../../api/expenses';
import { InvoiceReceiptModal } from '../../components/billing/InvoiceReceiptModal';
import { formatCurrency } from '../../utils/currency';
import {
  Package,
  ArrowUpRight,
  Sparkles,
  Receipt,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  IndianRupee,
} from 'lucide-react';

export const DashboardHomePage: React.FC = () => {
  const { user, business } = useAuth();
  const [productCount, setProductCount] = useState<number>(0);
  const [activeProductCount, setActiveProductCount] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  const [activeFeedTab, setActiveFeedTab] = useState<'INVOICES' | 'EXPENSES'>('INVOICES');

  const isOwner = user?.role === 'OWNER';

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

  const currency = summary?.currency || business?.currency || 'INR';

  const todaySales = summary?.todaySales ?? 0;
  const todayExpenses = summary?.todayExpenses ?? 0;
  const todayNet = summary?.todayNetRevenue ?? (todaySales - todayExpenses);

  const monthSales = summary?.monthSales ?? 0;
  const monthExpenses = summary?.monthExpenses ?? 0;
  const monthNet = summary?.monthNetRevenue ?? (monthSales - monthExpenses);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 md:p-8 text-white shadow-sm border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-indigo-500/30">
                <Sparkles size={12} className="text-indigo-400" />
                {business?.businessType || 'BUSINESS'} • {business?.businessSize || 'SMALL'} MODEL
              </span>
              <span className="text-slate-400 text-xs font-medium">
                • {business?.timezone || 'Asia/Kolkata'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-white">{user?.fullName}</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Operating <span className="text-slate-200 font-semibold">{business?.name}</span> with unified POS, ₹ INR financials, and tenant-level inventory isolation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/dashboard/pos"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <Receipt size={16} />
              <span>Launch POS Billing</span>
            </Link>

            <Link
              to="/dashboard/analytics"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <BarChart3 size={15} />
              <span>Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Today's Financial Overview */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Net Margin</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                todayNet >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {todayNet >= 0 ? '+ Net Profit' : '- Net Deficit'}
              </span>
            </div>

            <div className="text-3xl font-black text-slate-900">
              {loading ? '...' : formatCurrency(todayNet, currency)}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <TrendingUp size={13} />
                  <span>Revenue Today</span>
                </span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">
                  {loading ? '...' : formatCurrency(todaySales, currency)}
                </div>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <TrendingDown size={13} />
                  <span>Expenses Today</span>
                </span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">
                  {loading ? '...' : formatCurrency(todayExpenses, currency)}
                </div>
              </div>
            </div>
          </div>

          {/* This Month's Financial Overview */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">This Month's Net Balance</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                monthNet >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {monthNet >= 0 ? '+ Monthly Profit' : '- Monthly Deficit'}
              </span>
            </div>

            <div className="text-3xl font-black text-slate-900">
              {loading ? '...' : formatCurrency(monthNet, currency)}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <TrendingUp size={13} />
                  <span>Month's Revenue</span>
                </span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">
                  {loading ? '...' : formatCurrency(monthSales, currency)}
                </div>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <TrendingDown size={13} />
                  <span>Month's Expenses</span>
                </span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">
                  {loading ? '...' : formatCurrency(monthExpenses, currency)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Sales & Operational KPI Cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today's Sales */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Sales</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {loading ? '...' : formatCurrency(todaySales, currency)}
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px] font-medium text-slate-400">
                  {loading ? '...' : `${summary?.todayOrdersCount ?? 0} paid bills today`}
                </span>
                <Link
                  to="/dashboard/bills"
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Invoices →
                </Link>
              </div>
            </div>
          </div>

          {/* Today's Expenses */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Expenses</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <TrendingDown size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-rose-700">
                {loading ? '...' : formatCurrency(todayExpenses, currency)}
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px] font-medium text-slate-400">Outflows logged</span>
                <Link
                  to="/dashboard/expenses"
                  className="text-[10px] font-bold text-rose-600 hover:text-rose-800"
                >
                  Manage →
                </Link>
              </div>
            </div>
          </div>

          {/* Pending / Due Amount */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending / Due</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-amber-700">
                {loading ? '...' : formatCurrency(summary?.pendingDueAmount ?? 0, currency)}
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px] font-medium text-slate-400">Unsettled receivables</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Due Bills
                </span>
              </div>
            </div>
          </div>

          {/* Total Customers */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Clients</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Users size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {loading ? '...' : summary?.totalCustomersCount ?? 0}
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px] font-medium text-slate-400">CRM ledger database</span>
                <Link
                  to="/dashboard/customers"
                  className="text-[10px] font-bold text-purple-600 hover:text-purple-800"
                >
                  Clients list →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Feeds: Recent Invoices & Recent Expenses */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveFeedTab('INVOICES')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFeedTab === 'INVOICES'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Recent Invoices ({summary?.recentOrders.length ?? 0})
            </button>
            <button
              onClick={() => setActiveFeedTab('EXPENSES')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFeedTab === 'EXPENSES'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Recent Expenses ({expenseSummary?.recentExpenses.length ?? 0})
            </button>
          </div>

          <Link
            to={activeFeedTab === 'INVOICES' ? '/dashboard/bills' : '/dashboard/expenses'}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
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
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                  <th className="pb-2.5">Invoice</th>
                  <th className="pb-2.5">Customer</th>
                  <th className="pb-2.5">Billed By</th>
                  <th className="pb-2.5">Method</th>
                  <th className="pb-2.5">Amount</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading recent bills...
                    </td>
                  </tr>
                ) : !summary || summary.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 space-y-1">
                      <Receipt size={28} className="mx-auto text-slate-300" />
                      <p className="font-bold text-slate-700">No transactions recorded yet</p>
                      <p className="text-[11px] text-slate-400">
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
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 font-mono font-bold text-slate-900">
                          {order.invoiceNumber}
                          <span className="block text-[10px] text-slate-400 font-sans font-normal">
                            {dateStr}
                          </span>
                        </td>

                        <td className="py-2.5">
                          <span className="font-semibold text-slate-800">
                            {order.customer ? order.customer.name : 'Walk-in'}
                          </span>
                        </td>

                        <td className="py-2.5 text-slate-500">{order.createdBy}</td>

                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {order.paymentMethod}
                          </span>
                        </td>

                        <td className="py-2.5 font-black text-slate-900">
                          {formatCurrency(order.total, currency)}
                        </td>

                        <td className="py-2.5">
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
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

                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => setSelectedOrderForReceipt(order)}
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="View Invoice"
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
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Description</th>
                  <th className="pb-2.5">Method</th>
                  <th className="pb-2.5">Logged By</th>
                  <th className="pb-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {!expenseSummary || expenseSummary.recentExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 space-y-1">
                      <IndianRupee size={28} className="mx-auto text-slate-300" />
                      <p className="font-bold text-slate-700">No recent expenses logged</p>
                      <p className="text-[11px] text-slate-400">
                        Record your business overheads to keep track of spending.
                      </p>
                    </td>
                  </tr>
                ) : (
                  expenseSummary.recentExpenses.slice(0, 5).map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 text-slate-600 whitespace-nowrap">
                        {new Date(exp.expenseDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-800 font-medium max-w-xs truncate">
                        {exp.description || '—'}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700">
                          {exp.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500 text-[11px]">{exp.createdByName || 'System'}</td>
                      <td className="py-2.5 text-right font-black text-rose-700">
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
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Fast Track Operations</h3>
            <p className="text-xs text-slate-500">Shortcuts to daily business management routines</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
            <Link
              to="/dashboard/pos"
              className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-400 transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold mb-1.5 shadow-xs">
                <Receipt size={18} />
              </div>
              <span className="text-xs font-bold text-slate-900">POS Terminal</span>
              <span className="text-[10px] text-indigo-700">Quick Billing</span>
            </Link>

            <Link
              to="/dashboard/expenses"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold mb-1.5">
                <TrendingDown size={18} />
              </div>
              <span className="text-xs font-bold text-slate-900">Expenses</span>
              <span className="text-[10px] text-slate-500">Log Outflows</span>
            </Link>

            <Link
              to="/dashboard/customers"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-1.5">
                <Users size={18} />
              </div>
              <span className="text-xs font-bold text-slate-900">Clients CRM</span>
              <span className="text-[10px] text-slate-500">Ledger History</span>
            </Link>

            <Link
              to="/dashboard/products"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-1.5">
                <Package size={18} />
              </div>
              <span className="text-xs font-bold text-slate-900">Catalog</span>
              <span className="text-[10px] text-slate-500">{activeProductCount}/{productCount} Items</span>
            </Link>

            {isOwner && (
              <Link
                to="/dashboard/staff"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-1.5">
                  <Users size={18} />
                </div>
                <span className="text-xs font-bold text-slate-900">Staff Team</span>
                <span className="text-[10px] text-slate-500">{staffCount} Members</span>
              </Link>
            )}
          </div>
        </div>

        {/* Business Profile Snapshot */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Business Details</h3>
              {isOwner && (
                <Link
                  to="/dashboard/settings"
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Settings
                </Link>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] block font-medium">Business Name</span>
                <span className="text-slate-900 font-bold text-sm">{business?.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-medium">Vertical Type</span>
                  <span className="text-slate-900 font-semibold">{business?.businessType}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-medium">Currency</span>
                  <span className="text-slate-900 font-bold">₹ {business?.currency || 'INR'}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <span className="text-slate-400 text-[10px] block font-medium">Tax Configuration</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 font-semibold">
                    {business?.taxName || 'GST'}: {business?.taxRate || 0}%
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      business?.taxInclusive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {business?.taxInclusive ? 'Inclusive' : 'Exclusive'}
                  </span>
                </div>
                {business?.taxNumber && (
                  <span className="text-[10px] text-slate-500 block pt-0.5">
                    GSTIN: {business.taxNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400">
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
