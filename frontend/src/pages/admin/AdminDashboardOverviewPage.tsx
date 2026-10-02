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
  ShieldAlert,
  AlertTriangle,
  Info,
  Layers,
  Activity,
  ChevronRight,
  UserPlus,
  BarChart3,
  Calendar,
  Sparkles
} from 'lucide-react';

export const AdminDashboardOverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredGrowthMonth, setHoveredGrowthMonth] = useState<{ monthLabel: string; newBusinesses: number; newUsers: number } | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching admin platform stats:', err);
      const errMsg = err.response?.data?.message || err.message || 'Network error or backend unavailable';
      setError(`Unable to load dashboard data: ${errMsg}`);
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
        return <Store size={14} className="text-brand-600" />;
      case 'RESTAURANT':
        return <Utensils size={14} className="text-amber-600" />;
      case 'CAFE':
        return <Coffee size={14} className="text-amber-700" />;
      case 'BAKERY':
        return <Cake size={14} className="text-pink-600" />;
      case 'SALON':
        return <Scissors size={14} className="text-brand-600" />;
      case 'SERVICE':
        return <Wrench size={14} className="text-emerald-600" />;
      default:
        return <Building size={14} className="text-zinc-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
            <ShieldAlert size={10} />
            <span>{t('admin.roleAdmin', 'ADMIN')}</span>
          </span>
        );
      case 'OWNER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Briefcase size={10} />
            <span>{t('admin.roleOwner', 'OWNER')}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <UserCheck size={10} />
            <span>{t('admin.roleStaff', 'STAFF')}</span>
          </span>
        );
    }
  };

  // Render SVG Growth Curve Chart
  const renderGrowthChart = () => {
    const growthData = stats?.monthlyGrowth || [];
    if (growthData.length === 0) {
      return (
        <div className="py-12 text-center text-zinc-400 text-xs font-medium">
          {t('admin.noMonthlyGrowth', 'No monthly growth data recorded yet.')}
        </div>
      );
    }

    const maxVal = Math.max(...growthData.map((d) => Math.max(d.newBusinesses, d.newUsers)), 4) * 1.3;
    const width = 800;
    const height = 200;
    const padLeft = 40;
    const padRight = 30;
    const padTop = 25;
    const padBottom = 35;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const bizPoints = growthData.map((d, i) => ({
      x: padLeft + (i / Math.max(growthData.length - 1, 1)) * chartW,
      y: padTop + chartH - (d.newBusinesses / maxVal) * chartH,
      data: d,
    }));

    const userPoints = growthData.map((d, i) => ({
      x: padLeft + (i / Math.max(growthData.length - 1, 1)) * chartW,
      y: padTop + chartH - (d.newUsers / maxVal) * chartH,
      data: d,
    }));

    const getCurve = (pts: { x: number; y: number }[]) => {
      if (pts.length === 0) return '';
      if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
      let path = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cpX = (p0.x + p1.x) / 2;
        path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
      }
      return path;
    };

    const bizLine = getCurve(bizPoints);
    const userLine = getCurve(userPoints);
    const userArea = userPoints.length
      ? `${userLine} L ${userPoints[userPoints.length - 1].x} ${padTop + chartH} L ${userPoints[0].x} ${padTop + chartH} Z`
      : '';

    return (
      <div className="w-full relative select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 sm:h-52 overflow-visible">
          <defs>
            <linearGradient id="adminUserAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const y = padTop + chartH - ratio * chartH;
            const gridVal = Math.round(ratio * maxVal);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                />
                <text
                  x={padLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="600"
                  fill="#94A3B8"
                >
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* User Growth Area & Line */}
          <path d={userArea} fill="url(#adminUserAreaGrad)" />
          <path d={userLine} fill="none" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Business Growth Line */}
          <path
            d={bizLine}
            fill="none"
            stroke="#0D9488"
            strokeWidth="2.2"
            strokeDasharray="5 4"
            strokeLinecap="round"
          />

          {/* Points & Labels */}
          {userPoints.map((p, idx) => (
            <g
              key={`pt-${idx}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredGrowthMonth(p.data)}
              onMouseLeave={() => setHoveredGrowthMonth(null)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#FFFFFF"
                stroke="#1D4ED8"
                strokeWidth="2.5"
                className="hover:scale-125 transition-transform"
              />
              <text
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#64748B"
              >
                {p.data.monthLabel}
              </text>
            </g>
          ))}

          {bizPoints.map((p, idx) => (
            <circle
              key={`biz-pt-${idx}`}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="#FFFFFF"
              stroke="#0D9488"
              strokeWidth="2"
              className="pointer-events-none"
            />
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredGrowthMonth && (
          <div className="absolute top-2 right-4 bg-white border border-zinc-200/90 shadow-lg rounded-xl px-3.5 py-2 text-xs space-y-1 z-20 pointer-events-none">
            <p className="font-bold text-zinc-900 border-b border-zinc-100 pb-1 flex items-center gap-1">
              <Calendar size={12} className="text-zinc-400" />
              <span>{hoveredGrowthMonth.monthLabel}</span>
            </p>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-brand-700 font-bold">New Users: +{hoveredGrowthMonth.newUsers}</span>
              <span className="text-teal-700 font-bold">New Businesses: +{hoveredGrowthMonth.newBusinesses}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* 1. Header & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              {t('admin.dashboard.title', 'Platform Administration')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{t('admin.dashboard.liveDb', 'Live Database')}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            {t('admin.dashboard.subtitle', 'Real-time platform governance, multi-tenant directory, and operational metrics.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadStats}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-brand-600' : 'text-zinc-400'} />
            <span>{t('common.refresh', 'Refresh Data')}</span>
          </button>
        </div>
      </div>

      {/* Error State with Retry Button */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-rose-900">{t('admin.dashboard.errorTitle', 'Unable to load dashboard data')}</p>
              <p className="text-rose-700 text-[11px]">{error}</p>
            </div>
          </div>
          <button
            onClick={loadStats}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
          >
            {t('common.retry', 'Retry')}
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <MetricCardsSkeleton count={6} />
          <ChartSkeleton height="h-64" />
        </div>
      ) : (
        <>
          {/* System/Platform Alerts Banner */}
          {stats?.systemAlerts && stats.systemAlerts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.systemAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 shadow-xs ${
                    alert.level === 'SUCCESS'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : alert.level === 'WARNING'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : alert.level === 'ERROR'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-blue-50/70 border-blue-200 text-blue-900'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {alert.level === 'SUCCESS' ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : alert.level === 'WARNING' ? (
                      <AlertTriangle size={16} className="text-amber-600" />
                    ) : alert.level === 'ERROR' ? (
                      <XCircle size={16} className="text-rose-600" />
                    ) : (
                      <Info size={16} className="text-blue-600" />
                    )}
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <p className="font-bold">{alert.title}</p>
                    <p className="text-[11px] opacity-90 leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* =========================================================================
              SECTION 1: TOP ADMIN OVERVIEW (Compact 6 KPI Cards)
             ========================================================================= */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
              {t('admin.dashboard.platformOverview', 'Platform Overview')}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* 1. Total Businesses */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs hover:border-brand-200 transition-all space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-[11px] font-bold">
                  <span>{t('admin.dashboard.totalBusinesses', 'Total Businesses')}</span>
                  <Building2 size={15} className="text-brand-600" />
                </div>
                <div className="text-2xl font-black text-zinc-950 tracking-tight">
                  {stats?.totalBusinesses ?? 0}
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">{t('admin.dashboard.registeredTenants', 'Registered tenants')}</p>
              </div>

              {/* 2. Active Businesses */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs hover:border-brand-200 transition-all space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-[11px] font-bold">
                  <span>{t('admin.dashboard.activeBusinesses', 'Active Businesses')}</span>
                  <CheckCircle2 size={15} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600 tracking-tight">
                  {stats?.activeBusinesses ?? 0}
                </div>
                <p className="text-[10px] text-emerald-700 font-medium">
                  {stats?.inactiveBusinesses ? `${stats.inactiveBusinesses} ${t('admin.dashboard.inactive', 'inactive')}` : t('admin.dashboard.allOperational', '100% operational')}
                </p>
              </div>

              {/* 3. Total Users */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs hover:border-brand-200 transition-all space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-[11px] font-bold">
                  <span>{t('admin.dashboard.totalUsers', 'Total Users')}</span>
                  <Users size={15} className="text-brand-600" />
                </div>
                <div className="text-2xl font-black text-zinc-950 tracking-tight">
                  {stats?.totalUsers ?? 0}
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">
                  {stats?.totalOwners ?? 0} {t('admin.dashboard.ownersCount', 'owners')}, {stats?.totalStaff ?? 0} {t('admin.dashboard.staffCount', 'staff')}
                </p>
              </div>

              {/* 4. Active Users */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs hover:border-brand-200 transition-all space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-[11px] font-bold">
                  <span>{t('admin.dashboard.activeUsers', 'Active Users')}</span>
                  <UserCheck size={15} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600 tracking-tight">
                  {stats?.activeUsers ?? 0}
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">
                  {stats?.inactiveUsers ?? 0} {t('admin.dashboard.disabledCount', 'disabled')}
                </p>
              </div>

              {/* 5. New Businesses */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs hover:border-brand-200 transition-all space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-[11px] font-bold">
                  <span>{t('admin.dashboard.newBusinesses', 'New Businesses')}</span>
                  <Building size={15} className="text-teal-600" />
                </div>
                <div className="text-2xl font-black text-zinc-950 tracking-tight">
                  +{stats?.newBusinesses30d ?? 0}
                </div>
                <p className="text-[10px] text-teal-700 font-medium">
                  +{stats?.newBusinesses7d ?? 0} {t('admin.dashboard.in7Days', 'in 7d')} • +{stats?.newBusinessesToday ?? 0} {t('admin.dashboard.today', 'today')}
                </p>
              </div>

              {/* 6. New Users */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs hover:border-brand-200 transition-all space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-[11px] font-bold">
                  <span>{t('admin.dashboard.newUsers', 'New Users')}</span>
                  <UserPlus size={15} className="text-violet-600" />
                </div>
                <div className="text-2xl font-black text-zinc-950 tracking-tight">
                  +{stats?.newUsers30d ?? 0}
                </div>
                <p className="text-[10px] text-violet-700 font-medium">
                  +{stats?.newUsers7d ?? 0} {t('admin.dashboard.in7Days', 'in 7d')} • +{stats?.newUsersToday ?? 0} {t('admin.dashboard.today', 'today')}
                </p>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 2: PLATFORM GROWTH (Real Charts from Database)
             ========================================================================= */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{t('admin.dashboard.growthTitle', 'Platform Growth (Last 6 Months)')}</h3>
                  <p className="text-[11px] text-zinc-500">{t('admin.dashboard.growthSubtitle', 'Live database growth curve: new users vs registered businesses')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-brand-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
                  <span>{t('admin.dashboard.newUsersLegend', 'New Users')}</span>
                </span>
                <span className="flex items-center gap-1.5 text-teal-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                  <span>{t('admin.dashboard.newBusinessesLegend', 'New Businesses')}</span>
                </span>
              </div>
            </div>

            {renderGrowthChart()}
          </div>

          {/* =========================================================================
              SECTION 3: RECENT BUSINESSES & RECENT USERS (TWO CLEAR STANDALONE SECTIONS)
             ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SUB-SECTION 3A: RECENT BUSINESSES */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-brand-600" />
                    <h3 className="text-sm font-bold text-zinc-900">{t('admin.dashboard.recentBusinesses', 'Recent Businesses')}</h3>
                  </div>
                  <Link
                    to="/admin/businesses"
                    className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>{t('admin.dashboard.viewAllBusinesses', 'View All Businesses')}</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>

                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-2.5">{t('admin.dashboard.colBusiness', 'Business')}</th>
                        <th className="pb-2.5">{t('admin.dashboard.colOwner', 'Owner')}</th>
                        <th className="pb-2.5">{t('admin.dashboard.colType', 'Type')}</th>
                        <th className="pb-2.5 text-center">{t('admin.dashboard.colStatus', 'Status')}</th>
                        <th className="pb-2.5 text-right">{t('admin.dashboard.colJoined', 'Joined')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {!stats?.recentBusinesses || stats.recentBusinesses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-zinc-400">
                            {t('admin.dashboard.noRecentBusinesses', 'No businesses registered yet.')}
                          </td>
                        </tr>
                      ) : (
                        stats.recentBusinesses.slice(0, 5).map((b) => (
                          <tr key={b.id} className="hover:bg-zinc-50/80 transition-colors">
                            <td className="py-3 font-bold text-zinc-900">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-xs text-brand-700 shrink-0">
                                  {b.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="truncate max-w-[140px]">{b.name}</span>
                              </div>
                            </td>
                            <td className="py-3 text-zinc-800 font-medium truncate max-w-[120px]">
                              {b.ownerName || '—'}
                            </td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                                {b.businessType}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                b.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                              }`}>
                                {b.active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                              </span>
                            </td>
                            <td className="py-3 text-right text-zinc-400 font-mono text-[11px]">
                              {b.createdAt ? new Date(b.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 text-right">
                <Link
                  to="/admin/businesses"
                  className="text-xs text-zinc-500 hover:text-zinc-800 font-bold inline-flex items-center gap-1"
                >
                  <span>{t('admin.dashboard.manageAllBusinesses', 'Manage all {{count}} businesses →', { count: stats?.totalBusinesses ?? 0 })}</span>
                </Link>
              </div>
            </div>

            {/* SUB-SECTION 3B: RECENT USERS */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-brand-600" />
                    <h3 className="text-sm font-bold text-zinc-900">{t('admin.dashboard.recentUsers', 'Recent Users')}</h3>
                  </div>
                  <Link
                    to="/admin/users"
                    className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>{t('admin.dashboard.viewAllUsers', 'View All Users')}</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>

                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-2.5">{t('admin.dashboard.colName', 'Name')}</th>
                        <th className="pb-2.5">{t('admin.dashboard.colRole', 'Role')}</th>
                        <th className="pb-2.5">{t('admin.dashboard.colBusinessAssoc', 'Business')}</th>
                        <th className="pb-2.5 text-center">{t('admin.dashboard.colStatus', 'Status')}</th>
                        <th className="pb-2.5 text-right">{t('admin.dashboard.colJoined', 'Joined')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {!stats?.recentUsers || stats.recentUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-zinc-400">
                            {t('admin.dashboard.noRecentUsers', 'No users registered yet.')}
                          </td>
                        </tr>
                      ) : (
                        stats.recentUsers.slice(0, 5).map((u) => (
                          <tr key={u.id} className="hover:bg-zinc-50/80 transition-colors">
                            <td className="py-3 font-bold text-zinc-900">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-700 shrink-0">
                                  {u.fullName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="truncate max-w-[130px]">
                                  <span className="block truncate">{u.fullName}</span>
                                  <span className="text-[10px] text-zinc-400 font-mono block truncate">{u.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">{getRoleBadge(u.role)}</td>
                            <td className="py-3 text-zinc-700 font-medium truncate max-w-[120px]">
                              {u.businessName || t('admin.dashboard.platformScope', 'Platform')}
                            </td>
                            <td className="py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                              }`}>
                                {u.enabled ? t('common.active', 'Active') : t('common.disabled', 'Disabled')}
                              </span>
                            </td>
                            <td className="py-3 text-right text-zinc-400 font-mono text-[11px]">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 text-right">
                <Link
                  to="/admin/users"
                  className="text-xs text-zinc-500 hover:text-zinc-800 font-bold inline-flex items-center gap-1"
                >
                  <span>{t('admin.dashboard.manageAllUsers', 'Manage all {{count}} users →', { count: stats?.totalUsers ?? 0 })}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 4: BUSINESS DISTRIBUTION (Category Breakdown from Database)
             ========================================================================= */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Layers size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{t('admin.dashboard.distributionTitle', 'Business Type Distribution')}</h3>
                  <p className="text-[11px] text-zinc-500">{t('admin.dashboard.distributionSubtitle', 'Live classification of registered commercial tenants')}</p>
                </div>
              </div>

              <span className="text-xs font-bold text-zinc-400 font-mono">
                {t('admin.dashboard.totalTenantsActive', '{{count}} Total Active Tenants', { count: stats?.totalBusinesses ?? 0 })}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {stats?.businessTypeDistribution &&
                Object.entries(stats.businessTypeDistribution).map(([type, count]) => {
                  const total = stats.totalBusinesses || 1;
                  const percentage = Math.round((count / total) * 100);

                  return (
                    <div
                      key={type}
                      className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/90 space-y-2 hover:bg-white hover:border-brand-200 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-1.5 rounded-lg bg-white border border-zinc-200 shadow-2xs">
                          {getTypeIcon(type)}
                        </div>
                        <span className="text-[11px] font-mono font-bold text-zinc-500">{percentage}%</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-zinc-800 block truncate">{type}</span>
                        <div className="text-base font-black text-zinc-950 mt-0.5">{count} {t('admin.dashboard.stores', 'stores')}</div>
                      </div>
                      <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-brand-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.max(percentage, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* =========================================================================
              SECTION 5: RECENT PLATFORM ACTIVITY (Audit Stream with Clean Empty State)
             ========================================================================= */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Activity size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{t('admin.dashboard.activityTitle', 'Recent Platform Activity')}</h3>
                  <p className="text-[11px] text-zinc-500">{t('admin.dashboard.activitySubtitle', 'Live platform audit log of registrations and operational events')}</p>
                </div>
              </div>

              <Link
                to="/admin/reports"
                className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 hover:underline"
              >
                <span>{t('admin.dashboard.auditCenter', 'Audit Center')}</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="divide-y divide-zinc-100">
              {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 space-y-1">
                  <Activity size={28} className="mx-auto text-zinc-300 mb-2" />
                  <p className="font-bold text-zinc-700 text-xs">{t('admin.dashboard.noActivity', 'No recent platform activity')}</p>
                  <p className="text-[11px] text-zinc-400">{t('admin.dashboard.noActivityDesc', 'Events will appear here as users and businesses interact with the platform.')}</p>
                </div>
              ) : (
                stats.recentActivity.map((act) => (
                  <div key={act.id} className="py-3 flex items-center justify-between hover:bg-zinc-50/80 px-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${
                        act.type === 'BUSINESS_REGISTERED'
                          ? 'bg-blue-50 text-brand-700 border-blue-200'
                          : act.type === 'USER_REGISTERED'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {act.type === 'BUSINESS_REGISTERED' ? (
                          <Building2 size={14} />
                        ) : act.type === 'USER_REGISTERED' ? (
                          <Users size={14} />
                        ) : (
                          <Activity size={14} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900">{act.title}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">({act.businessName || t('admin.dashboard.platformScope', 'Platform')})</span>
                        </div>
                        <p className="text-[11px] text-zinc-600 font-medium">{act.description}</p>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-zinc-400 font-mono">
                      {act.timestamp ? new Date(act.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : t('common.recent', 'Recent')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
            <Link
              to="/admin/users"
              className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-brand-300 hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 group-hover:text-brand-600 transition-colors">{t('admin.dashboard.usersDirectory', 'Users Directory')}</h4>
                  <p className="text-[10px] text-zinc-500">{t('admin.dashboard.accountsCount', '{{count}} Accounts', { count: stats?.totalUsers ?? 0 })}</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-400 group-hover:text-brand-600 transition-colors" />
            </Link>

            <Link
              to="/admin/businesses"
              className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-brand-300 hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building2 size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 group-hover:text-teal-600 transition-colors">{t('admin.dashboard.tenantsDirectory', 'Tenants Directory')}</h4>
                  <p className="text-[10px] text-zinc-500">{t('admin.dashboard.registeredCount', '{{count}} Registered', { count: stats?.totalBusinesses ?? 0 })}</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-400 group-hover:text-teal-600 transition-colors" />
            </Link>

            <Link
              to="/admin/reports"
              className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-brand-300 hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 group-hover:text-violet-600 transition-colors">{t('admin.dashboard.platformReports', 'Platform Reports')}</h4>
                  <p className="text-[10px] text-zinc-500">{t('admin.dashboard.growthAnalytics', 'Growth Analytics')}</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-400 group-hover:text-violet-600 transition-colors" />
            </Link>

            <Link
              to="/admin/config"
              className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-brand-300 hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">{t('admin.dashboard.systemConfig', 'System Config')}</h4>
                  <p className="text-[10px] text-zinc-500">{t('admin.dashboard.engineSettings', 'Engine & Settings')}</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-400 group-hover:text-amber-600 transition-colors" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
