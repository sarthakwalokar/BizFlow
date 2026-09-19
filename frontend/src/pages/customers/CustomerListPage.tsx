import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { customersApi, Customer, CustomerProfile, CustomerRequest } from '../../api/customers';
import { Order } from '../../api/billing';
import { InvoiceReceiptModal } from '../../components/billing/InvoiceReceiptModal';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { TableSkeleton, ButtonSpinner } from '../../components/common/LoadingStates';

export const CustomerListPage: React.FC = () => {
  const { t } = useTranslation();
  const { business, user } = useAuth();
  const isOwner = user?.role === 'OWNER';

  // Data states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [profileCustomer, setProfileCustomer] = useState<CustomerProfile | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  // Form states
  const [formData, setFormData] = useState<CustomerRequest>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currency = business?.currency || 'USD';

  const fetchCustomers = async (pageNumber = 0) => {
    try {
      setLoading(true);
      const res = await customersApi.getCustomers(search.trim() || undefined, pageNumber, 20);
      setCustomers(res.content);
      setPage(res.pageNumber);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      setErrorMessage(t('customers.failedToLoad', 'Failed to load customers directory.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(0);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(0);
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      phone: cust.phone || '',
      email: cust.email || '',
      address: cust.address || '',
      notes: cust.notes || '',
    });
  };

  const openProfileView = async (cust: Customer) => {
    try {
      const detail = await customersApi.getCustomerProfile(cust.id);
      setProfileCustomer(detail);
    } catch (err) {
      setErrorMessage(t('customers.historyLoadError', 'Could not load detailed customer history.'));
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setFormSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const created = await customersApi.createCustomer(formData);
      setSuccessMessage(t('customers.customerSaved', { name: created.name, defaultValue: `Customer "${created.name}" registered successfully.` }));
      setIsAddModalOpen(false);
      fetchCustomers(page);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t('customers.createFailed', 'Failed to create customer record.')
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !formData.name.trim()) return;

    setFormSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await customersApi.updateCustomer(editingCustomer.id, formData);
      setSuccessMessage(t('customers.customerUpdated', { name: updated.name, defaultValue: `Customer "${updated.name}" updated successfully.` }));
      setEditingCustomer(null);
      fetchCustomers(page);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t('customers.updateFailed', 'Failed to update customer record.')
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;

    setFormSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await customersApi.deleteCustomer(deletingCustomer.id);
      setSuccessMessage(t('customers.customerDeleted', { name: deletingCustomer.name, defaultValue: `Customer "${deletingCustomer.name}" removed.` }));
      setDeletingCustomer(null);
      fetchCustomers(page);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t('customers.deleteFailed', 'Failed to delete customer record.')
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
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">{t('customers.title')}</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t('customers.subtitle')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UserPlus size={16} />
          <span>{t('customers.addCustomer')}</span>
        </button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={15} className="text-brand-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-brand-700 hover:text-brand-900 cursor-pointer">
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

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-card">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            {t('common.search')}
          </button>
        </form>
      </div>

      {/* Customers Table */}
      {loading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4">{t('customers.customerName')}</th>
                  <th className="py-3 px-4">{t('common.phone')} / {t('common.email')}</th>
                  <th className="py-3 px-4">{t('customers.totalOrders')}</th>
                  <th className="py-3 px-4">{t('customers.totalSpent')}</th>
                  <th className="py-3 px-4">{t('customers.lastVisit')}</th>
                  <th className="py-3 px-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 space-y-1">
                      <Users size={32} className="mx-auto text-zinc-300" />
                      <p className="font-bold text-zinc-700">{t('customers.noCustomersFound')}</p>
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => {
                    const lastPurchaseStr = cust.lastPurchaseDate
                      ? new Date(cust.lastPurchaseDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—';

                    return (
                      <tr key={cust.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs">
                              {cust.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-zinc-900 block">{cust.name}</span>
                              {cust.notes && (
                                <span className="text-[10px] text-zinc-400 truncate max-w-xs block">
                                  {cust.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-zinc-600">
                          {cust.phone && (
                            <div className="flex items-center space-x-1.5 text-zinc-800 font-mono text-[11px]">
                              <Phone size={12} className="text-zinc-400" />
                              <span>{cust.phone}</span>
                            </div>
                          )}
                          {cust.email && (
                            <div className="flex items-center space-x-1.5 text-zinc-500 text-[11px] mt-0.5">
                              <Mail size={12} className="text-zinc-400" />
                              <span className="truncate max-w-[160px]">{cust.email}</span>
                            </div>
                          )}
                          {!cust.phone && !cust.email && <span className="text-zinc-400">—</span>}
                        </td>

                        <td className="py-3 px-4 text-zinc-700 font-semibold">
                          <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-bold">
                            {cust.orderCount ?? 0}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-black text-zinc-950">
                          {formatCurrency(cust.totalSpending ?? 0, currency)}
                        </td>

                        <td className="py-3 px-4 text-zinc-500 whitespace-nowrap">
                          {lastPurchaseStr}
                        </td>

                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => openProfileView(cust)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                            title={t('customers.viewProfile', 'View Ledger & Purchase History')}
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => openEditModal(cust)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                            title={t('customers.editCustomer')}
                          >
                            <Edit2 size={14} />
                          </button>

                          {isOwner && (
                            <button
                              onClick={() => setDeletingCustomer(cust)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title={t('customers.deleteCustomer')}
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
                {t('common.showingOf', { from: page + 1, to: totalPages, total: totalElements })}
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  disabled={page <= 0}
                  onClick={() => fetchCustomers(page - 1)}
                  className="px-3 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {t('common.previous')}
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => fetchCustomers(page + 1)}
                  className="px-3 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {t('common.next')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer Detail & Purchase History Modal */}
      {profileCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-dropdown space-y-5 border border-zinc-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  {profileCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">{profileCustomer.name}</h3>
                  <p className="text-xs text-zinc-500">
                    {t('customers.customerDirectory', 'Customer')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProfileCustomer(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile KPI Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{t('customers.totalSpent')}</span>
                <div className="text-lg font-black text-zinc-900 mt-0.5">
                  {formatCurrency(profileCustomer.totalSpending, currency)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{t('customers.totalOrders')}</span>
                <div className="text-lg font-black text-zinc-900 mt-0.5">
                  {profileCustomer.orderCount}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{t('dashboard.avgOrderValue')}</span>
                <div className="text-lg font-black text-zinc-900 mt-0.5">
                  {formatCurrency(profileCustomer.averageOrderValue, currency)}
                </div>
              </div>
            </div>

            {/* Recent Bills Ledger */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">{t('orders.title')}</h4>
              <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-500 uppercase">
                    <tr>
                      <th className="py-2 px-3">{t('receipt.invoiceNo')}</th>
                      <th className="py-2 px-3">{t('common.date')}</th>
                      <th className="py-2 px-3">{t('billing.paymentMethod')}</th>
                      <th className="py-2 px-3">{t('common.amount')}</th>
                      <th className="py-2 px-3 text-right">{t('common.view')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {!profileCustomer.purchaseHistory || profileCustomer.purchaseHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-zinc-400">
                          {t('common.noDataFound')}
                        </td>
                      </tr>
                    ) : (
                      profileCustomer.purchaseHistory.map((order: Order) => (
                        <tr key={order.id} className="hover:bg-zinc-50/70">
                          <td className="py-2 px-3 font-mono font-bold text-zinc-900">{order.invoiceNumber}</td>
                          <td className="py-2 px-3 text-zinc-500">
                            {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded bg-zinc-100 text-[10px] font-bold">{order.paymentMethod}</span>
                          </td>
                          <td className="py-2 px-3 font-bold text-zinc-900">{formatCurrency(order.total, currency)}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => setSelectedOrderForReceipt(order)}
                              className="p-1 text-zinc-400 hover:text-emerald-600 cursor-pointer"
                              title={t('billing.printReceipt')}
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setProfileCustomer(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Form Modal */}
      {(isAddModalOpen || editingCustomer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-dropdown space-y-4 border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                  <UserPlus size={16} />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">
                  {editingCustomer ? t('customers.editCustomer') : t('customers.addCustomer')}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCustomer(null);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">
                  {t('customers.customerName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:ring-1 focus:ring-brand-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">{t('common.phone')}</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:ring-1 focus:ring-brand-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">{t('common.email')}</label>
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:ring-1 focus:ring-brand-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">{t('common.address')}</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 4, HSR Layout"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:ring-1 focus:ring-brand-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">{t('common.notes')}</label>
                <textarea
                  rows={2}
                  placeholder="Preferences, notes, loyalty tier, etc."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:ring-1 focus:ring-brand-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl hover:bg-zinc-50 cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {formSubmitting ? (
                    <ButtonSpinner text={t('common.saving')} />
                  ) : editingCustomer ? (
                    t('common.save')
                  ) : (
                    t('customers.addCustomer')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-dropdown space-y-4 border border-zinc-200">
            <div className="flex items-center space-x-2.5 text-rose-600">
              <Trash2 size={20} />
              <h3 className="text-base font-bold text-zinc-900">{t('customers.deleteCustomer')}</h3>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              {t('customers.confirmDelete')}
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-2 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                disabled={formSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {formSubmitting ? <ButtonSpinner text={t('common.deleting')} /> : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

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
