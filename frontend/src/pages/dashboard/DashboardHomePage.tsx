import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { productsApi } from '../../api/products';
import { businessApi } from '../../api/business';
import { billingApi, BillingSummary, Order } from '../../api/billing';
import { expensesApi, ExpenseSummaryResponse } from '../../api/expenses';
import { reviewsApi, ReviewAnalytics } from '../../api/reviews';
import { InvoiceReceiptModal } from '../../components/billing/InvoiceReceiptModal';
import { MetricCardsSkeleton } from '../../components/common/LoadingStates';
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
  Star,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Calendar
} from 'lucide-react';

export const DashboardHomePage: React.FC = () => {
  const { user, business } = useAuth();
  const { t } = useTranslation();
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
    if (hour < 12) return t('dashboard.greetingMorning', 'Good Morning');
    if (hour < 17) return t('dashboard.greetingAfternoon', 'Good Afternoon');
    return t('dashboard.greetingEvening', 'Good Evening');
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

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
      {/* Top Welcome Header - Matching Reference Style */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-brand-500/10">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-cyan-200 border border-white/20">
              <Calendar size={13} />
              <span>{todayFormatted}</span>
              <span>•</span>
              <span>{t('dashboard.makeTodayProductive', 'Make today productive')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {getGreeting()}, {user?.fullName || 'Business Owner'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl">
              {business?.name 
                ? `${business.name} • ${t('dashboard.subtitle', "Here's what's happening with your store today.")}`
                : t('dashboard.subtitle', "Here's what's happening with your business today.")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard/pos"
              className="px-5 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black shadow-lg shadow-cyan-400/25 transition-all transform hover:-translate-y-0.5 flex items-center space-x-2 cursor-pointer"
            >
              <Receipt size={16} />
              <span>{t('dashboard.launchPos', 'Launch POS Billing')}</span>
            </Link>

            <Link
              to="/dashboard/ai-assistant"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Sparkles size={15} className="text-cyan-300" />
              <span>{t('nav.aiAssistant', 'AI Assistant')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Grid - Pastel Squircle Cards */}
      <section>
        {loading ? (
          <MetricCardsSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* 1. Today's Sales (Pastel Blue) */}
            <div className="p-5 rounded-3xl bg-blue-50/60 border border-blue-100 hover:border-brand-300 transition-all hover:shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {t('dashboard.todaySales', "Today's Sales")}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {formatCurrency(todaySales, currency)}
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-blue-200/60">
                <span className="text-slate-600 font-medium">
                  {`${todayOrders} ${t('dashboard.billsRecorded', 'bills recorded')}`}
                </span>
                <Link to="/dashboard/bills" className="text-brand-700 font-bold hover:underline text-[11px] flex items-center gap-0.5">
                  <span>{t('dashboard.invoices', 'Invoices')}</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* 2. Today's Orders (Pastel Cyan/Teal) */}
            <div className="p-5 rounded-3xl bg-cyan-50/60 border border-cyan-100 hover:border-cyan-300 transition-all hover:shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {t('dashboard.orders', 'Orders')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
                  <ShoppingBag size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {todayOrders}
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-cyan-200/60">
                <span className="text-slate-600 font-medium">{t('dashboard.counterTransactions', 'Counter transactions')}</span>
                <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100/80 px-2 py-0.5 rounded-full">
                  POS Active
                </span>
              </div>
            </div>

            {/* 3. Expenses (Pastel Rose) */}
            <div className="p-5 rounded-3xl bg-rose-50/60 border border-rose-100 hover:border-rose-300 transition-all hover:shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {t('dashboard.expenses', 'Expenses')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                  <TrendingDown size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                {formatCurrency(todayExpenses, currency)}
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-rose-200/60">
                <span className="text-slate-600 font-medium">{t('dashboard.dailyLoggedOverhead', 'Daily overhead')}</span>
                <Link to="/dashboard/expenses" className="text-rose-700 font-bold hover:underline text-[11px] flex items-center gap-0.5">
                  <span>{t('dashboard.manage', 'Manage')}</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* 4. Review Rating (Pastel Amber) */}
            <div className="p-5 rounded-3xl bg-amber-50/60 border border-amber-100 hover:border-amber-300 transition-all hover:shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {t('dashboard.reviewRating', 'Review Rating')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <Star size={18} className="fill-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-1.5">
                <span>{Number(averageRating).toFixed(1)}</span>
                <Star className="w-5 h-5 fill-amber-500 text-amber-500 inline" />
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-200/60">
                <span className="text-slate-600 font-medium">{totalReviews} {t('dashboard.verifiedReviews', 'verified reviews')}</span>
                <Link to="/dashboard/reviews" className="text-amber-800 font-bold hover:underline text-[11px] flex items-center gap-0.5">
                  <span>{t('dashboard.qrBoost', 'QR Boost')}</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Financial Health Summary Cards: Today vs This Month */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3.5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-8 bg-slate-200 rounded w-1/2" />
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div className="h-10 bg-slate-200 rounded" />
                <div className="h-10 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3.5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-8 bg-slate-200 rounded w-1/2" />
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div className="h-10 bg-slate-200 rounded" />
                <div className="h-10 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Today's Financial Overview */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('dashboard.todayNetMargin', "Today's Net Margin")}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  todayNet >= 0 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {todayNet >= 0 ? t('dashboard.netProfit', '+ Net Profit') : t('dashboard.netDeficit', '- Net Deficit')}
                </span>
              </div>

              <div className="text-3xl font-black text-slate-950 tracking-tight">
                {formatCurrency(todayNet, currency)}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <span className="text-[11px] font-semibold text-brand-700 flex items-center gap-1">
                    <TrendingUp size={13} />
                    <span>{t('dashboard.revenueToday', 'Revenue Today')}</span>
                  </span>
                  <div className="text-base font-black text-slate-900 mt-1">
                    {formatCurrency(todaySales, currency)}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
                  <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                    <TrendingDown size={13} />
                    <span>{t('dashboard.expensesToday', 'Expenses Today')}</span>
                  </span>
                  <div className="text-base font-black text-slate-900 mt-1">
                    {formatCurrency(todayExpenses, currency)}
                  </div>
                </div>
              </div>
            </div>

            {/* This Month's Financial Overview */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('dashboard.monthNetMargin', "This Month's Net Balance")}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  monthNet >= 0 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {monthNet >= 0 ? t('dashboard.monthlyProfit', '+ Monthly Profit') : t('dashboard.monthlyDeficit', '- Monthly Deficit')}
                </span>
              </div>

              <div className="text-3xl font-black text-slate-950 tracking-tight">
                {formatCurrency(monthNet, currency)}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <span className="text-[11px] font-semibold text-brand-700 flex items-center gap-1">
                    <TrendingUp size={13} />
                    <span>{t('dashboard.monthRevenue', "Month's Revenue")}</span>
                  </span>
                  <div className="text-base font-black text-slate-900 mt-1">
                    {formatCurrency(monthSales, currency)}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
                  <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                    <TrendingDown size={13} />
                    <span>{t('dashboard.monthExpenses', "Month's Expenses")}</span>
                  </span>
                  <div className="text-base font-black text-slate-900 mt-1">
                    {formatCurrency(monthExpenses, currency)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Dual Feeds: Recent Invoices & Recent Expenses */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveFeedTab('INVOICES')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeFeedTab === 'INVOICES'
                  ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md shadow-brand-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('dashboard.recentInvoices', 'Recent Invoices')} ({summary?.recentOrders.length ?? 0})
            </button>
            <button
              onClick={() => setActiveFeedTab('EXPENSES')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeFeedTab === 'EXPENSES'
                  ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md shadow-brand-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('dashboard.recentExpenses', 'Recent Expenses')} ({expenseSummary?.recentExpenses.length ?? 0})
            </button>
          </div>

          <Link
            to={activeFeedTab === 'INVOICES' ? '/dashboard/bills' : '/dashboard/expenses'}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{activeFeedTab === 'INVOICES' ? t('dashboard.viewAllInvoices', 'View All Invoices') : t('dashboard.viewAllExpenses', 'View All Expenses')}</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Tab 1: Invoices Feed */}
        {activeFeedTab === 'INVOICES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                  <th className="pb-3">{t('dashboard.invoice', 'Invoice')}</th>
                  <th className="pb-3">{t('dashboard.customer', 'Customer')}</th>
                  <th className="pb-3">{t('dashboard.billedBy', 'Billed By')}</th>
                  <th className="pb-3">{t('dashboard.method', 'Method')}</th>
                  <th className="pb-3">{t('dashboard.amount', 'Amount')}</th>
                  <th className="pb-3">{t('dashboard.status', 'Status')}</th>
                  <th className="pb-3 text-right">{t('dashboard.action', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-20" /></td>
                      <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-28" /></td>
                      <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-16" /></td>
                      <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-12" /></td>
                      <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-16" /></td>
                      <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-14" /></td>
                      <td className="py-3.5 text-right"><div className="h-3.5 bg-slate-200 rounded w-6 ml-auto" /></td>
                    </tr>
                  ))
                ) : !summary || summary.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center mx-auto">
                        <Receipt size={24} />
                      </div>
                      <p className="font-bold text-slate-800">{t('dashboard.noTransactions', 'No transactions recorded yet')}</p>
                      <p className="text-xs text-slate-400">
                        {t('dashboard.openPosHint', 'Open the POS Terminal to create your first customer bill.')}
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
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 font-mono font-bold text-slate-900">
                          {order.invoiceNumber}
                          <span className="block text-[10px] text-slate-400 font-sans font-normal">
                            {dateStr}
                          </span>
                        </td>

                        <td className="py-3">
                          <span className="font-semibold text-slate-800">
                            {order.customer ? order.customer.name : t('pos.walkIn', 'Walk-in')}
                          </span>
                        </td>

                        <td className="py-3 text-slate-500">{order.createdBy}</td>

                        <td className="py-3">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {order.paymentMethod}
                          </span>
                        </td>

                        <td className="py-3 font-black text-slate-900">
                          {formatCurrency(order.total, currency)}
                        </td>

                        <td className="py-3">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
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
                                <span>{t('common.paid', 'Paid')}</span>
                              </>
                            ) : order.paymentStatus === 'CANCELLED' ? (
                              <>
                                <XCircle size={11} className="text-rose-600" />
                                <span>{t('common.cancelled', 'Cancelled')}</span>
                              </>
                            ) : (
                              <>
                                <Clock size={11} className="text-amber-600" />
                                <span>{t('common.pending', 'Pending')}</span>
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-3 text-right">
                          <button
                            onClick={() => setSelectedOrderForReceipt(order)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                            title={t('pos.viewReceipt', 'View Invoice Receipt')}
                          >
                            <Eye size={16} />
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
                  <th className="pb-3">{t('common.date', 'Date')}</th>
                  <th className="pb-3">{t('expenses.category', 'Category')}</th>
                  <th className="pb-3">{t('expenses.description', 'Description')}</th>
                  <th className="pb-3">{t('expenses.method', 'Method')}</th>
                  <th className="pb-3">{t('expenses.loggedBy', 'Logged By')}</th>
                  <th className="pb-3 text-right">{t('expenses.amount', 'Amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-20" /></td>
                      <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-24" /></td>
                      <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-36" /></td>
                      <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-16" /></td>
                      <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-20" /></td>
                      <td className="py-3.5 text-right"><div className="h-3.5 bg-slate-200 rounded w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : !expenseSummary || expenseSummary.recentExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                        <Receipt size={24} />
                      </div>
                      <p className="font-bold text-slate-800">{t('expenses.noExpenses', 'No recent expenses logged')}</p>
                      <p className="text-xs text-slate-400">
                        {t('expenses.recordPrompt', 'Record your business overheads to keep track of spending.')}
                      </p>
                    </td>
                  </tr>
                ) : (
                  expenseSummary.recentExpenses.slice(0, 5).map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 text-slate-600 whitespace-nowrap">
                        {new Date(exp.expenseDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 text-slate-800 font-medium max-w-xs truncate">
                        {exp.description || '—'}
                      </td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700">
                          {exp.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 text-[11px]">{exp.createdByName || 'System'}</td>
                      <td className="py-3 text-right font-black text-rose-600">
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
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Fast Actions Grid */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">{t('dashboard.fastTrackOps', 'Fast Track Operations')}</h3>
              <p className="text-xs text-slate-500">{t('dashboard.shortcutsHint', 'Shortcuts to daily business workflows')}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              ⚡ Quick Hub
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
            <Link
              to="/dashboard/pos"
              className="p-4 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/60 hover:border-brand-300 transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold mb-2 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Receipt size={20} />
              </div>
              <span className="text-xs font-bold text-slate-900">{t('pos.title', 'POS Terminal')}</span>
              <span className="text-[10px] text-brand-700 font-medium">{t('pos.quickBilling', 'Quick Billing')}</span>
            </Link>

            <Link
              to="/dashboard/expenses"
              className="p-4 rounded-2xl border border-rose-100 bg-rose-50/50 hover:bg-rose-100/60 hover:border-rose-300 transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold mb-2 shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <TrendingDown size={20} />
              </div>
              <span className="text-xs font-bold text-slate-900">{t('expenses.title', 'Expenses')}</span>
              <span className="text-[10px] text-rose-700 font-medium">{t('expenses.logOutflows', 'Log Outflows')}</span>
            </Link>

            <Link
              to="/dashboard/customers"
              className="p-4 rounded-2xl border border-cyan-100 bg-cyan-50/50 hover:bg-cyan-100/60 hover:border-cyan-300 transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-white flex items-center justify-center font-bold mb-2 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Users size={20} />
              </div>
              <span className="text-xs font-bold text-slate-900">{t('customers.title', 'Clients CRM')}</span>
              <span className="text-[10px] text-cyan-700 font-medium">{t('customers.ledgerHistory', 'Ledger History')}</span>
            </Link>

            <Link
              to="/dashboard/products"
              className="p-4 rounded-2xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100/60 hover:border-purple-300 transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold mb-2 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Package size={20} />
              </div>
              <span className="text-xs font-bold text-slate-900">{t('products.title', 'Catalog')}</span>
              <span className="text-[10px] text-purple-700 font-medium">{activeProductCount}/{productCount} {t('products.items', 'Items')}</span>
            </Link>

            {isOwner && (
              <Link
                to="/dashboard/staff"
                className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/60 hover:border-emerald-300 transition-all flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-2 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Users size={20} />
                </div>
                <span className="text-xs font-bold text-slate-900">{t('nav.staff', 'Staff Team')}</span>
                <span className="text-[10px] text-emerald-700 font-medium">{staffCount} {t('common.members', 'Members')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Business Profile Snapshot */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">{t('dashboard.businessDetails', 'Business Details')}</h3>
              {isOwner && (
                <Link
                  to="/dashboard/settings"
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  {t('nav.settings', 'Settings')}
                </Link>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] block font-semibold uppercase">{t('auth.businessName', 'Business Name')}</span>
                <span className="text-slate-900 font-black text-sm">{business?.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">{t('dashboard.verticalType', 'Vertical Type')}</span>
                  <span className="text-slate-900 font-bold">{business?.businessType}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">{t('common.currency', 'Currency')}</span>
                  <span className="text-slate-900 font-black">{business?.currency || 'USD'}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 text-[10px] block font-semibold uppercase">{t('settings.taxConfig', 'Tax Configuration')}</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 font-bold">
                    {business?.taxName || 'GST'}: {business?.taxRate || 0}%
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      business?.taxInclusive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {business?.taxInclusive ? t('settings.inclusive', 'Inclusive') : t('settings.exclusive', 'Exclusive')}
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

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              Tenant #{business?.id} • Cloud Multi-Tenant Node
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
