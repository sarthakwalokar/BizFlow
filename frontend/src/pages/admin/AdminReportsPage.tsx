import React, { useState, useEffect } from 'react';
import { adminApi, AdminPlatformReport } from '../../api/admin';
import { MetricCardsSkeleton, ChartSkeleton } from '../../components/common/LoadingStates';
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
        return <Store size={15} className="text-brand-600" />;
      case 'RESTAURANT':
        return <Utensils size={15} className="text-amber-600" />;
      case 'CAFE':
        return <Coffee size={15} className="text-amber-700" />;
      case 'BAKERY':
        return <Cake size={15} className="text-pink-600" />;
      case 'SALON':
        return <Scissors size={15} className="text-brand-600" />;
      case 'SERVICE':
        return <Wrench size={15} className="text-emerald-600" />;
      default:
        return <Building size={15} className="text-zinc-500" />;
    }
  };

  const trendData = report?.registrationTrend || [];
  const maxRegistrations = Math.max(...trendData.map((d) => d.registrations), 1);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Platform Growth & Analytics</h1>
            <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-200">
              Executive View
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Tenant acquisition velocity, tier utilization, and cross-industry distribution curves.
          </p>
        </div>

        <button
          onClick={loadReports}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-medium shadow-xs transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-brand-600' : 'text-zinc-400'} />
          <span>Refresh Report</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <MetricCardsSkeleton count={4} />
          <ChartSkeleton height="h-64" />
        </div>
      ) : (
        <>
          {/* Summary KPI Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Total Tenants</span>
              <div className="text-xl font-bold text-zinc-900">{report?.totalTenants ?? 0}</div>
              <span className="text-[11px] text-brand-700 font-medium block">100% platform coverage</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Active Tenant Ratio</span>
              <div className="text-xl font-bold text-emerald-700">
                {report?.activeTenantPercentage?.toFixed(1) ?? '0.0'}%
              </div>
              <span className="text-[11px] text-emerald-600 font-medium block">
                {report?.activeTenants ?? 0} active operations
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Small Tier Businesses</span>
              <div className="text-xl font-bold text-zinc-900">{report?.smallBusinessesCount ?? 0}</div>
              <span className="text-[11px] text-zinc-400 block">Lean single-counter POS</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Large Enterprise Tier</span>
              <div className="text-xl font-bold text-brand-700">{report?.largeBusinessesCount ?? 0}</div>
              <span className="text-[11px] text-brand-600 block">Multi-location inventory enabled</span>
            </div>
          </div>

          {/* Monthly Registration Velocity Chart */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-600" />
                <h3 className="text-sm font-semibold text-zinc-900">Tenant Onboarding Velocity (Last 6 Months)</h3>
              </div>
              <span className="text-xs text-zinc-500">Monthly Registrations</span>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 border-b border-zinc-100">
              {trendData.map((pt, idx) => {
                const heightPercent = Math.max((pt.registrations / maxRegistrations) * 100, 8);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
                    <span className="text-[10px] font-semibold text-brand-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {pt.registrations}
                    </span>
                    <div
                      className="w-full max-w-[40px] bg-brand-600 hover:bg-brand-700 rounded-t-md transition-all"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-medium text-zinc-500 truncate mt-1">{pt.monthLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Business Type Breakdown Matrix */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-brand-600" />
              <h3 className="text-sm font-semibold text-zinc-900">Industry Segment Breakdown</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {report?.businessTypeDistribution &&
                Object.entries(report.businessTypeDistribution).map(([type, count]) => {
                  const total = report.totalTenants || 1;
                  const pct = Math.round((count / total) * 100);

                  return (
                    <div key={type} className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-white border border-zinc-200">{getTypeIcon(type)}</div>
                          <span className="text-xs font-semibold text-zinc-800">{type}</span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-brand-700">{pct}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Active Entities:</span>
                        <span className="font-bold text-zinc-900">{count}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
