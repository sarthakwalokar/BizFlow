import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const AdminBusinessesPage: React.FC = () => {
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

  // Status Updating State
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const res = await adminApi.searchBusinesses({
        search: search || undefined,
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [page, selectedType, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchBusinesses();
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    setUpdatingId(id);
    try {
      const updated = await adminApi.updateBusinessStatus(id, !currentStatus);
      setBusinesses((prev) => prev.map((b) => (b.id === id ? updated : b)));
      if (businessDetail && businessDetail.id === id) {
        setBusinessDetail((prev) => (prev ? { ...prev, active: !currentStatus } : null));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update business status');
    } finally {
      setUpdatingId(null);
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

  const businessTypes: { type: BusinessType; label: string }[] = [
    { type: 'RETAIL', label: 'Retail' },
    { type: 'RESTAURANT', label: 'Restaurant' },
    { type: 'CAFE', label: 'Café' },
    { type: 'BAKERY', label: 'Bakery' },
    { type: 'SALON', label: 'Salon' },
    { type: 'SERVICE', label: 'Service' },
    { type: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Tenants & Businesses</h1>
            <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-200">
              {totalElements} Registered
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Search, inspect tenant metadata, configure scale tiers, and activate or suspend accounts.
          </p>
        </div>

        <button
          onClick={fetchBusinesses}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-medium shadow-xs transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-brand-600' : 'text-zinc-400'} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by business name, email, or phone..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white"
            />
          </div>

          {/* Business Type Filter */}
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5">
            <span className="text-[11px] font-medium text-zinc-500">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(0);
              }}
              className="bg-transparent text-xs font-medium text-zinc-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Types</option>
              {businessTypes.map((bt) => (
                <option key={bt.type} value={bt.type}>
                  {bt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5">
            <span className="text-[11px] font-medium text-zinc-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(0);
              }}
              className="bg-transparent text-xs font-medium text-zinc-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Tenants Table Grid */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3">Tenant Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <TableSkeleton rows={5} cols={6} />
                  </td>
                </tr>
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-400 space-y-1">
                    <Building2 size={28} className="mx-auto text-zinc-300 mb-2" />
                    <p className="font-medium text-zinc-700">No businesses found</p>
                    <p className="text-[11px] text-zinc-400">Try adjusting your search terms or filters.</p>
                  </td>
                </tr>
              ) : (
                businesses.map((biz) => {
                  const isUpdating = updatingId === biz.id;

                  return (
                    <tr key={biz.id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Name & ID */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
                            {biz.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-zinc-900 text-xs">{biz.name}</span>
                            <span className="text-[11px] text-zinc-400 block font-mono">
                              ID #{biz.id} • {biz.currency || 'USD'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Business Type */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {biz.businessType}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="text-zinc-700 font-medium truncate max-w-[180px]">
                            {biz.email || '—'}
                          </div>
                          <div className="text-zinc-400 font-mono">{biz.phone || '—'}</div>
                        </div>
                      </td>

                      {/* Business Tier */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            biz.businessSize === 'LARGE'
                              ? 'bg-brand-50 text-brand-700 border border-brand-200'
                              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}
                        >
                          {biz.businessSize || 'SMALL'}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(biz.id, biz.active)}
                          disabled={isUpdating}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                            biz.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                          }`}
                        >
                          {isUpdating ? (
                            <RefreshCw size={11} className="animate-spin" />
                          ) : biz.active ? (
                            <CheckCircle2 size={11} />
                          ) : (
                            <XCircle size={11} />
                          )}
                          <span>{biz.active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewDetail(biz.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
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
          <div className="px-4 py-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>
              Showing Page {page + 1} of {totalPages} ({totalElements} tenants)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={page === 0}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 disabled:opacity-40 font-medium cursor-pointer"
              >
                <ChevronLeft size={13} />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                disabled={page >= totalPages - 1}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 disabled:opacity-40 font-medium cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tenant Detail Inspection Modal */}
      {selectedBusinessId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-sm">
                  <Building2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">{businessDetail?.name || 'Tenant Profile'}</h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    ID #{selectedBusinessId} • {businessDetail?.businessType}
                  </span>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-12 text-center text-xs text-zinc-400">Loading tenant details...</div>
            ) : businessDetail ? (
              <div className="space-y-5">
                {/* Aggregate Entity Metrics */}
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-center">
                    <span className="text-[10px] font-medium text-zinc-500 uppercase">Staff</span>
                    <div className="text-base font-bold text-zinc-900 mt-0.5">{businessDetail.staffCount}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-center">
                    <span className="text-[10px] font-medium text-zinc-500 uppercase">Products</span>
                    <div className="text-base font-bold text-zinc-900 mt-0.5">{businessDetail.productCount}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-center">
                    <span className="text-[10px] font-medium text-zinc-500 uppercase">Customers</span>
                    <div className="text-base font-bold text-zinc-900 mt-0.5">{businessDetail.customerCount}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-center">
                    <span className="text-[10px] font-medium text-zinc-500 uppercase">Orders</span>
                    <div className="text-base font-bold text-zinc-900 mt-0.5">{businessDetail.orderCount}</div>
                  </div>
                </div>

                {/* Owner Info Card */}
                {businessDetail.owner && (
                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1.5">
                    <div className="text-xs font-semibold text-purple-800 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-purple-600" />
                      <span>Primary Owner Account</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Full Name</span>
                        <span className="font-medium text-zinc-900">{businessDetail.owner.fullName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Email</span>
                        <span className="font-medium text-zinc-900">{businessDetail.owner.email}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuration Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-400 text-[10px] block">Currency</span>
                    <span className="font-medium text-zinc-800">{businessDetail.currency}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-400 text-[10px] block">Timezone</span>
                    <span className="font-medium text-zinc-800">{businessDetail.timezone}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-400 text-[10px] block">Tier Size</span>
                    <span className="font-medium text-brand-700">{businessDetail.businessSize}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-400 text-[10px] block">Tax Config</span>
                    <span className="font-medium text-zinc-800">
                      {businessDetail.taxName} ({businessDetail.taxRate}%)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-400 text-[10px] block">Inventory</span>
                    <span className="font-medium text-zinc-800">
                      {businessDetail.inventoryEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-400 text-[10px] block">Review Boost</span>
                    <span className="font-medium text-zinc-800">
                      {businessDetail.reviewEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Status Toggle Action */}
                <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-zinc-500">Status:</span>
                    <span
                      className={`text-xs font-semibold ${
                        businessDetail.active ? 'text-emerald-700' : 'text-zinc-500'
                      }`}
                    >
                      {businessDetail.active ? 'Active' : 'Suspended'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(businessDetail.id, businessDetail.active)}
                    disabled={updatingId === businessDetail.id}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                      businessDetail.active
                        ? 'bg-zinc-100 border border-zinc-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200'
                        : 'bg-brand-600 text-white hover:bg-brand-700 shadow-xs'
                    }`}
                  >
                    {updatingId === businessDetail.id && <ButtonSpinner size="xs" />}
                    <span>{businessDetail.active ? 'Deactivate Business' : 'Activate Business'}</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

