import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { User, Role } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.searchUsers({
        search: search || undefined,
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
      setError('Failed to fetch platform users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, selectedRole, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleToggleUserStatus = async (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      alert('You cannot deactivate your own root platform account.');
      return;
    }
    if (targetUser.role === 'ADMIN' && targetUser.enabled) {
      alert('Platform Administrators cannot be deactivated.');
      return;
    }

    setUpdatingId(targetUser.id);
    try {
      const updated = await adminApi.updateUserStatus(targetUser.id, !targetUser.enabled);
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? updated : u)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <ShieldAlert size={10} />
            <span>PLATFORM ADMIN</span>
          </span>
        );
      case 'OWNER':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Briefcase size={10} />
            <span>BUSINESS OWNER</span>
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <UserCheck size={10} />
            <span>STAFF MEMBER</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Platform Users Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              {totalElements} Total Accounts
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Oversee all registered user accounts, role allocations, and access privileges.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-purple-400' : ''} />
          <span>Refresh Users</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold flex items-center space-x-2">
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
              placeholder="Search by full name, email, or phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-slate-400">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(0);
              }}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">
                All Roles
              </option>
              <option value="OWNER" className="bg-slate-900 text-slate-200">
                Owners
              </option>
              <option value="STAFF" className="bg-slate-900 text-slate-200">
                Staff
              </option>
              <option value="ADMIN" className="bg-slate-900 text-slate-200">
                Platform Admins
              </option>
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
                All
              </option>
              <option value="ENABLED" className="bg-slate-900 text-slate-200">
                Enabled Only
              </option>
              <option value="DISABLED" className="bg-slate-900 text-slate-200">
                Disabled Only
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

      {/* Users Table Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Assigned Tenant</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4 text-center">Account Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Loading users directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 space-y-1">
                    <Users size={32} className="mx-auto text-slate-600" />
                    <p className="font-semibold text-slate-300">No users found</p>
                    <p className="text-[11px] text-slate-500">Try adjusting your search criteria.</p>
                  </td>
                </tr>
              ) : (
                users.map((usr) => {
                  const isUpdating = updatingId === usr.id;
                  const isSelf = usr.id === currentUser?.id;
                  const isAdmin = usr.role === 'ADMIN';

                  return (
                    <tr key={usr.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Initials */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-300 font-black text-xs shrink-0">
                            {usr.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white text-xs">{usr.fullName}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 text-[9px] font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">User ID #{usr.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">{getRoleBadge(usr.role)}</td>

                      {/* Tenant Attribution */}
                      <td className="px-5 py-4">
                        {usr.businessId ? (
                          <div className="flex items-center space-x-1.5 text-slate-300">
                            <Building2 size={13} className="text-slate-500" />
                            <span className="font-mono text-xs">Tenant #{usr.businessId}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Platform Wide (No Tenant)</span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="text-slate-300 font-medium">{usr.email}</div>
                          <div className="text-slate-500 font-mono">{usr.phone || '—'}</div>
                        </div>
                      </td>

                      {/* Enable/Disable Toggle */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleToggleUserStatus(usr)}
                          disabled={isUpdating || isSelf || (isAdmin && usr.enabled)}
                          title={
                            isSelf
                              ? 'Cannot disable your own account'
                              : isAdmin
                              ? 'Platform Admin accounts cannot be disabled'
                              : 'Toggle user access'
                          }
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                            usr.enabled
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                        >
                          {isUpdating ? (
                            <RefreshCw size={11} className="animate-spin" />
                          ) : usr.enabled ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          <span>{usr.enabled ? 'Enabled' : 'Disabled'}</span>
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
              Showing Page {page + 1} of {totalPages} ({totalElements} users)
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
    </div>
  );
};
