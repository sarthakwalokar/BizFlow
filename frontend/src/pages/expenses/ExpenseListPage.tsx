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
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';
import {
  Plus,
  Search,
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
  OTHER: { label: 'Other Expenses', icon: HelpCircle, color: 'text-zinc-700', bgColor: 'bg-zinc-100 border-zinc-200' },
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

  const currency = business?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  const fetchExpenses = async (pageNumber = 0) => {
    try {
      setLoading(true);

      let effectiveStart = startDate;
      let effectiveEnd = endDate;

      if (datePreset === 'TODAY') {
        const today = new Date().toISOString().split('T')[0];
        effectiveStart = today;
        effectiveEnd = today;
      } else if (datePreset === 'THIS_MONTH') {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        effectiveStart = firstDay;
        effectiveEnd = lastDay;
      }

      const [paged, sumRes] = await Promise.all([
        expensesApi.getExpenses({
          page: pageNumber,
          size: 20,
          category: categoryFilter !== 'ALL' ? (categoryFilter as ExpenseCategory) : undefined,
          paymentMethod: paymentMethodFilter !== 'ALL' ? (paymentMethodFilter as PaymentMethod) : undefined,
          startDate: effectiveStart || undefined,
          endDate: effectiveEnd || undefined,
          search: search.trim() || undefined,
        }),
        expensesApi.getSummary(),
      ]);

      setExpenses(paged.content);
      setPage(paged.pageNumber);
      setTotalPages(paged.totalPages);
      setTotalElements(paged.totalElements);
      setSummary(sumRes);
    } catch (err: any) {
      setErrorMessage('Failed to load expense records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(0);
  }, [categoryFilter, paymentMethodFilter, datePreset]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExpenses(0);
  };

  const openAddModal = () => {
    setFormData({
      category: 'PURCHASE',
      description: '',
      amount: '' as any,
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

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;

    setFormSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await expensesApi.createExpense({
        ...formData,
        amount: parseFloat(String(formData.amount)),
      });
      setSuccessMessage('Expense logged successfully.');
      setIsAddModalOpen(false);
      fetchExpenses(page);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to record expense.'
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !formData.amount || Number(formData.amount) <= 0) return;

    setFormSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await expensesApi.updateExpense(editingExpense.id, {
        ...formData,
        amount: parseFloat(String(formData.amount)),
      });
      setSuccessMessage('Expense record updated.');
      setEditingExpense(null);
      fetchExpenses(page);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to update expense.'
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deletingExpense) return;

    setFormSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await expensesApi.deleteExpense(deletingExpense.id);
      setSuccessMessage('Expense record deleted.');
      setDeletingExpense(null);
      fetchExpenses(page);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to delete expense.'
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Expense Management</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Log overheads, supplier payouts, payroll, rent, and track total expenditures.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Log Expense</span>
        </button>
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

      {/* Expense Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Today's Expenses</span>
          <div className="text-2xl font-black text-rose-600">
            {loading ? '...' : formatCurrency(summary?.todayExpenses ?? 0, currency)}
          </div>
          <p className="text-[11px] text-zinc-400">Current day cash &amp; bank outflows</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">This Month's Total</span>
          <div className="text-2xl font-black text-zinc-950">
            {loading ? '...' : formatCurrency(summary?.monthExpenses ?? 0, currency)}
          </div>
          <p className="text-[11px] text-zinc-400">Total operational spend this month</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">All-Time Recorded</span>
          <div className="text-2xl font-black text-zinc-950">
            {loading ? '...' : formatCurrency(summary?.totalExpenses ?? 0, currency)}
          </div>
          <p className="text-[11px] text-zinc-400">Cumulative historical expenditures</p>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-card space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search description, reference ID or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Preset Time Filter */}
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as any)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="THIS_MONTH">This Month</option>
              <option value="TODAY">Today Only</option>
              <option value="ALL">All Time</option>
              <option value="CUSTOM">Custom Range</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">All Categories</option>
              {Object.entries(CATEGORY_METADATA).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>

            {/* Payment Method Filter */}
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">All Payment Modes</option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI / Bank</option>
              <option value="CARD">Card</option>
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

        {datePreset === 'CUSTOM' && (
          <div className="flex items-center gap-3 pt-2 border-t border-zinc-100">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-zinc-500 font-semibold">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-zinc-500 font-semibold">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Logged By</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 space-y-1">
                    <TrendingDown size={32} className="mx-auto text-zinc-300" />
                    <p className="font-bold text-zinc-700">No expenses recorded for this period</p>
                    <p className="text-[11px] text-zinc-400">Click "Log Expense" to record daily business overheads.</p>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => {
                  const meta = CATEGORY_METADATA[exp.category] || CATEGORY_METADATA.OTHER;
                  const Icon = meta.icon;

                  return (
                    <tr key={exp.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4 text-zinc-600 whitespace-nowrap">
                        {new Date(exp.expenseDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.bgColor} ${meta.color}`}>
                          <Icon size={12} />
                          <span>{meta.label}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-zinc-800 font-medium max-w-sm truncate">
                        {exp.description || '—'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-bold">
                          {exp.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-zinc-500">{exp.createdByName || 'System'}</td>

                      <td className="py-3 px-4 text-right font-black text-rose-600">
                        -{formatCurrency(exp.amount, currency)}
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Edit Expense"
                        >
                          <Edit2 size={14} />
                        </button>

                        {isOwner && (
                          <button
                            onClick={() => setDeletingExpense(exp)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Expense"
                          >
                            <Trash2 size={14} />
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

        {/* Pagination Strip */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>
              Showing page {page + 1} of {totalPages} ({totalElements} total expenses)
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                disabled={page <= 0}
                onClick={() => fetchExpenses(page - 1)}
                className="px-3 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => fetchExpenses(page + 1)}
                className="px-3 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {(isAddModalOpen || editingExpense) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-dropdown space-y-4 border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <TrendingDown size={16} />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">
                  {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingExpense(null);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:ring-1 focus:ring-emerald-600"
                  >
                    {Object.entries(CATEGORY_METADATA).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Payment Mode *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / Bank Transfer</option>
                    <option value="CARD">Card</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">
                    Amount ({currencySymbol}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly milk supply / Electrical wiring repair"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingExpense(null);
                  }}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingExpense ? 'Update Expense' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expense Confirmation Modal */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-dropdown space-y-4 border border-zinc-200">
            <div className="flex items-center space-x-2.5 text-rose-600">
              <Trash2 size={20} />
              <h3 className="text-base font-bold text-zinc-900">Delete Expense</h3>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to delete this expense of{' '}
              <strong className="text-zinc-900">{formatCurrency(deletingExpense.amount, currency)}</strong> (
              {deletingExpense.category})?
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingExpense(null)}
                className="px-4 py-2 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExpense}
                disabled={formSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {formSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
