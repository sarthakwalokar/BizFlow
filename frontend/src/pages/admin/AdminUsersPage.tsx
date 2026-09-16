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
  ChevronLeft,
  ChevronRight,
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldAlert size={11} />
            <span>ADMIN</span>
          </span>
        );
      case 'OWNER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Briefcase size={11} />
            <span>OWNER</span>
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <UserCheck size={11} />
            <span>STAFF</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Platform Users Directory</h1>
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
              {totalElements} Accounts
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Oversee all registered user accounts, role allocations, and access privileges across tenants.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-medium shadow-xs transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-purple-600' : 'text-zinc-400'} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle size={15} className="text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
              placeholder="Search by name, email, or phone..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5">
            <span className="text-[11px] font-medium text-zinc-500">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(0);
              }}
              className="bg-transparent text-xs font-medium text-zinc-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="OWNER">Owners</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Platform Admins</option>
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
              <option value="ALL">All</option>
              <option value="ENABLED">Active Only</option>
              <option value="DISABLED">Disabled Only</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Users Table Grid */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Assigned Tenant</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-400">
                    <RefreshCw size={18} className="mx-auto text-zinc-300 animate-spin mb-2" />
                    <p className="text-xs">Loading users directory...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-400 space-y-1">
                    <Users size={28} className="mx-auto text-zinc-300 mb-2" />
                    <p className="font-medium text-zinc-700">No users found</p>
                    <p className="text-[11px] text-zinc-400">Try adjusting your search criteria.</p>
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 font-bold text-xs shrink-0">
                            {usr.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-zinc-900 text-xs">{usr.fullName}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 text-[9px] font-semibold border border-purple-200">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-400 font-mono">ID #{usr.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">{getRoleBadge(usr.role)}</td>

                      {/* Tenant Attribution */}
                      <td className="px-4 py-3">
                        {usr.businessId ? (
                          <div className="flex items-center gap-1.5 text-zinc-700">
                            <Building2 size={13} className="text-zinc-400" />
                            <span className="font-mono text-xs">Tenant #{usr.businessId}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic text-[11px]">Platform Wide</span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="text-zinc-700 font-medium">{usr.email}</div>
                          <div className="text-zinc-400 font-mono">{usr.phone || '—'}</div>
                        </div>
                      </td>

                      {/* Enable/Disable Toggle */}
                      <td className="px-4 py-3 text-center">
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
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                            usr.enabled
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                          }`}
                        >
                          {isUpdating ? (
                            <RefreshCw size={11} className="animate-spin" />
                          ) : usr.enabled ? (
                            <CheckCircle2 size={11} />
                          ) : (
                            <XCircle size={11} />
                          )}
                          <span>{usr.enabled ? 'Active' : 'Disabled'}</span>
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
              Showing Page {page + 1} of {totalPages} ({totalElements} users)
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
    </div>
  );
};

