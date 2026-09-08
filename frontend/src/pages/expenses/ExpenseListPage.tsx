import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  expensesApi,
  Expense,
  ExpenseCategory,
  ExpenseRequest,
  ExpenseSummaryResponse,
} from '../../api/expenses';
import { PaymentMethod } from '../../api/billing';
import { getCurrencySymbol } from '../../utils/currency';
import {
  DollarSign,
  Plus,
  Search,
  Calendar,
  Building,
  Users as UsersIcon,
  Zap,
  ShoppingBag,
  Truck,
  Megaphone,
  Wrench,
  HelpCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  TrendingDown,
  Clock,
  PieChart,
  LucideIcon,
} from 'lucide-react';

const CATEGORY_METADATA: Record<
  ExpenseCategory,
  { label: string; icon: LucideIcon; color: string; bgColor: string }
> = {
  RENT: { label: 'Rent & Lease', icon: Building, color: 'text-indigo-700', bgColor: 'bg-indigo-50 border-indigo-200' },
  SALARY: { label: 'Payroll & Salary', icon: UsersIcon, color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200' },
  ELECTRICITY: { label: 'Electricity & Utilities', icon: Zap, color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
  PURCHASE: { label: 'Inventory / Purchase', icon: ShoppingBag, color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  TRANSPORT: { label: 'Transport & Logistics', icon: Truck, color: 'text-cyan-700', bgColor: 'bg-cyan-50 border-cyan-200' },
  MARKETING: { label: 'Marketing & Ads', icon: Megaphone, color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
  MAINTENANCE: { label: 'Maintenance & Repairs', icon: Wrench, color: 'text-rose-700', bgColor: 'bg-rose-50 border-rose-200' },
  OTHER: { label: 'Other Expenses', icon: HelpCircle, color: 'text-slate-700', bgColor: 'bg-slate-100 border-slate-200' },
};

export const ExpenseListPage: React.FC = () => {
  const { business, user } = useAuth();
  const isOwner = user?.role === 'OWNER';

  // Data State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
  const [datePreset, setDatePreset] = useState<'ALL' | 'TODAY' | 'THIS_MONTH' | 'CUSTOM'>('THIS_MONTH');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  // Form State
  const [formData, setFormData] = useState<ExpenseRequest>({
    category: 'PURCHASE',
    description: '',
    amount: 0,
    paymentMethod: 'CASH',
    expenseDate: new Date().toISOString().split('T')[0],
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currency = business?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(currency);

  // Calculate Dates according to preset
  const getDateRangeForPreset = (preset: 'ALL' | 'TODAY' | 'THIS_MONTH' | 'CUSTOM') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'TODAY') {
      return { start: todayStr, end: todayStr };
    }
    if (preset === 'THIS_MONTH') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0],
      };
    }
    if (preset === 'CUSTOM') {
      return { start: startDate || undefined, end: endDate || undefined };
    }
    return { start: undefined, end: undefined };
  };

  const fetchExpensesAndSummary = async (pageNumber = 0) => {
    try {
      setLoading(true);
      const dateRange = getDateRangeForPreset(datePreset);

      const [res, sumRes] = await Promise.all([
        expensesApi.getExpenses({
          search: search.trim() || undefined,
          category: categoryFilter !== 'ALL' ? (categoryFilter as ExpenseCategory) : undefined,
          paymentMethod: paymentMethodFilter !== 'ALL' ? (paymentMethodFilter as PaymentMethod) : undefined,
          startDate: dateRange.start,
          endDate: dateRange.end,
          minAmount: minAmount ? parseFloat(minAmount) : undefined,
          maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
          page: pageNumber,
          size: 20,
        }),
        expensesApi.getSummary(),
      ]);

      setExpenses(res.content);
      setPage(res.pageNumber);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
      setSummary(sumRes);
    } catch (err: any) {
      setErrorMessage('Failed to load expense records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndSummary(0);
  }, [categoryFilter, paymentMethodFilter, datePreset]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExpensesAndSummary(0);
  };

  const openAddModal = () => {
    setFormData({
      category: 'PURCHASE',
      description: '',
      amount: 0,
      paymentMethod: 'CASH',
      expenseDate: new Date().toISOString().split('T')[0],
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setFormData({
      category: exp.category,
      description: exp.description || '',
      amount: exp.amount,
      paymentMethod: exp.paymentMethod,
      expenseDate: exp.expenseDate,
    });
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      setErrorMessage('Amount must be greater than 0.');
      return;
    }

    setFormSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      if (editingExpense) {
        await expensesApi.updateExpense(editingExpense.id, formData);
        setSuccessMessage('Expense entry updated successfully.');
        setEditingExpense(null);
      } else {
        await expensesApi.createExpense(formData);
        setSuccessMessage('New expense recorded successfully.');
        setIsAddModalOpen(false);
      }
      fetchExpensesAndSummary(page);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to save expense.'
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deletingExpense) return;
    setFormSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await expensesApi.deleteExpense(deletingExpense.id);
      setSuccessMessage('Expense entry deleted.');
      setDeletingExpense(null);
      fetchExpensesAndSummary(page);
    } catch (err: any) {
      setErrorMessage('Failed to delete expense.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filtered total amount on current view
  const currentFilteredTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Expense Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Track operational spending, recurring overheads, vendor payouts, and maintain accurate financial health.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-800 text-sm font-semibold">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-800 text-sm font-semibold">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2">
            {(summary?.todayExpenses ?? 0).toFixed(2)} {currencySymbol}
          </div>
          <span className="text-[11px] text-slate-400">Outflows logged today</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Monthly Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-700 mt-2">
            {(summary?.monthExpenses ?? 0).toFixed(2)} {currencySymbol}
          </div>
          <span className="text-[11px] text-rose-600">Current calendar month</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Filtered Outflow</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-700 mt-2">
            {currentFilteredTotal.toFixed(2)} {currencySymbol}
          </div>
          <span className="text-[11px] text-indigo-600">{totalElements} filtered entries</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Category Breakdown</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <PieChart size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-700 mt-2">
            {summary?.categoryBreakdown?.length ?? 0}
          </div>
          <span className="text-[11px] text-purple-600">Active spending categories</span>
        </div>
      </div>

      {/* Category Breakdown Pill Bar */}
      {summary && summary.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              This Month's Spending by Category
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Total: {(summary.monthExpenses || 0).toFixed(2)} {currencySymbol}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {summary.categoryBreakdown.map((item) => {
              const meta = CATEGORY_METADATA[item.category] || CATEGORY_METADATA.OTHER;
              const Icon = meta.icon;
              return (
                <div
                  key={item.category}
                  onClick={() => setCategoryFilter(categoryFilter === item.category ? 'ALL' : item.category)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    categoryFilter === item.category
                      ? 'ring-2 ring-indigo-500 bg-indigo-50/60 border-indigo-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 mb-1">
                    <Icon size={13} className={meta.color} />
                    <span className="text-[10px] font-bold text-slate-600 truncate">{meta.label}</span>
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    {item.totalAmount.toFixed(0)} {currencySymbol}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search descriptions, notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
              />
            </div>

            {/* Quick Date Presets */}
            <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
              {(['THIS_MONTH', 'TODAY', 'ALL', 'CUSTOM'] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDatePreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    datePreset === preset
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset === 'THIS_MONTH' ? 'This Month' : preset === 'TODAY' ? 'Today' : preset === 'ALL' ? 'All Time' : 'Custom'}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full lg:w-auto"
            >
              <option value="ALL">All Categories</option>
              {Object.keys(CATEGORY_METADATA).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_METADATA[cat as ExpenseCategory].label}
                </option>
              ))}
            </select>

            {/* Payment Method Dropdown */}
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full lg:w-auto"
            >
              <option value="ALL">All Methods</option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI / QR</option>
              <option value="CARD">Card</option>
              <option value="CREDIT">Credit</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Custom Date Range & Amount Filter Row (if Custom preset or advanced search) */}
          {datePreset === 'CUSTOM' && (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-500">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-500">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-500">Min {currencySymbol}:</span>
                <input
                  type="number"
                  placeholder="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-20 px-2 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-500">Max {currencySymbol}:</span>
                <input
                  type="number"
                  placeholder="99999"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-24 px-2 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Apply Filters
              </button>
            </div>
          )}
        </form>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                <th className="pb-3">Date</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Logged By</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Loading expense records...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 space-y-2">
                    <DollarSign size={32} className="mx-auto text-slate-300" />
                    <p className="font-bold text-slate-700">No expenses found</p>
                    <p className="text-[11px] text-slate-400">
                      Record operational expenses to track your business outflows and net margins.
                    </p>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => {
                  const meta = CATEGORY_METADATA[exp.category] || CATEGORY_METADATA.OTHER;
                  const Icon = meta.icon;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-3.5 pr-4 text-slate-600 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{new Date(exp.expenseDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${meta.bgColor} ${meta.color}`}
                        >
                          <Icon size={12} />
                          <span>{meta.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-800 font-medium max-w-xs truncate">
                        {exp.description || <span className="text-slate-400 italic">No description</span>}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-[10px] text-slate-700">
                          {exp.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-500 text-[11px]">
                        {exp.createdByName || 'System'}
                      </td>
                      <td className="py-3.5 pr-4 font-black text-rose-700 text-sm whitespace-nowrap">
                        -{exp.amount.toFixed(2)} {currencySymbol}
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => openEditModal(exp)}
                            title="Edit Expense"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          {isOwner && (
                            <button
                              onClick={() => setDeletingExpense(exp)}
                              title="Delete Expense"
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 size={15} />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-400">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page === 0}
                onClick={() => fetchExpensesAndSummary(page - 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => fetchExpensesAndSummary(page + 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {(isAddModalOpen || editingExpense) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">
                {editingExpense ? 'Edit Expense Record' : 'Record Business Expense'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingExpense(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expense Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold bg-white"
                >
                  {Object.keys(CATEGORY_METADATA).map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_METADATA[cat as ExpenseCategory].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount ({currencySymbol}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expense Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Method <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(['CASH', 'UPI', 'CARD', 'CREDIT', 'OTHER'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: method })}
                      className={`py-2 text-center rounded-xl text-xs font-bold border transition-all ${
                        formData.paymentMethod === method
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Office electricity bill for June, Vendor raw materials invoice..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingExpense(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingExpense ? 'Update Expense' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Delete Expense Entry?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this {deletingExpense.category} expense for {deletingExpense.amount.toFixed(2)} {currencySymbol}? This will adjust your net revenue calculations.
              </p>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeletingExpense(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExpense}
                disabled={formSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                {formSubmitting ? 'Deleting...' : 'Delete Expense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
