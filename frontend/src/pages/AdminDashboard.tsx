import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi, AdminDashboardStats } from '../api/admin';
import { Business, User } from '../api/auth';
import { 
  Building, 
  Users, 
  ShieldAlert, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Building2, 
  UserCheck, 
  Briefcase 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'businesses' | 'users'>('businesses');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, bizData, userData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAllBusinesses(0, 50),
        adminApi.getAllUsers(0, 50),
      ]);
      setStats(statsData);
      setBusinesses(bizData.content);
      setUsersList(userData.content);
    } catch {
      // Ignore or notify
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleBusinessStatus = async (id: number, currentStatus: boolean) => {
    setUpdatingId(id);
    try {
      const updated = await adminApi.updateBusinessStatus(id, !currentStatus);
      setBusinesses((prev) => prev.map((b) => (b.id === id ? updated : b)));
      // Refresh stats
      const newStats = await adminApi.getStats();
      setStats(newStats);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update business status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 border-b border-purple-900/40 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-white tracking-tight">Platform Admin</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ROOT ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Tenant Oversight • Logged in as <span className="text-purple-300 font-medium">{user?.fullName}</span></p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Refresh Platform Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={logout}
              id="admin-logout-btn"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Total Tenants</span>
              <Building className="w-3.5 h-3.5 text-brand-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats?.totalBusinesses ?? '—'}</div>
          </div>

          <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Active Tenants</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{stats?.activeBusinesses ?? '—'}</div>
          </div>

          <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Deactivated</span>
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400">{stats?.inactiveBusinesses ?? '—'}</div>
          </div>

          <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Total Users</span>
              <Users className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats?.totalUsers ?? '—'}</div>
          </div>

          <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Owners</span>
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300">{stats?.totalOwners ?? '—'}</div>
          </div>

          <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Staff Users</span>
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-300">{stats?.totalStaff ?? '—'}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 space-x-2">
          <button
            onClick={() => setActiveTab('businesses')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'businesses'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Commercial Tenants ({businesses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Platform User Directory ({usersList.length})</span>
          </button>
        </div>

        {/* TAB 1: BUSINESSES MANAGEMENT TABLE */}
        {activeTab === 'businesses' && (
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-4">
            <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white">Commercial Tenant Businesses</h3>
                <p className="text-xs text-slate-400">View and toggle operational status across all onboarded establishments</p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading tenants...</div>
            ) : businesses.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">No businesses onboarded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">ID</th>
                      <th className="px-6 py-3.5">Business Name</th>
                      <th className="px-6 py-3.5">Vertical</th>
                      <th className="px-6 py-3.5">Contact Email</th>
                      <th className="px-6 py-3.5">Region</th>
                      <th className="px-6 py-3.5">Created Date</th>
                      <th className="px-6 py-3.5">Active Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {businesses.map((biz) => (
                      <tr key={biz.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-500">#{biz.id}</td>
                        <td className="px-6 py-4 font-bold text-white">{biz.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                            {biz.businessType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{biz.email || '—'}</td>
                        <td className="px-6 py-4 text-slate-400">{biz.currency} • {biz.timezone}</td>
                        <td className="px-6 py-4 text-slate-500">
                          {biz.createdAt ? new Date(biz.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4">
                          {biz.active ? (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/60 text-rose-400 border border-rose-800/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              <span>Deactivated</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleToggleBusinessStatus(biz.id, biz.active)}
                            disabled={updatingId === biz.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              biz.active
                                ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/50'
                                : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50'
                            }`}
                          >
                            {updatingId === biz.id ? 'Updating...' : biz.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: USERS DIRECTORY TABLE */}
        {activeTab === 'users' && (
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-4">
            <div className="p-6 border-b border-slate-800/80">
              <h3 className="text-base font-bold text-white">Platform User Directory</h3>
              <p className="text-xs text-slate-400">All registered user accounts across owners, staff, and platform administrators</p>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">ID</th>
                      <th className="px-6 py-3.5">Full Name</th>
                      <th className="px-6 py-3.5">Email</th>
                      <th className="px-6 py-3.5">Role</th>
                      <th className="px-6 py-3.5">Business Scope</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-500">#{u.id}</td>
                        <td className="px-6 py-4 font-bold text-white">{u.fullName}</td>
                        <td className="px-6 py-4 text-slate-300">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                              : u.role === 'OWNER'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {u.businessId ? `Tenant #${u.businessId}` : 'Platform Root'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center space-x-1 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
