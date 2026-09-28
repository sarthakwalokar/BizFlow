import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi, AdminBusinessDetail } from '../../api/admin';
import { Business, BusinessType } from '../../api/auth';
import { ButtonSpinner, TableSkeleton } from '../../components/common/LoadingStates';
import {
  Building2,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Users,
  Package,
  Receipt,
  Star,
  AlertTriangle,
  Briefcase,
  Store,
  Utensils,
  Coffee,
  Cake,
  Scissors,
  Wrench,
  Building
} from 'lucide-react';

export const AdminBusinessesPage: React.FC = () => {
  const { t } = useTranslation();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Tenant Details Modal
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [businessDetail, setBusinessDetail] = useState<AdminBusinessDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Status Confirmation Modal
  const [confirmBusiness, setConfirmBusiness] = useState<Business | AdminBusinessDetail | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.searchBusinesses({
        search: search.trim() || undefined,
        businessType: selectedType !== 'ALL' ? selectedType : undefined,
        active: selectedStatus === 'ACTIVE' ? true : selectedStatus === 'INACTIVE' ? false : undefined,
        page,
        size: 15,
      });
      setBusinesses(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      console.error('Failed to load businesses', err);
      setError('Failed to fetch platform businesses list from backend database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [page, selectedType, selectedStatus]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchBusinesses();
  };

  const executeToggleStatus = async () => {
    if (!confirmBusiness) return;
    const target = confirmBusiness;
    const nextStatus = !target.active;

    setUpdatingId(target.id);
    try {
      const updated = await adminApi.updateBusinessStatus(target.id, nextStatus);
      setBusinesses((prev) => prev.map((b) => (b.id === target.id ? { ...b, active: updated.active } : b)));
      if (businessDetail && businessDetail.id === target.id) {
        setBusinessDetail((prev) => (prev ? { ...prev, active: updated.active } : null));
      }
      showToast(`Business "${updated.name}" has been ${updated.active ? 'activated' : 'deactivated'} successfully.`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update business status');
    } finally {
      setUpdatingId(null);
      setConfirmBusiness(null);
    }
  };

  const handleViewDetail = async (id: number) => {
    setSelectedBusinessId(id);
    setLoadingDetail(true);
    try {
      const detail = await adminApi.getBusinessDetails(id);
      setBusinessDetail(detail);
    } catch (err) {
      console.error('Failed to load business details', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setSelectedBusinessId(null);
    setBusinessDetail(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RETAIL':
        return <Store size={14} className="text-brand-600" />;
      case 'RESTAURANT':
        return <Utensils size={14} className="text-amber-600" />;
      case 'CAFE':
        return <Coffee size={14} className="text-amber-700" />;
      case 'BAKERY':
        return <Cake size={14} className="text-pink-600" />;
      case 'SALON':
        return <Scissors size={14} className="text-brand-600" />;
      case 'SERVICE':
        return <Wrench size={14} className="text-emerald-600" />;
      default:
        return <Building size={14} className="text-zinc-500" />;
    }
  };

  const businessTypes: { type: BusinessType; label: string }[] = [
    { type: 'RETAIL', label: 'Retail Store' },
    { type: 'RESTAURANT', label: 'Restaurant' },
    { type: 'CAFE', label: 'Café & Beverage' },
    { type: 'BAKERY', label: 'Artisan Bakery' },
    { type: 'SALON', label: 'Salon & Spa' },
    { type: 'SERVICE', label: 'Services' },
    { type: 'OTHER', label: 'Other Business' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Tenants & Businesses Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
              {totalElements} Registered Businesses
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Monitor, inspect, and manage tenant organizations, tier allocations, and business settings.
          </p>
        </div>

        <button
          onClick={fetchBusinesses}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-brand-600' : 'text-zinc-400'} />
          <span>{t('common.refresh', 'Refresh')}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-rose-900">Unable to load businesses data</p>
              <p className="text-rose-700 text-[11px]">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchBusinesses}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Toolbar Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by business name, city, email, or phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all"
            />
          </div>

          {/* Business Type Filter */}
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
            <span className="text-[11px] font-bold text-zinc-500">{t('common.type', 'Type')}:</span>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(0);
              }}
              className="bg-transparent text-xs font-bold text-zinc-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Business Types</option>
              {businessTypes.map((bt) => (
                <option key={bt.type} value={bt.type}>
                  {bt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
            <span className="text-[11px] font-bold text-zinc-500">{t('common.status', 'Status')}:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(0);
              }}
              className="bg-transparent text-xs font-bold text-zinc-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            {t('common.apply', 'Filter')}
          </button>
        </form>
      </div>

      {/* Tenants Table Grid */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-5 py-3.5">Tenant Organization</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Primary Owner</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5">Created</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <TableSkeleton rows={6} cols={7} />
                  </td>
                </tr>
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-zinc-400 space-y-2">
                    <Building2 size={32} className="mx-auto text-zinc-300 mb-2" />
                    <p className="font-bold text-zinc-800 text-sm">No businesses matched your criteria</p>
                    <p className="text-xs text-zinc-400">Try adjusting your search keywords or business type filters.</p>
                  </td>
                </tr>
              ) : (
                businesses.map((biz) => {
                  const isUpdating = updatingId === biz.id;

                  return (
                    <tr key={biz.id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Name & ID */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
                            {biz.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 text-xs">{biz.name}</span>
                            <span className="text-[11px] text-zinc-400 block font-mono">
                              Tenant #{biz.id} • {biz.currency || 'INR'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Business Type */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {getTypeIcon(biz.businessType)}
                          <span>{biz.businessType}</span>
                        </span>
                      </td>

                      {/* Primary Owner */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-zinc-900">{biz.ownerName || '—'}</span>
                        <span className="text-[10px] text-zinc-400 block truncate max-w-[150px]">{biz.ownerEmail || biz.email}</span>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="text-zinc-700 font-mono">{biz.phone || '—'}</div>
                          <div className="text-zinc-400 truncate max-w-[160px]">{biz.address || '—'}</div>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-4 py-3.5 text-zinc-500 font-mono text-[11px]">
                        {biz.createdAt ? new Date(biz.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            biz.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                          }`}
                        >
                          {biz.active ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                          <span>{biz.active ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            onClick={() => handleViewDetail(biz.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                            title="View Full Business Profile"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Toggle Status */}
                          <button
                            onClick={() => setConfirmBusiness(biz)}
                            disabled={isUpdating}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              biz.active
                                ? 'bg-white hover:bg-rose-50 text-rose-700 border-zinc-200 hover:border-rose-200'
                                : 'bg-white hover:bg-emerald-50 text-emerald-700 border-zinc-200 hover:border-emerald-200'
                            }`}
                          >
                            {isUpdating ? <RefreshCw size={12} className="animate-spin" /> : biz.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>
              Showing Page {page + 1} of {totalPages} ({totalElements} total registered businesses)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={page === 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 disabled:opacity-40 font-bold cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                disabled={page >= totalPages - 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 disabled:opacity-40 font-bold cursor-pointer transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TENANT BUSINESS DETAIL MODAL */}
      {selectedBusinessId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-2xl overflow-hidden my-8 animate-in zoom-in-95">
            {loadingDetail || !businessDetail ? (
              <div className="p-12 text-center space-y-3">
                <ButtonSpinner size="md" className="mx-auto text-brand-600" />
                <p className="text-xs font-bold text-zinc-600">Loading comprehensive tenant profile...</p>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-black text-lg border border-brand-200">
                      {businessDetail.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-zinc-900">{businessDetail.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {getTypeIcon(businessDetail.businessType)}
                          <span>{businessDetail.businessType}</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">ID #{businessDetail.id}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          businessDetail.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}>
                          {businessDetail.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={closeModal}
                    className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
                  {/* Entity Counters (Staff, Products, Orders, Customers) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-[10px] font-bold uppercase">Staff Team</span>
                        <Users size={14} className="text-brand-600" />
                      </div>
                      <p className="text-xl font-black text-zinc-900">{businessDetail.staffCount}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-[10px] font-bold uppercase">Catalog Items</span>
                        <Package size={14} className="text-amber-600" />
                      </div>
                      <p className="text-xl font-black text-zinc-900">{businessDetail.productCount}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-[10px] font-bold uppercase">Customers</span>
                        <Users size={14} className="text-cyan-600" />
                      </div>
                      <p className="text-xl font-black text-zinc-900">{businessDetail.customerCount}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-[10px] font-bold uppercase">Invoices/Bills</span>
                        <Receipt size={14} className="text-emerald-600" />
                      </div>
                      <p className="text-xl font-black text-zinc-900">{businessDetail.orderCount}</p>
                    </div>
                  </div>

                  {/* Owner Profile Card */}
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase size={12} className="text-amber-700" /> Primary Business Owner
                    </span>
                    {businessDetail.owner ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                        <div>
                          <span className="text-zinc-400 text-[10px] block">Full Name</span>
                          <span className="font-bold text-zinc-900">{businessDetail.owner.fullName}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 text-[10px] block">Email Address</span>
                          <span className="font-bold text-zinc-900 font-mono text-[11px] truncate block">{businessDetail.owner.email}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 text-[10px] block">Phone / Mobile</span>
                          <span className="font-bold text-zinc-900 font-mono">{businessDetail.owner.phone || '—'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-zinc-500 italic">No registered owner account currently bound to this tenant.</p>
                    )}
                  </div>

                  {/* Business Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Location & Contact
                      </span>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-start gap-2">
                          <MapPin size={13} className="text-zinc-400 shrink-0 mt-0.5" />
                          <span className="text-zinc-700">{businessDetail.address || 'Address not registered'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-zinc-400 shrink-0" />
                          <span className="text-zinc-700 font-mono">{businessDetail.phone || 'Phone not registered'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-zinc-400 shrink-0" />
                          <span className="text-zinc-700 font-mono">{businessDetail.email || 'Email not registered'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Financial & Regional Configuration
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-zinc-400 text-[10px] block">Currency</span>
                          <span className="font-bold text-zinc-900">{businessDetail.currency}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 text-[10px] block">Timezone</span>
                          <span className="font-bold text-zinc-900 font-mono text-[10px] truncate block">{businessDetail.timezone}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 text-[10px] block">Tax Scheme</span>
                          <span className="font-bold text-zinc-900">{businessDetail.taxName} ({businessDetail.taxRate}%)</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 text-[10px] block">Tax Number</span>
                          <span className="font-bold text-zinc-900 font-mono text-[10px]">{businessDetail.taxNumber || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Public Review URL & Timestamp */}
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                        <Star size={11} className="text-amber-500" /> Public Feedback Link
                      </span>
                      <p className="font-mono text-zinc-700">{businessDetail.publicReviewUrl || `/review/${businessDetail.reviewSlug}`}</p>
                    </div>

                    <div className="text-right text-zinc-400 font-mono text-[10px]">
                      <span>Registered: {new Date(businessDetail.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setConfirmBusiness(businessDetail);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      businessDetail.active
                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {businessDetail.active ? 'Deactivate Business Tenant' : 'Activate Business Tenant'}
                  </button>

                  <button
                    onClick={closeModal}
                    className="px-5 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* BUSINESS STATUS TOGGLE CONFIRMATION DIALOG */}
      {confirmBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                confirmBusiness.active ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  {confirmBusiness.active ? 'Deactivate Business Tenant' : 'Activate Business Tenant'}
                </h3>
                <p className="text-xs text-zinc-500 font-medium">Please confirm this action</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to <strong>{confirmBusiness.active ? 'deactivate' : 'activate'}</strong> tenant organization{' '}
              <span className="font-bold text-zinc-900">"{confirmBusiness.name}"</span>?
              {confirmBusiness.active
                ? ' Deactivating will suspend POS billing, new orders, inventory tracking, and staff access for this store.'
                : ' Activating will immediately restore full platform operations for this tenant.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmBusiness(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={executeToggleStatus}
                disabled={updatingId !== null}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5 ${
                  confirmBusiness.active ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {updatingId ? <RefreshCw size={13} className="animate-spin" /> : null}
                <span>Confirm {confirmBusiness.active ? 'Deactivation' : 'Activation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
