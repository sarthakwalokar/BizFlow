import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, AdminDashboardStats } from '../../api/admin';
import {
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Briefcase,
  UserCheck,
  Package,
  Receipt,
  RefreshCw,
  ArrowUpRight,
  TrendingUp,
  Store,
  Utensils,
  Coffee,
  Cake,
  Scissors,
  Wrench,
  Building,
  Sparkles,
  Layers,
} from 'lucide-react';

export const AdminDashboardOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin platform stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RETAIL':
        return <Store size={16} className="text-blue-400" />;
      case 'RESTAURANT':
        return <Utensils size={16} className="text-amber-400" />;
      case 'CAFE':
        return <Coffee size={16} className="text-amber-300" />;
      case 'BAKERY':
        return <Cake size={16} className="text-pink-400" />;
      case 'SALON':
        return <Scissors size={16} className="text-purple-400" />;
      case 'SERVICE':
        return <Wrench size={16} className="text-emerald-400" />;
      default:
        return <Building size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Platform Command Center</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              Live Network
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Real-time multi-tenant analytics, tenant provisioning, and platform health telemetry.
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-purple-400' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Main KPI Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {/* Total Businesses */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-2 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Tenants</span>
            <Building2 size={16} className="text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalBusinesses ?? '—'}</div>
          <div className="flex items-center space-x-2 text-[11px] font-semibold">
            <span className="text-emerald-400 flex items-center">
              <CheckCircle2 size={12} className="mr-1" />
              {stats?.activeBusinesses ?? 0} Active
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-rose-400 flex items-center">
              <XCircle size={12} className="mr-1" />
              {stats?.inactiveBusinesses ?? 0} Inactive
            </span>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-2 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Accounts</span>
            <Users size={16} className="text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalUsers ?? '—'}</div>
          <div className="flex items-center space-x-2 text-[11px] font-semibold">
            <span className="text-amber-300 flex items-center">
              <Briefcase size={12} className="mr-1" />
              {stats?.totalOwners ?? 0} Owners
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-300 flex items-center">
              <UserCheck size={12} className="mr-1" />
              {stats?.totalStaff ?? 0} Staff
            </span>
          </div>
        </div>

        {/* Platform Catalog */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-2 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Catalog Items</span>
            <Package size={16} className="text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalProducts ?? '—'}</div>
          <p className="text-[11px] text-slate-400 font-medium">SKUs & services created across tenants</p>
        </div>

        {/* Total Processed Bills */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-2 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Platform Orders</span>
            <Receipt size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{stats?.totalOrders ?? '—'}</div>
          <p className="text-[11px] text-slate-400 font-medium">Invoices generated by all active POS terminals</p>
        </div>
      </div>

      {/* Grid: Business Type Distribution & Business Tier Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Type Distribution */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers size={18} className="text-purple-400" />
              <h3 className="text-sm font-bold text-white">Business Type Distribution</h3>
            </div>
            <Link
              to="/admin/businesses"
              className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center space-x-1"
            >
              <span>Explore Directory</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {stats?.businessTypeDistribution &&
              Object.entries(stats.businessTypeDistribution).map(([type, count]) => {
                const total = stats.totalBusinesses || 1;
                const percentage = Math.round((count / total) * 100);

                return (
                  <div
                    key={type}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                        {getTypeIcon(type)}
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-400">{percentage}%</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-300 block">{type}</span>
                      <div className="text-lg font-black text-white">{count}</div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Business Tier Distribution & Quick Shortcuts */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingUp size={16} className="text-emerald-400" />
              <span>Tenant Tiers</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                    S
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">Small Business Tier</span>
                    <p className="text-[10px] text-slate-400">Lean POS, direct stock management</p>
                  </div>
                </div>
                <span className="text-base font-black text-white font-mono">
                  {stats?.businessSizeDistribution?.SMALL ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">
                    L
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">Large Enterprise Tier</span>
                    <p className="text-[10px] text-slate-400">Multi-location inventory, branches</p>
                  </div>
                </div>
                <span className="text-base font-black text-white font-mono">
                  {stats?.businessSizeDistribution?.LARGE ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Management Navigation */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Administrative Modules</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/admin/businesses"
                className="p-3 rounded-2xl bg-slate-950/80 hover:bg-purple-950/30 hover:border-purple-500/40 border border-slate-800 text-xs font-bold text-slate-200 transition-all flex flex-col justify-between"
              >
                <Building2 size={16} className="text-purple-400 mb-2" />
                <span>Tenants Directory</span>
              </Link>

              <Link
                to="/admin/users"
                className="p-3 rounded-2xl bg-slate-950/80 hover:bg-indigo-950/30 hover:border-indigo-500/40 border border-slate-800 text-xs font-bold text-slate-200 transition-all flex flex-col justify-between"
              >
                <Users size={16} className="text-indigo-400 mb-2" />
                <span>Users Governance</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Stream */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles size={16} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">Recent Platform Events</h3>
          </div>

          <div className="divide-y divide-slate-800/80">
            {stats.recentActivity.map((act) => (
              <div key={act.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/30 border border-purple-800/50 flex items-center justify-center text-purple-300">
                    <Building2 size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">{act.title}</p>
                    <p className="text-[11px] text-slate-400">{act.description}</p>
                  </div>
                </div>

                <span className="text-[10px] text-slate-500 font-mono">
                  {act.timestamp ? new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
