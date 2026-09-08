import React, { useState, useEffect } from 'react';
import { adminApi, AdminPlatformReport } from '../../api/admin';
import {
  TrendingUp,
  RefreshCw,
  Layers,
  Store,
  Utensils,
  Coffee,
  Cake,
  Scissors,
  Wrench,
  Building,
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [report, setReport] = useState<AdminPlatformReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPlatformReports();
      setReport(data);
    } catch (err) {
      console.error('Failed to load platform reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RETAIL':
        return <Store size={15} className="text-blue-400" />;
      case 'RESTAURANT':
        return <Utensils size={15} className="text-amber-400" />;
      case 'CAFE':
        return <Coffee size={15} className="text-amber-300" />;
      case 'BAKERY':
        return <Cake size={15} className="text-pink-400" />;
      case 'SALON':
        return <Scissors size={15} className="text-purple-400" />;
      case 'SERVICE':
        return <Wrench size={15} className="text-emerald-400" />;
      default:
        return <Building size={15} className="text-slate-400" />;
    }
  };

  const trendData = report?.registrationTrend || [];
  const maxRegistrations = Math.max(...trendData.map((d) => d.registrations), 1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Platform Growth Reports</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              Executive Analytics
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Tenant acquisition velocity, tier utilization, and cross-industry distribution curves.
          </p>
        </div>

        <button
          onClick={loadReports}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-purple-400' : ''} />
          <span>Refresh Report</span>
        </button>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Tenants</span>
          <div className="text-2xl font-black text-white">{report?.totalTenants ?? 0}</div>
          <span className="text-xs text-purple-400 font-bold block">100% platform coverage</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Tenant Ratio</span>
          <div className="text-2xl font-black text-emerald-400">
            {report?.activeTenantPercentage?.toFixed(1) ?? '0.0'}%
          </div>
          <span className="text-xs text-emerald-300 font-medium block">
            {report?.activeTenants ?? 0} active operations
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Small Tier Businesses</span>
          <div className="text-2xl font-black text-indigo-300">{report?.smallBusinessesCount ?? 0}</div>
          <span className="text-xs text-slate-400 font-medium block">Lean single-register POS</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Large Enterprise Tier</span>
          <div className="text-2xl font-black text-purple-300">{report?.largeBusinessesCount ?? 0}</div>
          <span className="text-xs text-slate-400 font-medium block">Multi-location inventory enabled</span>
        </div>
      </div>

      {/* Monthly Registration Velocity Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp size={18} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">Tenant Onboarding Velocity (Last 6 Months)</h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">Monthly Registrations</span>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-48 flex items-end justify-between gap-4 pt-4 px-2 border-b border-slate-800/80">
          {trendData.map((pt, idx) => {
            const heightPercent = Math.max((pt.registrations / maxRegistrations) * 100, 8);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <span className="text-[11px] font-bold text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {pt.registrations}
                </span>
                <div
                  className="w-full max-w-[48px] bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-xl group-hover:from-purple-500 group-hover:to-indigo-400 transition-all shadow-lg shadow-purple-600/20"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[10px] font-bold text-slate-400 truncate mt-1">{pt.monthLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Business Type Breakdown Breakdown Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Layers size={18} className="text-purple-400" />
          <h3 className="text-sm font-bold text-white">Industry Segment Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {report?.businessTypeDistribution &&
            Object.entries(report.businessTypeDistribution).map(([type, count]) => {
              const total = report.totalTenants || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={type} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded-lg bg-slate-900">{getTypeIcon(type)}</div>
                      <span className="text-xs font-bold text-slate-200">{type}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-400">{pct}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Active Entities:</span>
                    <span className="font-extrabold text-white">{count}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
