import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi, AnalyticsOverview, TimeRange } from '../../api/analytics';
import { inventoryApi, Location } from '../../api/inventory';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Percent,
  Building2,
  RefreshCw,
  Award,
  CreditCard,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { MetricCardsSkeleton, ChartSkeleton, SkeletonBlock } from '../../components/common/LoadingStates';

export const AnalyticsDashboardPage: React.FC = () => {
  const { business } = useAuth();

  const [timeRange, setTimeRange] = useState<TimeRange>('THIS_MONTH');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('ALL');
  const [locations, setLocations] = useState<Location[]>([]);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch locations for multi-branch filtering if large business
  useEffect(() => {
    const fetchLocations = async () => {
      if (business?.businessSize === 'LARGE') {
        try {
          const locs = await inventoryApi.getLocations();
          setLocations(locs);
        } catch {
          // ignore if locations unavailable
        }
      }
    };
    fetchLocations();
  }, [business]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsApi.getOverview({
        timeRange,
        locationId: selectedLocationId !== 'ALL' ? Number(selectedLocationId) : undefined,
      });
      setOverview(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to fetch analytics metrics.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedLocationId]);

  const currency = overview?.currency || business?.currency || 'USD';

  // Compute SVG Area / Line Chart Points for Sales Trend
  const renderSalesAreaChart = () => {
    if (!overview || !overview.salesTrend || overview.salesTrend.length === 0) return null;

    const data = overview.salesTrend;
    const maxRev = Math.max(...data.map((d) => d.revenue), 10);
    const width = 600;
    const height = 180;
    const paddingX = 30;
    const paddingY = 20;

    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;

    const points = data.map((d, i) => {
      const x = paddingX + (i / Math.max(data.length - 1, 1)) * chartWidth;
      const y = height - paddingY - (d.revenue / maxRev) * chartHeight;
      return { x, y, data: d };
    });

    const pathD = points.reduce((acc, p, i) => {
      return `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
          <defs>
            <linearGradient id="brandAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0D9488" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = height - paddingY - ratio * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#E4E4E7"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-zinc-400 font-mono font-medium"
                >
                  {formatCurrency(maxRev * ratio, currency).split('.')[0]}
                </text>
              </g>
            );
          })}

          {/* Fill Area */}
          <path d={areaD} fill="url(#brandAreaGrad)" />

          {/* Stroke Line */}
          <path d={pathD} fill="none" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx} className="group">
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="#FFFFFF"
                stroke="#6D28D9"
                strokeWidth="2"
                className="transition-all hover:r-5 cursor-pointer"
              />
              <text
                x={p.x}
                y={height - paddingY + 14}
                textAnchor="middle"
                className="text-[9px] fill-zinc-500 font-mono"
              >
                {new Date(p.data.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Financial &amp; Sales Analytics</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time profit margins, order velocity, top performing products, and payment mode breakdowns.
          </p>
        </div>

        {/* Time Range & Location Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Multi-Location Filter for Large Businesses */}
          {business?.businessSize === 'LARGE' && locations.length > 0 && (
            <div className="flex items-center space-x-1 bg-white border border-zinc-200 rounded-xl p-1 text-xs">
              <Building2 size={14} className="text-zinc-400 ml-1.5" />
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-zinc-800 pr-2 focus:ring-0"
              >
                <option value="ALL">All Branches &amp; Stores</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Time Preset Selector */}
          <div className="flex items-center space-x-1 bg-white border border-zinc-200 rounded-xl p-1 text-xs font-semibold">
            {[
              { id: 'TODAY', label: 'Today' },
              { id: 'THIS_WEEK', label: '7 Days' },
              { id: 'THIS_MONTH', label: 'Month' },
              { id: 'THIS_YEAR', label: 'Year' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setTimeRange(preset.id as TimeRange)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  timeRange === preset.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-brand-600' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      {loading ? (
        <MetricCardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gross Revenue */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Gross Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-zinc-950">
              {formatCurrency(overview?.revenue ?? 0, currency)}
            </div>
            <p className="text-[11px] text-zinc-500">Total processed sales volume</p>
          </div>

          {/* Operating Expenses */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Operating Expenses</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <TrendingDown size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-600">
              {formatCurrency(overview?.expenseTotal ?? 0, currency)}
            </div>
            <p className="text-[11px] text-zinc-500">Logged business expenditures</p>
          </div>

          {/* Net Profit Margin */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Net Operating Profit</span>
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <Percent size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-zinc-950">
              {formatCurrency(overview?.netRevenue ?? 0, currency)}
            </div>
            <p className="text-[11px] text-brand-700 font-semibold">
              {`${Number(overview?.profitMarginPercentage ?? 0).toFixed(1)}% net margin`}
            </p>
          </div>

          {/* Total Orders & AOV */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Average Order Value</span>
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <ShoppingCart size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-zinc-950">
              {formatCurrency(overview?.averageOrderValue ?? 0, currency)}
            </div>
            <p className="text-[11px] text-zinc-500">
              {`Across ${overview?.orderCount ?? 0} paid bills`}
            </p>
          </div>
        </div>
      )}

      {/* Sales Velocity Trend Area Chart */}
      {loading ? (
        <ChartSkeleton title="Revenue Velocity Trend" />
      ) : (
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Revenue Velocity Trend</h3>
              <p className="text-xs text-zinc-500">Daily sales performance trajectory</p>
            </div>
            <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
              Automated Calculations
            </span>
          </div>

          {renderSalesAreaChart()}
        </div>
      )}

      {/* Dual Breakdown Columns: Top Products & Payment Modes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Best-Selling Products */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-zinc-900">Top Selling Products &amp; Services</h3>
            </div>
            <span className="text-xs text-zinc-400">By Revenue</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-1.5 animate-pulse">
                  <div className="flex items-center justify-between">
                    <SkeletonBlock className="h-3 w-32" />
                    <SkeletonBlock className="h-3 w-16" />
                  </div>
                  <SkeletonBlock className="h-1.5 w-full rounded-full" />
                </div>
              ))
            ) : !overview || overview.topProducts.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs">No sales recorded in this period.</div>
            ) : (
              overview.topProducts.map((p, idx) => {
                const maxProdRev = Math.max(...overview.topProducts.map((t) => t.totalRevenue), 1);
                const percent = (p.totalRevenue / maxProdRev) * 100;

                return (
                  <div key={p.productId || idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-medium">
                      <div className="flex items-center space-x-2">
                        <span className="w-4 text-zinc-400 font-bold">{idx + 1}.</span>
                        <span className="font-bold text-zinc-900">{p.productName}</span>
                        <span className="text-[10px] text-zinc-400">({p.quantitySold} units)</span>
                      </div>
                      <span className="font-black text-zinc-950">{formatCurrency(p.totalRevenue, currency)}</span>
                    </div>

                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-600 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-zinc-900">Payment Capture Distribution</h3>
            </div>
            <span className="text-xs text-zinc-400">Multi-Mode</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-1.5 animate-pulse">
                  <div className="flex items-center justify-between">
                    <SkeletonBlock className="h-3 w-28" />
                    <SkeletonBlock className="h-3 w-20" />
                  </div>
                  <SkeletonBlock className="h-1.5 w-full rounded-full" />
                </div>
              ))
            ) : !overview || overview.paymentDistribution.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs">No transactions recorded.</div>
            ) : (
              overview.paymentDistribution.map((pm, idx) => {
                const totalAll = overview.paymentDistribution.reduce((acc: number, x: any) => acc + x.totalAmount, 0) || 1;
                const percent = (pm.totalAmount / totalAll) * 100;

                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-medium">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 font-bold text-[10px] text-zinc-700">
                          {pm.paymentMethod}
                        </span>
                        <span className="text-zinc-500 text-[11px]">{pm.transactionCount} bills</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-zinc-950">{formatCurrency(pm.totalAmount, currency)}</span>
                        <span className="text-[10px] text-zinc-400 ml-1.5 font-semibold">
                          ({percent.toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-600 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
