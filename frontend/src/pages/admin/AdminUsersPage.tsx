import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin';
import { User, Role } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { TableSkeleton } from '../../components/common/LoadingStates';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldAlert,
  Briefcase,
  UserCheck,
  Building2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // User Details Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Status Confirmation Modal
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.searchUsers({
        search: search.trim() || undefined,
        role: selectedRole !== 'ALL' ? selectedRole : undefined,
        enabled: selectedStatus === 'ENABLED' ? true : selectedStatus === 'DISABLED' ? false : undefined,
        page,
        size: 15,
      });
      setUsers(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      console.error('Failed to load users', err);
      setError('Failed to fetch platform users list from backend database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, selectedRole, selectedStatus]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const executeToggleUserStatus = async () => {
    if (!confirmUser) return;
    const targetUser = confirmUser;

    if (targetUser.id === currentUser?.id) {
      alert('You cannot deactivate your own root platform administrator account.');
      setConfirmUser(null);
      return;
    }
    if (targetUser.role === 'ADMIN' && targetUser.enabled) {
      alert('Platform Administrators cannot be deactivated.');
      setConfirmUser(null);
      return;
    }

    setUpdatingId(targetUser.id);
    try {
      const updated = await adminApi.updateUserStatus(targetUser.id, !targetUser.enabled);
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? updated : u)));
      if (selectedUser && selectedUser.id === targetUser.id) {
        setSelectedUser(updated);
      }
      showToast(`User ${updated.fullName} has been ${updated.enabled ? 'activated' : 'deactivated'} successfully.`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setUpdatingId(null);
      setConfirmUser(null);
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
            <ShieldAlert size={11} />
            <span>ADMIN</span>
          </span>
        );
      case 'OWNER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Briefcase size={11} />
            <span>OWNER</span>
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <UserCheck size={11} />
            <span>STAFF</span>
          </span>
        );
    }
  };

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
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">User Accounts Management</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
              {totalElements} Total Users
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Manage all platform owners, staff members, and system administrators across registered businesses.
          </p>
        </div>

        <button
          onClick={fetchUsers}
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
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-rose-900">Unable to load users data</p>
              <p className="text-rose-700 text-[11px]">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchUsers}
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
              placeholder="Search by name, email, phone, or business..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
            <span className="text-[11px] font-bold text-zinc-500">{t('staff.role', 'Role')}:</span>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(0);
              }}
              className="bg-transparent text-xs font-bold text-zinc-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="OWNER">Store Owners</option>
              <option value="STAFF">Store Staff</option>
              <option value="ADMIN">Platform Admins</option>
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
              <option value="ENABLED">Active Only</option>
              <option value="DISABLED">Disabled Only</option>
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

      {/* Users Table Grid */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-5 py-3.5">User Profile</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Associated Business</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Registered</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-zinc-400 space-y-2">
                    <Users size={32} className="mx-auto text-zinc-300 mb-2" />
                    <p className="font-bold text-zinc-800 text-sm">No users matched your criteria</p>
                    <p className="text-xs text-zinc-400">Try adjusting your search keywords or role filters.</p>
                  </td>
                </tr>
              ) : (
                users.map((usr) => {
                  const isUpdating = updatingId === usr.id;
                  const isSelf = usr.id === currentUser?.id;
                  const isAdmin = usr.role === 'ADMIN';

                  return (
                    <tr key={usr.id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Name & Initials */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800 font-bold text-xs shrink-0">
                            {usr.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-zinc-900 text-xs">{usr.fullName}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded bg-brand-50 text-brand-700 text-[9px] font-bold border border-brand-200">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-400 font-mono">User ID #{usr.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">{getRoleBadge(usr.role)}</td>

                      {/* Associated Business */}
                      <td className="px-4 py-3.5">
                        {usr.businessId ? (
                          <Link
                            to={`/admin/businesses?search=${encodeURIComponent(usr.businessName || '')}`}
                            className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700 font-medium hover:underline"
                          >
                            <Building2 size={13} className="text-zinc-400 shrink-0" />
                            <span className="font-bold text-xs truncate max-w-[180px]">
                              {usr.businessName || `Tenant #${usr.businessId}`}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-zinc-400 italic text-[11px]">Platform Wide</span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="text-zinc-700 font-medium">{usr.email}</div>
                          <div className="text-zinc-400 font-mono">{usr.phone || '—'}</div>
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="px-4 py-3.5 text-zinc-500 font-mono text-[11px]">
                        {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>

                      {/* Enable/Disable Status Badge */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            usr.enabled
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                          }`}
                        >
                          {usr.enabled ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                          <span>{usr.enabled ? 'Active' : 'Disabled'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details button */}
                          <button
                            onClick={() => setSelectedUser(usr)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                            title="View Full User Details"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Toggle Status Button */}
                          <button
                            onClick={() => setConfirmUser(usr)}
                            disabled={isUpdating || isSelf || (isAdmin && usr.enabled)}
                            title={
                              isSelf
                                ? 'Cannot disable your own account'
                                : isAdmin
                                ? 'Platform Admin accounts cannot be disabled'
                                : usr.enabled ? 'Deactivate user' : 'Activate user'
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                              usr.enabled
                                ? 'bg-white hover:bg-rose-50 text-rose-700 border-zinc-200 hover:border-rose-200'
                                : 'bg-white hover:bg-emerald-50 text-emerald-700 border-zinc-200 hover:border-emerald-200'
                            }`}
                          >
                            {isUpdating ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : usr.enabled ? (
                              'Deactivate'
                            ) : (
                              'Activate'
                            )}
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
              Showing Page {page + 1} of {totalPages} ({totalElements} total registered users)
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

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                  {selectedUser.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">{selectedUser.fullName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {getRoleBadge(selectedUser.role)}
                    <span className="text-[10px] text-zinc-400 font-mono">User #{selectedUser.id}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Mail size={11} /> Email Address
                  </span>
                  <p className="font-bold text-zinc-900 truncate">{selectedUser.email}</p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Phone size={11} /> Contact Phone
                  </span>
                  <p className="font-bold text-zinc-900 font-mono">{selectedUser.phone || 'Not Provided'}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Building2 size={11} /> Associated Tenant Business
                </span>
                {selectedUser.businessId ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-zinc-900 text-sm">{selectedUser.businessName || `Business #${selectedUser.businessId}`}</p>
                      <span className="text-[10px] text-zinc-400 font-mono">Tenant ID: {selectedUser.businessId}</span>
                    </div>
                    <Link
                      to={`/admin/businesses?search=${encodeURIComponent(selectedUser.businessName || '')}`}
                      className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-brand-600 font-bold text-xs hover:bg-brand-50 flex items-center gap-1"
                    >
                      <span>View Tenant</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                ) : (
                  <p className="text-zinc-500 italic">Platform-level administrator account (no tenant binding).</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div className="space-y-1">
                  <span className="text-zinc-400 font-medium flex items-center gap-1">
                    <Calendar size={12} /> Account Created
                  </span>
                  <p className="font-bold text-zinc-800 font-mono">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 font-medium flex items-center gap-1">
                    <Clock size={12} /> Account Status
                  </span>
                  <p className={`font-bold flex items-center gap-1 ${selectedUser.enabled ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedUser.enabled ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    <span>{selectedUser.enabled ? 'Active / Permitted' : 'Disabled / Suspended'}</span>
                  </p>
                </div>
              </div>

              {selectedUser.permissions && (
                <div className="pt-2 border-t border-zinc-100">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Granted Permissions
                  </span>
                  <div className="p-2.5 rounded-lg bg-zinc-100/70 font-mono text-[11px] text-zinc-700">
                    {selectedUser.permissions}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setConfirmUser(selectedUser);
                }}
                disabled={selectedUser.id === currentUser?.id || (selectedUser.role === 'ADMIN' && selectedUser.enabled)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  selectedUser.enabled
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {selectedUser.enabled ? 'Deactivate Account' : 'Activate Account'}
              </button>

              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS TOGGLE CONFIRMATION DIALOG */}
      {confirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                confirmUser.enabled ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  {confirmUser.enabled ? 'Deactivate User Account' : 'Activate User Account'}
                </h3>
                <p className="text-xs text-zinc-500 font-medium">Please confirm this action</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to <strong>{confirmUser.enabled ? 'deactivate' : 'activate'}</strong> account for{' '}
              <span className="font-bold text-zinc-900">{confirmUser.fullName}</span> ({confirmUser.email})?
              {confirmUser.enabled
                ? ' The user will immediately lose access to the POS, portal, and API endpoints.'
                : ' The user will immediately be permitted to sign in.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmUser(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={executeToggleUserStatus}
                disabled={updatingId !== null}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5 ${
                  confirmUser.enabled ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {updatingId ? <RefreshCw size={13} className="animate-spin" /> : null}
                <span>Confirm {confirmUser.enabled ? 'Deactivation' : 'Activation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
