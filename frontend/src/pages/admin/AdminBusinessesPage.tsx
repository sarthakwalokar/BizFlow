import React, { useState, useEffect } from 'react';
import { adminApi, AdminBusinessDetail } from '../../api/admin';
import { Business, BusinessType } from '../../api/auth';
import {
  Building2,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  ShieldCheck,
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Tenants & Businesses</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              {totalElements} Registered
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Search, inspect tenant metadata, configure tier features, and manage active status.
          </p>
        </div>

        <button
          onClick={fetchBusinesses}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-purple-400' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by business name, email, or phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
            />
          </div>

          {/* Business Type Filter */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-slate-400">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(0);
              }}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">
                All Types
              </option>
              {businessTypes.map((bt) => (
                <option key={bt.type} value={bt.type} className="bg-slate-900 text-slate-200">
                  {bt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(0);
              }}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">
                All Statuses
              </option>
              <option value="ACTIVE" className="bg-slate-900 text-slate-200">
                Active Only
              </option>
              <option value="INACTIVE" className="bg-slate-900 text-slate-200">
                Inactive Only
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Tenants Table Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-5 py-4">Tenant Name</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Tier</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Loading tenants directory...
                  </td>
                </tr>
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 space-y-1">
                    <Building2 size={32} className="mx-auto text-slate-600" />
                    <p className="font-semibold text-slate-300">No businesses found</p>
                    <p className="text-[11px] text-slate-500">Try adjusting your search terms or filters.</p>
                  </td>
                </tr>
              ) : (
                businesses.map((biz) => {
                  const isUpdating = updatingId === biz.id;

                  return (
                    <tr key={biz.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-300 font-black text-xs shrink-0">
                            {biz.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white text-xs">{biz.name}</span>
                            <span className="text-[10px] text-slate-500 block font-mono">
                              Tenant #{biz.id} • {biz.currency || 'INR'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Business Type */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700/60">
                          {biz.businessType}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="text-slate-300 font-medium truncate max-w-[180px]">
                            {biz.email || '—'}
                          </div>
                          <div className="text-slate-500 font-mono">{biz.phone || '—'}</div>
                        </div>
                      </td>

                      {/* Business Tier */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            biz.businessSize === 'LARGE'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                              : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                          }`}
                        >
                          {biz.businessSize || 'SMALL'}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(biz.id, biz.active)}
                          disabled={isUpdating}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            biz.active
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                        >
                          {isUpdating ? (
                            <RefreshCw size={11} className="animate-spin" />
                          ) : biz.active ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          <span>{biz.active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleViewDetail(biz.id)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Eye size={13} />
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
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing Page {page + 1} of {totalPages} ({totalElements} tenants)
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 font-bold cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 font-bold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tenant Detail Inspection Modal */}
      {selectedBusinessId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-900/40 border border-purple-800/60 flex items-center justify-center text-purple-300 font-bold text-sm">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{businessDetail?.name || 'Tenant Profile'}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Tenant ID #{selectedBusinessId} • {businessDetail?.businessType}
                  </span>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading tenant details...</div>
            ) : businessDetail ? (
              <div className="space-y-6">
                {/* Aggregate Entity Metrics */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Staff</span>
                    <div className="text-lg font-black text-white">{businessDetail.staffCount}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Products</span>
                    <div className="text-lg font-black text-white">{businessDetail.productCount}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Customers</span>
                    <div className="text-lg font-black text-white">{businessDetail.customerCount}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Orders</span>
                    <div className="text-lg font-black text-white">{businessDetail.orderCount}</div>
                  </div>
                </div>

                {/* Owner Info Card */}
                {businessDetail.owner && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <ShieldCheck size={14} />
                      <span>Primary Owner Account</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Full Name</span>
                        <span className="font-bold text-slate-200">{businessDetail.owner.fullName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Email</span>
                        <span className="font-bold text-slate-200">{businessDetail.owner.email}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuration Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Currency</span>
                    <span className="font-bold text-slate-200">{businessDetail.currency}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Timezone</span>
                    <span className="font-bold text-slate-200">{businessDetail.timezone}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Tier Size</span>
                    <span className="font-bold text-purple-300">{businessDetail.businessSize}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Tax Config</span>
                    <span className="font-bold text-slate-200">
                      {businessDetail.taxName} ({businessDetail.taxRate}%)
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Inventory</span>
                    <span className="font-bold text-slate-200">
                      {businessDetail.inventoryEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Review Boost</span>
                    <span className="font-bold text-slate-200">
                      {businessDetail.reviewEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Status Toggle Action */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Current Status:</span>
                    <span
                      className={`text-xs font-bold ${
                        businessDetail.active ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {businessDetail.active ? 'Active & Operational' : 'Deactivated / Suspended'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(businessDetail.id, businessDetail.active)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      businessDetail.active
                        ? 'bg-rose-950/60 border border-rose-800/60 text-rose-300 hover:bg-rose-900/60'
                        : 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60'
                    }`}
                  >
                    {businessDetail.active ? 'Deactivate Business' : 'Activate Business'}
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
