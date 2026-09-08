import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi, AnalyticsOverview, TimeRange } from '../../api/analytics';
import { inventoryApi, Location } from '../../api/inventory';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  ShoppingCart,
  Percent,
  Calendar,
  Building2,
  Users,
  RefreshCw,
  Award,
  CreditCard,
  PieChart,
  ArrowUpRight,
  BarChart3,
  Layers,
} from 'lucide-react';

export const AnalyticsDashboardPage: React.FC = () => {
  const { business } = useAuth();

  const [timeRange, setTimeRange] = useState<TimeRange>('THIS_MONTH');
  const [customStart, setCustomStart] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [customEnd, setCustomEnd] = useState<string>(new Date().toISOString().split('T')[0]);

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
        startDate: timeRange === 'CUSTOM' ? customStart : undefined,
        endDate: timeRange === 'CUSTOM' ? customEnd : undefined,
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

  const currency = overview?.currency || business?.currency || 'INR';

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

    const pathD = points.reduce(
      (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
      ''
    );

    const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

    return (
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 select-none">
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="1" />
          <line x1={paddingX} y1={paddingY + chartHeight / 2} x2={width - paddingX} y2={paddingY + chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#e2e8f0" strokeWidth="1" />

          {/* Area */}
          <path d={areaD} fill="url(#salesGradient)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points */}
          {points.map((pt, i) => (
            <g key={i} className="group cursor-pointer">
              <circle cx={pt.x} cy={pt.y} r="3.5" className="fill-indigo-600 stroke-white stroke-2 group-hover:r-5 transition-all" />
              <title>{`${pt.data.label}: ${pt.data.revenue.toFixed(2)} ${currency} (${pt.data.orderCount} orders)`}</title>
            </g>
          ))}
        </svg>

        {/* X Axis Labels */}
        <div className="flex justify-between px-2 text-[10px] font-bold text-slate-400 mt-1">
          <span>{data[0]?.label}</span>
          {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.label}</span>}
          <span>{data[data.length - 1]?.label}</span>
        </div>
      </div>
    );
  };

  // Compute SVG Bar Chart for Expenses Trend
  const renderExpensesBarChart = () => {
    if (!overview || !overview.expenseTrend || overview.expenseTrend.length === 0) return null;

    const data = overview.expenseTrend;
    const maxExp = Math.max(...data.map((d) => d.amount), 10);

    return (
      <div className="space-y-2">
        <div className="h-44 flex items-end justify-between gap-1 pt-4 px-2 border-b border-slate-100">
          {data.map((d, i) => {
            const pct = (d.amount / maxExp) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                <div
                  style={{ height: `${Math.max(pct, 4)}%` }}
                  className="w-full max-w-[24px] rounded-t-md bg-rose-500 hover:bg-rose-600 transition-all cursor-pointer relative"
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-md">
                    {d.amount.toFixed(2)} {currency}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between px-2 text-[10px] font-bold text-slate-400">
          <span>{data[0]?.label}</span>
          {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.label}</span>}
          <span>{data[data.length - 1]?.label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200/60">
              Live Insights
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Real-time financial velocity, net margins, top products, payment mix, and branch comparisons.
          </p>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Branch filter if Large Business */}
          {business?.businessSize === 'LARGE' && locations.length > 0 && (
            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-2xl px-3 py-1.5 shadow-xs">
              <Building2 size={15} className="text-slate-400" />
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Branches & Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.code ? `(${loc.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Time Range Selector */}
          <div className="inline-flex rounded-2xl bg-white border border-slate-200 p-1 shadow-xs">
            {(['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'CUSTOM'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {r === 'TODAY'
                  ? 'Today'
                  : r === 'THIS_WEEK'
                  ? 'This Week'
                  : r === 'THIS_MONTH'
                  ? 'This Month'
                  : 'Custom'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Metrics"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-indigo-600' : ''} />
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker Bar (if CUSTOM) */}
      {timeRange === 'CUSTOM' && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
            <Calendar size={15} className="text-indigo-600" />
            <span>Select Date Range:</span>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-500">From:</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-500">To:</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            onClick={fetchAnalytics}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer ml-auto"
          >
            Apply Dates
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
          {error}
        </div>
      )}

      {/* 1. Headline Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Gross Sales */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {overview ? overview.revenue.toFixed(2) : '0.00'} <span className="text-xs font-bold text-slate-400">{currency}</span>
          </div>
          <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold">
            <ArrowUpRight size={14} />
            <span>{overview?.orderCount || 0} bills completed</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bills</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Receipt size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {overview?.orderCount ?? 0}
          </div>
          <div className="text-xs text-slate-400 font-medium">Customer checkouts</div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Order Value</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {overview ? overview.averageOrderValue.toFixed(2) : '0.00'} <span className="text-xs font-bold text-slate-400">{currency}</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">Per ticket average</div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 tracking-tight">
            {overview ? overview.expenseTotal.toFixed(2) : '0.00'} <span className="text-xs font-bold text-slate-400">{currency}</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">Outflow recorded</div>
        </div>

        {/* Net Profit & Margin */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Profit</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp size={16} />
            </div>
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              overview && overview.netRevenue < 0 ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {overview ? overview.netRevenue.toFixed(2) : '0.00'} <span className="text-xs font-bold text-slate-400">{currency}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs font-bold text-slate-600">
            <Percent size={13} className="text-indigo-600" />
            <span>{overview?.profitMarginPercentage ?? 0}% margin</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Charts Row 1: Sales Velocity & Expense Outflow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <BarChart3 size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Sales & Revenue Velocity</h3>
                <p className="text-xs text-slate-400">Daily gross turnover curve across period</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-xs">
              {overview?.salesTrend?.length ?? 0} data points
            </span>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs">Loading chart data...</div>
          ) : (
            renderSalesAreaChart()
          )}
        </div>

        {/* Expense Trend Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <TrendingDown size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Daily Operating Expenses</h3>
                <p className="text-xs text-slate-400">Outflow distribution across period</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-extrabold text-xs">
              {overview?.expenseTotal.toFixed(2)} {currency} total
            </span>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs">Loading chart data...</div>
          ) : (
            renderExpensesBarChart()
          )}
        </div>
      </div>

      {/* 3. Products Leaderboard & Payment Methods Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Products Leaderboard (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 md:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Award size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Top Products & Services Leaderboard</h3>
                <p className="text-xs text-slate-400">Ranked by gross sales volume and revenue generated</p>
              </div>
            </div>
          </div>

          {overview?.topProducts && overview.topProducts.length > 0 ? (
            <div className="space-y-3.5">
              {overview.topProducts.map((p, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          index === 0
                            ? 'bg-amber-400 text-slate-900'
                            : index === 1
                            ? 'bg-slate-300 text-slate-800'
                            : index === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="font-bold text-slate-900">{p.productName}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          p.productType === 'PHYSICAL'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-pink-50 text-pink-700'
                        }`}
                      >
                        {p.productType}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 font-mono">
                      <span className="text-slate-400">{p.quantitySold} units sold</span>
                      <span className="font-black text-slate-900">
                        {p.totalRevenue.toFixed(2)} {currency} ({p.revenuePercentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(p.revenuePercentage, 100)}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">No sales recorded for the selected timeframe.</div>
          )}
        </div>

        {/* Payment Methods Distribution (1 col) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-7 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <PieChart size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Payment Breakdown</h3>
                <p className="text-xs text-slate-400">Tender type settlement mix</p>
              </div>
            </div>

            {overview?.paymentDistribution && overview.paymentDistribution.length > 0 ? (
              <div className="space-y-4 pt-4">
                {overview.paymentDistribution.map((pay, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                        <CreditCard size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{pay.paymentMethod}</div>
                        <div className="text-[10px] text-slate-400">{pay.transactionCount} transactions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900">
                        {pay.totalAmount.toFixed(2)} {currency}
                      </div>
                      <div className="text-[10px] font-bold text-indigo-600">{pay.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">No payment data in this period.</div>
            )}
          </div>

          {/* Customer Retention Card */}
          {overview?.customerFrequency && (
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                <div className="flex items-center space-x-1.5">
                  <Users size={14} className="text-indigo-600" />
                  <span>Repeat Customer Rate</span>
                </div>
                <span className="text-sm font-black text-indigo-700">
                  {overview.customerFrequency.repeatCustomerRate}%
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                {overview.customerFrequency.activeCustomersInPeriod} active buyers in period with{' '}
                <span className="font-bold text-slate-900">{overview.customerFrequency.averageOrdersPerCustomer} orders/customer</span> on average.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Large Enterprise Multi-Branch Comparative Analytics */}
      {overview?.largeBusiness && overview.branchPerformance && overview.branchPerformance.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Comparative Branch & Warehouse Performance</h3>
                <p className="text-xs text-slate-500">Cross-location sales volume, operating margin, and revenue contribution</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-extrabold text-xs border border-purple-200">
              Enterprise Feature
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview.branchPerformance.map((branch) => (
              <div
                key={branch.locationId}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{branch.locationName}</h4>
                    {branch.locationCode && (
                      <span className="text-[10px] font-mono text-slate-400">{branch.locationCode}</span>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-black">
                    {branch.revenueSharePercentage}% Share
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Branch Revenue</span>
                    <span className="font-black text-slate-900">
                      {branch.revenue.toFixed(2)} {currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Orders Count</span>
                    <span className="font-bold text-slate-700">{branch.orderCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Avg Ticket</span>
                    <span className="font-bold text-slate-700">
                      {branch.averageOrderValue.toFixed(2)} {currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Net Profit</span>
                    <span className={`font-black ${branch.netRevenue >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {branch.netRevenue.toFixed(2)} {currency}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
