import React, { useState, useEffect } from 'react';
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
  MapPin,
  DollarSign,
  ShoppingBag,
  Clock,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currency';

export const CustomerListPage: React.FC = () => {
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
  const [profileLoading, setProfileLoading] = useState(false);
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

  const currency = business?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(currency);

  const fetchCustomers = async (pageNumber = 0) => {
    try {
      setLoading(true);
      const res = await customersApi.getCustomers(search.trim() || undefined, pageNumber, 20);
      setCustomers(res.content);
      setPage(res.pageNumber);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      setErrorMessage('Failed to load customer directory.');
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
    setFormData({ name: '', phone: '', email: '', address: '', notes: '' });
    setIsAddModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      notes: c.notes || '',
    });
  };

  const openProfileDrawer = async (c: Customer) => {
    try {
      setProfileLoading(true);
      setProfileCustomer(null);
      const profile = await customersApi.getCustomerProfile(c.id);
      setProfileCustomer(profile);
    } catch (err: any) {
      setErrorMessage('Failed to load customer profile and purchase history.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setFormSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      if (editingCustomer) {
        await customersApi.updateCustomer(editingCustomer.id, formData);
        setSuccessMessage(`Customer "${formData.name}" updated successfully.`);
        setEditingCustomer(null);
      } else {
        await customersApi.createCustomer(formData);
        setSuccessMessage(`Customer "${formData.name}" created successfully.`);
        setIsAddModalOpen(false);
      }
      fetchCustomers(page);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to save customer record.'
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    setFormSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await customersApi.deleteCustomer(deletingCustomer.id);
      setSuccessMessage(`Customer "${deletingCustomer.name}" deleted successfully.`);
      setDeletingCustomer(null);
      fetchCustomers(page);
    } catch (err: any) {
      setErrorMessage('Failed to delete customer.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // High-level CRM aggregates
  const totalLifetimeSpending = customers.reduce((sum, c) => sum + (c.totalSpending || 0), 0);
  const activeBuyersCount = customers.filter((c) => (c.orderCount || 0) > 0).length;
  const avgCustomerValue = totalElements > 0 ? totalLifetimeSpending / totalElements : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Directory &amp; CRM</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your client profiles, track order history, lifetime value, and purchase frequency.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition-all cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Add Customer</span>
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

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Clients</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{totalElements}</div>
          <span className="text-[11px] text-slate-400">Registered customers</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active Buyers</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2">{activeBuyersCount}</div>
          <span className="text-[11px] text-emerald-600">With 1+ completed orders</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Tracked Spending</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-700 mt-2">
            {totalLifetimeSpending.toFixed(2)} {currencySymbol}
          </div>
          <span className="text-[11px] text-purple-600">Across current page clients</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Avg Client Value</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-700 mt-2">
            {avgCustomerValue.toFixed(2)} {currencySymbol}
          </div>
          <span className="text-[11px] text-blue-600">Revenue per customer</span>
        </div>
      </div>

      {/* Customer Directory Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-20 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold"
            >
              Search
            </button>
          </form>

          <span className="text-xs font-semibold text-slate-500">
            Showing {customers.length} of {totalElements} clients
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                <th className="pb-3">Customer Name</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3 text-center">Orders</th>
                <th className="pb-3">Total Spent</th>
                <th className="pb-3">Last Purchase</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Loading customer records...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 space-y-2">
                    <Users size={32} className="mx-auto text-slate-300" />
                    <p className="font-bold text-slate-700">No customers found</p>
                    <p className="text-[11px] text-slate-400">
                      Add your first customer to track their sales and purchase history.
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {c.name}
                      </div>
                      {c.address && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="shrink-0 text-slate-300" />
                          <span>{c.address}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="text-slate-700 font-medium">
                        {c.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-slate-400" />
                            <span>{c.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No phone</span>
                        )}
                      </div>
                      {c.email && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Mail size={12} className="text-slate-300" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        {c.orderCount || 0}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 font-bold text-slate-900">
                      {(c.totalSpending || 0).toFixed(2)} {currencySymbol}
                    </td>
                    <td className="py-3.5 pr-4 text-slate-500 text-[11px]">
                      {c.lastPurchaseDate ? (
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" />
                          <span>{new Date(c.lastPurchaseDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Never</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Profile & History */}
                        <button
                          onClick={() => openProfileDrawer(c)}
                          title="View Profile & Purchase History"
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(c)}
                          title="Edit Customer"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        {/* Delete (Owner only) */}
                        {isOwner && (
                          <button
                            onClick={() => setDeletingCustomer(c)}
                            title="Delete Customer"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
                onClick={() => fetchCustomers(page - 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => fetchCustomers(page + 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Profile & Purchase History Modal / Drawer */}
      {(profileLoading || profileCustomer) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {profileLoading ? (
              <div className="p-12 text-center text-slate-400 font-medium">
                Loading profile and purchase history...
              </div>
            ) : profileCustomer ? (
              <>
                {/* Modal Header */}
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center font-black text-indigo-200">
                        {profileCustomer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-lg font-black">{profileCustomer.name}</h2>
                        <span className="text-xs text-slate-400">Client ID #{profileCustomer.id}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileCustomer(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                  {/* KPI Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                        Lifetime Spend
                      </span>
                      <div className="text-xl font-black text-indigo-900 mt-1">
                        {profileCustomer.totalSpending.toFixed(2)} {currencySymbol}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                        Total Orders
                      </span>
                      <div className="text-xl font-black text-emerald-900 mt-1">
                        {profileCustomer.orderCount}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                      <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">
                        Avg Basket Size
                      </span>
                      <div className="text-xl font-black text-purple-900 mt-1">
                        {profileCustomer.averageOrderValue.toFixed(2)} {currencySymbol}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Last Purchase
                      </span>
                      <div className="text-sm font-black text-slate-800 mt-1.5">
                        {profileCustomer.lastPurchaseDate
                          ? new Date(profileCustomer.lastPurchaseDate).toLocaleDateString()
                          : 'No orders yet'}
                      </div>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Phone</span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {profileCustomer.phone || '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Email</span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {profileCustomer.email || '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Address</span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {profileCustomer.address || '—'}
                      </p>
                    </div>
                    {profileCustomer.notes && (
                      <div className="sm:col-span-3 pt-2 border-t border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Notes / Preferences</span>
                        <p className="font-medium text-slate-700 mt-0.5">{profileCustomer.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Purchase History Table */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Receipt size={16} className="text-indigo-600" />
                      <span>Purchase History ({profileCustomer.purchaseHistory.length} orders)</span>
                    </h3>

                    {profileCustomer.purchaseHistory.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
                        No transactions recorded for this customer yet.
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-4">Invoice #</th>
                              <th className="py-2.5 px-4">Date</th>
                              <th className="py-2.5 px-4">Items Summary</th>
                              <th className="py-2.5 px-4">Method</th>
                              <th className="py-2.5 px-4">Amount</th>
                              <th className="py-2.5 px-4">Status</th>
                              <th className="py-2.5 px-4 text-right">Receipt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {profileCustomer.purchaseHistory.map((ord) => (
                              <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4 font-bold text-indigo-600">
                                  {ord.invoiceNumber}
                                </td>
                                <td className="py-3 px-4 text-slate-500 text-[11px]">
                                  {new Date(ord.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                                  {ord.items.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-[10px] text-slate-700">
                                    {ord.paymentMethod}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-black text-slate-900">
                                  {ord.total.toFixed(2)} {ord.currency}
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      ord.orderStatus === 'CANCELLED'
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                        : ord.paymentStatus === 'COMPLETED'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}
                                  >
                                    {ord.orderStatus === 'CANCELLED' ? 'CANCELLED' : ord.paymentStatus}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => setSelectedOrderForReceipt(ord)}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px]"
                                  >
                                    View Receipt
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setProfileCustomer(null)}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                  >
                    Close Profile
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {(isAddModalOpen || editingCustomer) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">
                {editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCustomer(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe, Alpha Corp"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 555-0199"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Billing / Delivery Address</label>
                <input
                  type="text"
                  placeholder="Street address, city, postal code"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Preferences</label>
                <textarea
                  rows={2}
                  placeholder="VIP client, prefers UPI, allergies, special requests..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCustomer(null);
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
                  {formSubmitting ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Delete Customer "{deletingCustomer.name}"?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this customer? Past invoices and orders will be preserved with transaction history intact.
              </p>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                disabled={formSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                {formSubmitting ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedOrderForReceipt && (
        <InvoiceReceiptModal
          order={selectedOrderForReceipt}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}
    </div>
  );
};
