import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { billingApi, BillingSummary, Order } from '../../api/billing';
import { expensesApi, ExpenseSummaryResponse } from '../../api/expenses';
import { reviewsApi, ReviewAnalytics, Review } from '../../api/reviews';
import { analyticsApi } from '../../api/analytics';
import { InvoiceReceiptModal } from '../../components/billing/InvoiceReceiptModal';
import { MetricCardsSkeleton } from '../../components/common/LoadingStates';
import { formatCurrency } from '../../utils/currency';
import { EduDashboardView } from './EduDashboardView';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Star,
  Sparkles,
  ArrowUpRight,
  Receipt,
  UserPlus,
  MessageSquarePlus,
  Bot,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Calendar,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface PerformanceDataPoint {
  date: string;
  fullDate: string;
  displayDate: string;
  revenue: number;
  expense: number;
  orderCount?: number;
  expenseCount?: number;
}

const formatLocalDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateRangeForFilter = (range: '7D' | '30D' | '90D') => {
  const now = new Date();
  const endDate = formatLocalDate(now);
  const daysAgo = range === '7D' ? 6 : range === '30D' ? 29 : 89;
  const startObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
  const startDate = formatLocalDate(startObj);
  return { startDate, endDate };
};

const generateFallbackPoints = (range: '7D' | '30D' | '90D'): PerformanceDataPoint[] => {
  const count = range === '7D' ? 7 : range === '30D' ? 30 : 90;
  const points: PerformanceDataPoint[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = formatLocalDate(d);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    const displayDate = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    points.push({
      date: label,
      fullDate: dateStr,
      displayDate,
      revenue: 0,
      expense: 0,
      orderCount: 0,
      expenseCount: 0,
    });
  }
  return points;
};

const getNiceMax = (rawMax: number): number => {
  if (rawMax <= 0) return 1000;
  const target = rawMax * 1.15;
  const power = Math.floor(Math.log10(target));
  const magnitude = Math.pow(10, power);
  const factor = target / magnitude;

  let niceFactor = 10;
  if (factor <= 1.25) niceFactor = 1.25;
  else if (factor <= 2) niceFactor = 2;
  else if (factor <= 2.5) niceFactor = 2.5;
  else if (factor <= 5) niceFactor = 5;
  else if (factor <= 7.5) niceFactor = 7.5;

  return Math.max(niceFactor * magnitude, 500);
};

export const DashboardHomePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, business } = useAuth();

  if (business?.businessType?.toUpperCase() === 'EDUCATION') {
    return <EduDashboardView />;
  }

  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummaryResponse | null>(null);
  const [reviewAnalytics, setReviewAnalytics] = useState<ReviewAnalytics | null>(null);
  const [liveReviews, setLiveReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  const [activeFeedTab, setActiveFeedTab] = useState<'INVOICES' | 'EXPENSES'>('INVOICES');
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('7D');
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [performanceLoading, setPerformanceLoading] = useState<boolean>(true);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState<boolean>(() => {
    return localStorage.getItem('bizflow_onboarding_dismissed') === 'true';
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning', 'Good Morning');
    if (hour < 17) return t('dashboard.goodAfternoon', 'Good Afternoon');
    return t('dashboard.goodEvening', 'Good Evening');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [billingSummary, expSummary] = await Promise.all([
          billingApi.getDashboardSummary().catch(() => null),
          expensesApi.getSummary().catch(() => null),
        ]);

        setSummary(billingSummary);
        setExpenseSummary(expSummary);

        try {
          const revAna = await reviewsApi.getAnalytics();
          setReviewAnalytics(revAna);
          if (revAna?.recentReviews?.length) {
            setLiveReviews(revAna.recentReviews);
          }
        } catch {
          // non-blocking
        }

        try {
          const reviewsList = await reviewsApi.getReviews({ page: 0, size: 5 });
          if (reviewsList?.content?.length) {
            setLiveReviews(reviewsList.content);
          }
        } catch {
          // non-blocking
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch Live Performance Chart Data on TimeRange change
  useEffect(() => {
    let isMounted = true;
    const fetchPerformance = async () => {
      setPerformanceLoading(true);
      try {
        const { startDate, endDate } = getDateRangeForFilter(timeRange);
        const overview = await analyticsApi.getOverview({
          timeRange: 'CUSTOM',
          startDate,
          endDate,
        });

        if (!isMounted) return;

        if (overview && overview.salesTrend && overview.salesTrend.length > 0) {
          const expenseMap = new Map<string, { amount: number; count: number }>();
          (overview.expenseTrend || []).forEach((e) => {
            expenseMap.set(e.date, {
              amount: Number(e.amount) || 0,
              count: e.expenseCount || 0,
            });
          });

          const mapped: PerformanceDataPoint[] = overview.salesTrend.map((s) => {
            const exp = expenseMap.get(s.date) || { amount: 0, count: 0 };
            let displayDate = s.label;
            try {
              const parts = s.date.split('-');
              if (parts.length === 3) {
                const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                displayDate = dt.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
              }
            } catch {
              // fallback
            }

            return {
              date: s.label,
              fullDate: s.date,
              displayDate,
              revenue: Number(s.revenue) || 0,
              expense: exp.amount,
              orderCount: s.orderCount || 0,
              expenseCount: exp.count,
            };
          });

          setPerformanceData(mapped);
        } else {
          setPerformanceData(generateFallbackPoints(timeRange));
        }
      } catch (err) {
        console.error('Failed to load performance analytics', err);
        if (isMounted) {
          setPerformanceData(generateFallbackPoints(timeRange));
        }
      } finally {
        if (isMounted) {
          setPerformanceLoading(false);
        }
      }
    };

    fetchPerformance();
    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  const currency = business?.currency || summary?.currency || 'INR';

  // Live metrics directly bound to database state (0 if no transactions)
  const todaySalesValue = summary?.todaySales ?? 0;
  const ordersCountValue = summary?.todayOrdersCount ?? 0;
  const operatingExpensesValue = summary?.todayExpenses ?? 0;
  const customerRatingValue = reviewAnalytics && reviewAnalytics.totalReviews > 0
    ? Number(reviewAnalytics.averageRating).toFixed(1)
    : '0.0';

  const todayRevenueDisplay = formatCurrency(todaySalesValue, currency);
  const monthlyRevenueValue = summary?.monthSales ?? 0;
  const netMarginValue = summary?.monthNetRevenue ?? 0;

  // SVG Chart Calculation
  const renderRevenueChart = () => {
    const data = performanceData.length > 0 ? performanceData : generateFallbackPoints(timeRange);
    const rawMax = Math.max(...data.map((d) => Math.max(d.revenue, d.expense)), 0);
    const maxVal = getNiceMax(rawMax);

    const width = 680;
    const height = 220;
    const padLeft = 60;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 35;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const revPoints = data.map((d, i) => {
      const x = padLeft + (i / Math.max(data.length - 1, 1)) * chartW;
      const y = padTop + chartH - (d.revenue / maxVal) * chartH;
      return { x, y, data: d };
    });

    const expPoints = data.map((d, i) => {
      const x = padLeft + (i / Math.max(data.length - 1, 1)) * chartW;
      const y = padTop + chartH - (d.expense / maxVal) * chartH;
      return { x, y, data: d };
    });

    // Helper for smooth Bezier curve
    const getCurvePath = (points: { x: number; y: number }[]) => {
      if (points.length === 0) return '';
      if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX = (p0.x + p1.x) / 2;
        d += ` C ${cpX.toFixed(1)} ${p0.y.toFixed(1)}, ${cpX.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
      }
      return d;
    };

    const revLine = getCurvePath(revPoints);
    const expLine = getCurvePath(expPoints);

    const revArea = revPoints.length
      ? `${revLine} L ${revPoints[revPoints.length - 1].x.toFixed(1)} ${(padTop + chartH).toFixed(1)} L ${revPoints[0].x.toFixed(1)} ${(padTop + chartH).toFixed(1)} Z`
      : '';

    // Calculate which X-axis labels to show
    const visibleLabelIndices = (() => {
      if (data.length <= 7) {
        return new Set(Array.from({ length: data.length }, (_, i) => i));
      }
      const indices = new Set<number>();
      const step = Math.ceil(data.length / 6);
      for (let i = 0; i < data.length; i += step) {
        indices.add(i);
      }
      indices.add(data.length - 1);
      return indices;
    })();

    const activeHoverPoint = hoveredPointIndex !== null && revPoints[hoveredPointIndex]
      ? {
          rev: revPoints[hoveredPointIndex],
          exp: expPoints[hoveredPointIndex],
          data: data[hoveredPointIndex],
        }
      : null;

    return (
      <div className="w-full relative select-none">
        {/* Loading overlay indicator */}
        {performanceLoading && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xs flex items-center justify-center z-20 rounded-xl">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/90 shadow-xs rounded-lg text-xs font-semibold text-brand-600 border border-brand-100 animate-pulse">
              <span>Loading trend data...</span>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 overflow-visible"
          onMouseLeave={() => setHoveredPointIndex(null)}
        >
          <defs>
            <linearGradient id="clayRevAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.18" />
              <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="clayExpAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0D9488" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0D9488" stopOpacity="0.0" />
            </linearGradient>
            <filter id="clayDotGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#1D4ED8" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padTop + chartH - ratio * chartH;
            const gridVal = Number((ratio * maxVal).toFixed(0));
            const formattedVal = gridVal >= 100000 ? `${(gridVal / 1000).toFixed(0)}k` : gridVal.toLocaleString('en-IN');
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="600"
                  fill="#94A3B8"
                >
                  ₹{formattedVal}
                </text>
              </g>
            );
          })}

          {/* Revenue Area & Line */}
          <path d={revArea} fill="url(#clayRevAreaGrad)" />
          <path
            d={revLine}
            fill="none"
            stroke="#1D4ED8"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Expense Line */}
          <path
            d={expLine}
            fill="none"
            stroke="#0D9488"
            strokeWidth="2.5"
            strokeDasharray="5 4"
            strokeLinecap="round"
          />

          {/* X-Axis Milestone Labels */}
          {revPoints.map((p, idx) => {
            if (!visibleLabelIndices.has(idx)) return null;
            return (
              <text
                key={`label-${idx}`}
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="600"
                fill="#64748B"
              >
                {p.data.date}
              </text>
            );
          })}

          {/* Regular Data Point Dots (Visible indices for 30D/90D, or all for 7D) */}
          {revPoints.map((p, idx) => {
            if (!visibleLabelIndices.has(idx) && data.length > 14) return null;
            return (
              <circle
                key={`rev-dot-${idx}`}
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#FFFFFF"
                stroke="#1D4ED8"
                strokeWidth="2.5"
                className="transition-transform pointer-events-none"
              />
            );
          })}

          {expPoints.map((p, idx) => {
            if (!visibleLabelIndices.has(idx) && data.length > 14) return null;
            return (
              <circle
                key={`exp-dot-${idx}`}
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="#FFFFFF"
                stroke="#0D9488"
                strokeWidth="2"
                className="transition-transform pointer-events-none"
              />
            );
          })}

          {/* Vertical Crosshair Line when Active */}
          {activeHoverPoint && (
            <line
              x1={activeHoverPoint.rev.x}
              y1={padTop}
              x2={activeHoverPoint.rev.x}
              y2={padTop + chartH}
              stroke="#64748B"
              strokeDasharray="3 3"
              strokeWidth="1.5"
              className="pointer-events-none transition-all duration-75"
            />
          )}

          {/* Highlighted Dots on Active Hover */}
          {activeHoverPoint && (
            <>
              <circle
                cx={activeHoverPoint.rev.x}
                cy={activeHoverPoint.rev.y}
                r="6"
                fill="#FFFFFF"
                stroke="#1D4ED8"
                strokeWidth="3.5"
                filter="url(#clayDotGlow)"
                className="pointer-events-none"
              />
              <circle
                cx={activeHoverPoint.exp.x}
                cy={activeHoverPoint.exp.y}
                r="5"
                fill="#FFFFFF"
                stroke="#0D9488"
                strokeWidth="3"
                className="pointer-events-none"
              />
            </>
          )}

          {/* Invisible Interactive Hit Boxes for Butter-smooth Hover */}
          {revPoints.map((p, idx) => {
            const stepW = chartW / Math.max(data.length - 1, 1);
            const sliceX = Math.max(padLeft, p.x - stepW / 2);
            const sliceW = idx === 0 || idx === data.length - 1 ? stepW / 2 + 5 : stepW;

            return (
              <rect
                key={`hit-${idx}`}
                x={sliceX}
                y={padTop}
                width={sliceW}
                height={chartH + 20}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPointIndex(idx)}
                onTouchStart={() => setHoveredPointIndex(idx)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {activeHoverPoint && (
          <div className="absolute top-2 right-4 clay-card px-4 py-2.5 text-xs space-y-1.5 shadow-xl border border-slate-200/90 bg-white/95 backdrop-blur-md pointer-events-none z-30 transition-all duration-100">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-1.5">
              <span className="font-extrabold text-slate-900">{activeHoverPoint.data.displayDate || activeHoverPoint.data.date}</span>
              <span className="text-[10px] text-slate-400 font-mono font-medium">{activeHoverPoint.data.fullDate}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <div className="flex items-center justify-between space-x-2">
                <span className="text-slate-500 font-medium">Revenue:</span>
                <span className="text-brand-600 font-extrabold">
                  {formatCurrency(activeHoverPoint.data.revenue, currency)}
                  {activeHoverPoint.data.orderCount ? ` (${activeHoverPoint.data.orderCount} order${activeHoverPoint.data.orderCount > 1 ? 's' : ''})` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <span className="text-slate-500 font-medium">Expense:</span>
                <span className="text-teal-600 font-extrabold">
                  {formatCurrency(activeHoverPoint.data.expense, currency)}
                  {activeHoverPoint.data.expenseCount ? ` (${activeHoverPoint.data.expenseCount} exp)` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between space-x-2 col-span-2 pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Net Profit:</span>
                <span className={`font-black ${activeHoverPoint.data.revenue - activeHoverPoint.data.expense >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {activeHoverPoint.data.revenue - activeHoverPoint.data.expense >= 0 ? '+' : ''}
                  {formatCurrency(activeHoverPoint.data.revenue - activeHoverPoint.data.expense, currency)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. WELCOME SECTION (Minimalist Claymorphic Card) */}
      <section className="clay-card p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full clay-badge-blue text-xs font-bold mb-1">
              <Calendar size={12} className="text-brand-600" />
              <span>{t('dashboard.makeTodayProductive', "Let's make today productive!")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, {user?.fullName || 'Business Owner'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {t('dashboard.overviewSubtitle', "Here's a quick overview of your business performance and latest updates.")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard/reports"
              className="clay-btn-primary px-5 py-2.5 text-xs flex items-center space-x-2 cursor-pointer"
            >
              <FileText size={15} />
              <span>{t('dashboard.viewReports', 'View Reports')}</span>
            </Link>

            <Link
              to="/dashboard/pos"
              className="clay-btn-secondary px-4 py-2.5 text-xs flex items-center space-x-2 cursor-pointer"
            >
              <Receipt size={15} className="text-brand-600" />
              <span>{t('nav.pos', 'POS Billing')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 1.5 SETUP PROGRESS BANNER (For Quick Workspace Onboarding Access) */}
      {!onboardingDismissed && (
        <section className="clay-card p-4 sm:p-5 bg-gradient-to-r from-blue-50/90 via-cyan-50/50 to-white border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <span>{t('dashboard.setupGuide', 'Workspace Setup Guide')}</span>
                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                  {t('dashboard.quickStart', 'Quick Start')}
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {t('dashboard.setupGuideDesc', 'Complete your business profile, add catalogue items, test POS billing, and activate customer review QR codes.')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                setOnboardingDismissed(true);
                localStorage.setItem('bizflow_onboarding_dismissed', 'true');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t('common.dismiss', 'Dismiss')}
            </button>
            <Link
              to="/onboarding"
              className="clay-btn-primary px-4 py-1.5 text-xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>{t('dashboard.continueSetup', 'Continue Setup')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* 2. BUSINESS SNAPSHOT (4 Minimalist Claymorphic Cards) */}
      <section>
        {loading ? (
          <MetricCardsSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Today's Sales */}
            <div className="clay-card clay-card-hover p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('dashboard.todaySales', "Today's Sales")}
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shadow-xs border border-blue-100">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {todayRevenueDisplay}
              </div>
              <div className="flex items-center space-x-2 text-xs pt-1 border-t border-slate-100">
                <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-0.5">
                  {t('dashboard.live', 'Live')}
                </span>
                <span className="text-slate-500 font-medium">{t('dashboard.billedToday', 'Billed today')}</span>
              </div>
            </div>

            {/* Card 2: Orders */}
            <div className="clay-card clay-card-hover p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('nav.bills', 'Orders')}
                </span>
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shadow-xs border border-cyan-100">
                  <ShoppingBag size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {ordersCountValue}
              </div>
              <div className="flex items-center space-x-2 text-xs pt-1 border-t border-slate-100">
                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-0.5">
                  {ordersCountValue} {ordersCountValue === 1 ? t('orders.singleOrder', 'order') : t('orders.multipleOrders', 'orders')}
                </span>
                <span className="text-slate-500 font-medium">{t('dashboard.processedToday', 'processed today')}</span>
              </div>
            </div>

            {/* Card 3: Operating Expenses */}
            <div className="clay-card clay-card-hover p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('dashboard.operatingExpenses', 'Operating Expenses')}
                </span>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs border border-rose-100">
                  <TrendingDown size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {formatCurrency(operatingExpensesValue, currency)}
              </div>
              <div className="flex items-center space-x-2 text-xs pt-1 border-t border-slate-100">
                <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-0.5">
                  {expenseSummary?.recentExpenses?.length ?? 0}
                </span>
                <span className="text-slate-500 font-medium">{t('dashboard.expensesLogged', 'expenses logged')}</span>
              </div>
            </div>

            {/* Card 4: Customer Rating */}
            <div className="clay-card clay-card-hover p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('dashboard.customerRating', 'Customer Rating')}
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs border border-amber-100">
                  <Star size={18} className="fill-amber-500 text-amber-500" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-1">
                <span>{customerRatingValue}</span>
                <span className="text-amber-500 text-xl">★</span>
              </div>
              <div className="flex items-center space-x-2 text-xs pt-1 border-t border-slate-100">
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-0.5">
                  {reviewAnalytics?.totalReviews ?? 0} {t('reviews.title', 'Reviews')}
                </span>
                <span className="text-slate-500 font-medium">{t('dashboard.totalFeedback', 'total feedback')}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. MAIN DASHBOARD CONTENT GRID (Performance + Insights & Reviews) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Business Performance & Transactions Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* BUSINESS PERFORMANCE CARD */}
          <div className="clay-card p-6 space-y-5">
            {/* Header: Title, Range Controls (7D/30D/90D), View Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t('dashboard.businessPerformance', 'Business Performance')}</h3>
                <p className="text-xs text-slate-500 font-medium">{t('dashboard.revVsExpBreakdown', 'Revenue vs Expense breakdown')}</p>
              </div>

              <div className="flex items-center space-x-3">
                {/* 7D / 30D / 90D clay pill controls */}
                <div className="clay-inset p-1 flex items-center space-x-1 rounded-xl">
                  {(['7D', '30D', '90D'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setTimeRange(r)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        timeRange === r ? 'clay-pill-active' : 'clay-pill-inactive'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <Link
                  to="/dashboard/analytics"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>{t('dashboard.viewDetails', 'View Details')}</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* 3 Metric Chips Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Metric 1: Today's Revenue */}
              <div className="clay-card-subtle p-3.5 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  {t('dashboard.todayRevenue', "Today's Revenue")}
                </span>
                <div className="text-lg font-black text-slate-900">
                  {todayRevenueDisplay}
                </div>
                <span className="inline-block text-[10px] font-bold text-brand-600">
                  {summary && summary.todayOrdersCount > 0 ? `${summary.todayOrdersCount} ${t('orders.multipleOrders', 'orders')}` : t('dashboard.liveDailyBilling', 'Live daily billing')}
                </span>
              </div>

              {/* Metric 2: Monthly Revenue */}
              <div className="clay-card-subtle p-3.5 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  {t('dashboard.monthlyRevenue', 'Monthly Revenue')}
                </span>
                <div className="text-lg font-black text-slate-900">
                  {formatCurrency(monthlyRevenueValue, currency)}
                </div>
                <span className="inline-block text-[10px] font-bold text-emerald-600">
                  {summary && summary.monthSales > 0 ? t('dashboard.monthSalesActive', 'Current month sales') : 'MTD gross revenue'}
                </span>
              </div>

              {/* Metric 3: Net Margin */}
              <div className="clay-card-subtle p-3.5 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  {t('dashboard.netMargin', 'Net Margin')}
                </span>
                <div className="text-lg font-black text-slate-900">
                  {formatCurrency(netMarginValue, currency)}
                </div>
                <span className="inline-block text-[10px] font-bold text-teal-600">
                  {summary && summary.monthNetRevenue !== 0 ? t('dashboard.revenueMinusExpenses', 'Revenue minus expenses') : 'Profit calculation'}
                </span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-end space-x-4 text-xs font-semibold text-slate-600 pt-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-brand-600 shadow-xs"></span>
                <span>{t('dashboard.revenue', 'Revenue')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-teal-600 shadow-xs"></span>
                <span>{t('dashboard.expense', 'Expense')}</span>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            {renderRevenueChart()}
          </div>

          {/* DUAL FEEDS: RECENT INVOICES & RECENT EXPENSES */}
          <div className="clay-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveFeedTab('INVOICES')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeFeedTab === 'INVOICES'
                      ? 'clay-pill-active'
                      : 'clay-btn-secondary text-slate-600'
                  }`}
                >
                  {t('dashboard.recentInvoices', 'Recent Invoices')} ({summary?.recentOrders.length ?? 0})
                </button>
                <button
                  onClick={() => setActiveFeedTab('EXPENSES')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeFeedTab === 'EXPENSES'
                      ? 'clay-pill-active'
                      : 'clay-btn-secondary text-slate-600'
                  }`}
                >
                  {t('dashboard.recentExpenses', 'Recent Expenses')} ({expenseSummary?.recentExpenses.length ?? 0})
                </button>
              </div>

              <Link
                to={activeFeedTab === 'INVOICES' ? '/dashboard/bills' : '/dashboard/expenses'}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
              >
                <span>{activeFeedTab === 'INVOICES' ? t('dashboard.viewAllInvoices', 'View All Invoices') : t('dashboard.viewAllExpenses', 'View All Expenses')}</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {/* Tab 1: Invoices Feed */}
            {activeFeedTab === 'INVOICES' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                      <th className="pb-3">{t('orders.invoiceNumber', 'Invoice')}</th>
                      <th className="pb-3">{t('orders.customer', 'Customer')}</th>
                      <th className="pb-3">{t('dashboard.billedBy', 'Billed By')}</th>
                      <th className="pb-3">{t('orders.paymentMethod', 'Method')}</th>
                      <th className="pb-3">{t('orders.total', 'Amount')}</th>
                      <th className="pb-3">{t('orders.status', 'Status')}</th>
                      <th className="pb-3 text-right">{t('common.actions', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-20" /></td>
                          <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-28" /></td>
                          <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-16" /></td>
                          <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-12" /></td>
                          <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-16" /></td>
                          <td className="py-3.5"><div className="h-3.5 bg-slate-200 rounded w-14" /></td>
                          <td className="py-3.5 text-right"><div className="h-3.5 bg-slate-200 rounded w-6 ml-auto" /></td>
                        </tr>
                      ))
                    ) : !summary || summary.recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 space-y-2">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center mx-auto shadow-xs">
                            <Receipt size={20} />
                          </div>
                          <p className="font-bold text-slate-800 text-xs">{t('dashboard.noTransactions', 'No transactions recorded yet')}</p>
                          <p className="text-[11px] text-slate-400">
                            {t('dashboard.openPosPrompt', 'Open the POS Terminal to create your first customer bill.')}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      summary.recentOrders.map((order) => {
                        const dateStr = new Date(order.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 font-mono font-bold text-slate-900">
                              {order.invoiceNumber}
                              <span className="block text-[10px] text-slate-400 font-sans font-normal">
                                {dateStr}
                              </span>
                            </td>

                            <td className="py-3">
                              <span className="font-semibold text-slate-800">
                                {order.customer ? order.customer.name : t('billing.walkInCustomer', 'Walk-in')}
                              </span>
                            </td>

                            <td className="py-3 text-slate-500">{order.createdBy}</td>

                            <td className="py-3">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                                {order.paymentMethod}
                              </span>
                            </td>

                            <td className="py-3 font-black text-slate-900">
                              {formatCurrency(order.total, currency)}
                            </td>

                            <td className="py-3">
                              <span
                                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  order.paymentStatus === 'COMPLETED'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : order.paymentStatus === 'CANCELLED'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {order.paymentStatus === 'COMPLETED' ? (
                                  <>
                                    <CheckCircle2 size={11} className="text-emerald-600" />
                                    <span>{t('common.paid', 'Paid')}</span>
                                  </>
                                ) : order.paymentStatus === 'CANCELLED' ? (
                                  <>
                                    <XCircle size={11} className="text-rose-600" />
                                    <span>{t('common.cancelled', 'Cancelled')}</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock size={11} className="text-amber-600" />
                                    <span>{t('common.pending', 'Pending')}</span>
                                  </>
                                )}
                              </span>
                            </td>

                            <td className="py-3 text-right">
                              <button
                                onClick={() => setSelectedOrderForReceipt(order)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                                title={t('common.printReceipt', 'View Invoice Receipt')}
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Expenses Feed */}
            {activeFeedTab === 'EXPENSES' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                      <th className="pb-3">{t('common.date', 'Date')}</th>
                      <th className="pb-3">{t('expenses.category', 'Category')}</th>
                      <th className="pb-3">{t('common.description', 'Description')}</th>
                      <th className="pb-3">{t('expenses.paymentMethod', 'Method')}</th>
                      <th className="pb-3">{t('expenses.loggedBy', 'Logged By')}</th>
                      <th className="pb-3 text-right">{t('common.amount', 'Amount')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {!expenseSummary || expenseSummary.recentExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 space-y-2">
                          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                            <Receipt size={20} />
                          </div>
                          <p className="font-bold text-slate-800 text-xs">{t('dashboard.noRecentExpenses', 'No recent expenses logged')}</p>
                          <p className="text-[11px] text-slate-400">
                            {t('dashboard.recordOverheadsPrompt', 'Record your business overheads to keep track of spending.')}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      expenseSummary.recentExpenses.slice(0, 5).map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 text-slate-600 whitespace-nowrap">
                            {new Date(exp.expenseDate).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3 text-slate-800 font-medium max-w-xs truncate">
                            {exp.description || '—'}
                          </td>
                          <td className="py-3">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700">
                              {exp.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 text-slate-500 text-[11px]">{exp.createdByName || 'System'}</td>
                          <td className="py-3 text-right font-black text-rose-600">
                            -{formatCurrency(exp.amount, currency)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: AI Insight, Quick Actions & Recent Reviews (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. AI INSIGHT CARD */}
          <div className="clay-card p-6 space-y-4 border-l-4 border-l-brand-600">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{t('dashboard.aiInsight', 'AI Insight')}</h4>
                <span className="text-[10px] text-brand-600 font-semibold">BizFlow AI</span>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-700 leading-relaxed">
              {summary && summary.monthSales === 0 && summary.monthExpenses === 0
                ? t('dashboard.aiWelcomePrompt', 'Welcome to BizFlow! Create your first invoice or log an expense to activate real-time financial insights.')
                : summary && summary.monthExpenses > summary.monthSales
                ? t('dashboard.aiExpenseWarning', 'Your monthly expenses are higher than revenue. Review operating overheads to improve margins.')
                : summary && summary.monthSales > 0
                ? t('dashboard.aiMarginPositive', 'Your business is operating at a positive net margin this month. Keep up the momentum!')
                : t('dashboard.aiTrackDailyPrompt', 'Track your revenue and expenses daily for real-time AI financial diagnostics.')}
            </p>

            <Link
              to="/dashboard/ai-assistant"
              className="clay-btn-primary w-full py-2.5 px-4 text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>{t('dashboard.viewAnalysis', 'View Analysis')}</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          {/* 2. QUICK ACTIONS CARD */}
          <div className="clay-card p-6 space-y-3.5">
            <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              {t('dashboard.quickActions', 'Quick Actions')}
            </h4>

            <div className="space-y-2.5">
              <Link
                to="/dashboard/customers"
                className="clay-btn-secondary w-full py-2.5 px-4 text-xs flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center">
                    <UserPlus size={14} />
                  </div>
                  <span className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                    {t('customers.addCustomer', '+ Add Customer')}
                  </span>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:text-brand-600" />
              </Link>

              <Link
                to="/dashboard/reviews"
                className="clay-btn-secondary w-full py-2.5 px-4 text-xs flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <MessageSquarePlus size={14} />
                  </div>
                  <span className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                    {t('reviews.addReview', '+ Add Review')}
                  </span>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:text-amber-600" />
              </Link>

              <Link
                to="/dashboard/ai-assistant"
                className="clay-btn-secondary w-full py-2.5 px-4 text-xs flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <Bot size={14} />
                  </div>
                  <span className="font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">
                    {t('ai.askAi', 'Ask AI')}
                  </span>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:text-cyan-600" />
              </Link>
            </div>
          </div>

          {/* 3. RECENT REVIEWS CARD */}
          <div className="clay-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">{t('dashboard.recentReviews', 'Recent Reviews')}</h4>
              <Link
                to="/dashboard/reviews"
                className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
              >
                <span>{t('dashboard.viewAllReviews', 'View All Reviews')}</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>

            {/* Overall Rating & Breakdown */}
            <div className="clay-card-subtle p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-slate-900 flex items-center gap-1">
                    <span>{customerRatingValue}</span>
                    <span className="text-amber-500 text-xl">★</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {reviewAnalytics?.totalReviews ? `${reviewAnalytics.totalReviews} ${t('reviews.totalReviews', 'Total Reviews')}` : t('reviews.overallRating', 'Overall Rating')}
                  </span>
                </div>
                <div className="flex items-center space-x-0.5 text-amber-500 text-sm">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        reviewAnalytics && reviewAnalytics.totalReviews > 0 && star <= Math.round(Number(reviewAnalytics.averageRating))
                          ? 'text-amber-500'
                          : 'text-slate-300'
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {/* Star Rating Breakdown Bars (100% Dynamic from Database) */}
              <div className="space-y-1 text-[10px] font-semibold text-slate-600 pt-1 border-t border-slate-200/60">
                {[5, 4, 3, 2, 1].map((star) => {
                  const dist = Array.isArray(reviewAnalytics?.ratingDistribution)
                    ? reviewAnalytics.ratingDistribution.find((d) => d.stars === star)
                    : null;
                  const count = dist?.count ?? 0;
                  const total = reviewAnalytics?.totalReviews ?? 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                  return (
                    <div key={star} className="flex items-center space-x-2">
                      <span className="w-5 text-slate-500">{star} ★</span>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="w-6 text-right text-slate-400">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual Reviews List (100% Real Live Reviews or Empty State) */}
            <div className="space-y-3 pt-1">
              {liveReviews.length === 0 ? (
                <div className="py-6 text-center text-slate-400 space-y-1">
                  <MessageSquarePlus size={22} className="mx-auto text-slate-300 mb-1" />
                  <p className="font-bold text-slate-700 text-xs">{t('dashboard.noReviewsYet', 'No customer reviews yet')}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {t('dashboard.shareQrPrompt', 'Share your review QR code or link to collect verified customer feedback.')}
                  </p>
                </div>
              ) : (
                liveReviews.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{r.customerName || t('common.anonymous', 'Verified Guest')}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-0.5 text-amber-500 text-xs">
                      {Array.from({ length: r.rating || 5 }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                      "{r.feedbackText || 'Great service!'}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal Preview */}
      {selectedOrderForReceipt && (
        <InvoiceReceiptModal
          order={selectedOrderForReceipt}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}
    </div>
  );
};
