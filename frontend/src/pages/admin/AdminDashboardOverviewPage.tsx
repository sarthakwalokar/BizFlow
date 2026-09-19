import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminApi, AdminDashboardStats } from '../../api/admin';
import { MetricCardsSkeleton, ChartSkeleton } from '../../components/common/LoadingStates';
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
  const { t } = useTranslation();
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

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{t('admin.title')}</h1>
            <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-200">
              Live Network
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t('auth.adminLoginSubtitle')}
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-medium shadow-xs transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-brand-600' : 'text-zinc-400'} />
          <span>{t('common.refresh')}</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <MetricCardsSkeleton count={4} />
          <ChartSkeleton height="h-64" />
        </div>
      ) : (
        <>
          {/* Main KPI Counters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5">
            {/* Total Businesses */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium uppercase tracking-wider">
                <span>{t('admin.totalBusinesses')}</span>
                <Building2 size={15} className="text-brand-600" />
              </div>
              <div className="text-2xl font-bold text-zinc-900">{stats?.totalBusinesses ?? '—'}</div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  {stats?.activeBusinesses ?? 0} {t('common.active')}
                </span>
                <span className="text-zinc-300">•</span>
                <span className="text-rose-600 font-medium flex items-center gap-1">
                  <XCircle size={11} />
                  {stats?.inactiveBusinesses ?? 0} {t('common.inactive')}
                </span>
              </div>
            </div>

            {/* Total Users */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium uppercase tracking-wider">
                <span>{t('admin.totalUsers')}</span>
                <Users size={15} className="text-brand-600" />
              </div>
              <div className="text-2xl font-bold text-zinc-900">{stats?.totalUsers ?? '—'}</div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-amber-700 font-medium flex items-center gap-1">
                  <Briefcase size={11} />
                  {stats?.totalOwners ?? 0} {t('staff.roleOwner', 'Owners')}
                </span>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-600 font-medium flex items-center gap-1">
                  <UserCheck size={11} />
                  {stats?.totalStaff ?? 0} {t('nav.staffTeam', 'Staff')}
                </span>
              </div>
            </div>

            {/* Platform Catalog */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium uppercase tracking-wider">
                <span>{t('nav.products')}</span>
                <Package size={15} className="text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-zinc-900">{stats?.totalProducts ?? '—'}</div>
              <p className="text-[11px] text-zinc-500">{t('dashboard.itemsTracked')}</p>
            </div>

            {/* Total Processed Bills */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-zinc-500 text-[11px] font-medium uppercase tracking-wider">
                <span>{t('nav.bills')}</span>
                <Receipt size={15} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700">{stats?.totalOrders ?? '—'}</div>
              <p className="text-[11px] text-zinc-500">{t('landing.completedBills')}</p>
            </div>
          </div>

          {/* Grid: Business Type Distribution & Business Tier Ratio */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Business Type Distribution */}
            <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-brand-600" />
                  <h3 className="text-sm font-semibold text-zinc-900">{t('auth.businessType')}</h3>
                </div>
                <Link
                  to="/admin/businesses"
                  className="text-xs text-brand-700 hover:text-brand-800 font-medium flex items-center gap-1"
                >
                  <span>{t('admin.businessDirectory')}</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {stats?.businessTypeDistribution &&
                  Object.entries(stats.businessTypeDistribution).map(([type, count]) => {
                    const total = stats.totalBusinesses || 1;
                    const percentage = Math.round((count / total) * 100);

                    return (
                      <div
                        key={type}
                        className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="p-1 rounded-md bg-white border border-zinc-200">
                            {getTypeIcon(type)}
                          </div>
                          <span className="text-[10px] font-mono font-medium text-zinc-500">{percentage}%</span>
                        </div>
                        <div>
                          <span className="text-[11px] font-medium text-zinc-700 block">{type}</span>
                          <div className="text-base font-bold text-zinc-900">{count}</div>
                        </div>
                        <div className="w-full bg-zinc-200 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-brand-600 h-full rounded-full"
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Business Tier Distribution & Quick Shortcuts */}
            <div className="space-y-4">
              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                  <TrendingUp size={15} className="text-emerald-600" />
                  <span>{t('settings.businessScale')}</span>
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-zinc-200 text-zinc-800 flex items-center justify-center font-bold text-xs">
                        S
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-900">{t('settings.smallBizTier')}</span>
                        <p className="text-[10px] text-zinc-500">{t('settings.smallBizTierBadge')}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-zinc-900 font-mono">
                      {stats?.businessSizeDistribution?.SMALL ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                        L
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-900">{t('settings.largeBizTier')}</span>
                        <p className="text-[10px] text-zinc-500">{t('settings.largeBizTierBadge')}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-zinc-900 font-mono">
                      {stats?.businessSizeDistribution?.LARGE ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Management Navigation */}
              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-2.5">
                <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('nav.administration')}</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/admin/businesses"
                    className="p-3 rounded-lg bg-zinc-50 hover:bg-brand-50/50 hover:border-brand-200 border border-zinc-200 text-xs font-medium text-zinc-800 transition-colors flex flex-col justify-between"
                  >
                    <Building2 size={15} className="text-brand-600 mb-2" />
                    <span>{t('admin.businesses')}</span>
                  </Link>

                  <Link
                    to="/admin/users"
                    className="p-3 rounded-lg bg-zinc-50 hover:bg-brand-50/50 hover:border-brand-200 border border-zinc-200 text-xs font-medium text-zinc-800 transition-colors flex flex-col justify-between"
                  >
                    <Users size={15} className="text-brand-600 mb-2" />
                    <span>{t('admin.users')}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Stream */}
          {stats?.recentActivity && stats.recentActivity.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-brand-600" />
                <h3 className="text-sm font-semibold text-zinc-900">{t('admin.globalAnalytics')}</h3>
              </div>

              <div className="divide-y divide-zinc-100">
                {stats.recentActivity.map((act) => (
                  <div key={act.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700">
                        <Building2 size={13} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-900">{act.title}</p>
                        <p className="text-[11px] text-zinc-500">{act.description}</p>
                      </div>
                    </div>

                    <span className="text-[10px] text-zinc-400 font-mono">
                      {act.timestamp ? new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};


