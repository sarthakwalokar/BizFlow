import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import {
  educationApi,
  EduSummary,
  EduBatch,
  EduCourse,
  EduEnrollment,
  EduFeePayment,
} from '../../api/modules';
import {
  BarChart3,
  BookOpen,
  CircleDollarSign,
  Users,
  PieChart,
  Clock,
  TrendingUp,
  Receipt,
  GraduationCap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EduAnalyticsView: React.FC = () => {
  const { business } = useAuth();
  const currency = business?.currency || 'INR';

  const [summary, setSummary] = useState<EduSummary | null>(null);
  const [courses, setCourses] = useState<EduCourse[]>([]);
  const [batches, setBatches] = useState<EduBatch[]>([]);
  const [enrollments, setEnrollments] = useState<EduEnrollment[]>([]);
  const [payments, setPayments] = useState<EduFeePayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [sData, cData, bData, eData, pData] = await Promise.all([
        educationApi.getSummary().catch(() => null),
        educationApi.getCourses().catch(() => []),
        educationApi.getBatches().catch(() => []),
        educationApi.getEnrollments().catch(() => []),
        educationApi.getFeePayments().catch(() => []),
      ]);
      setSummary(sData);
      setCourses(cData);
      setBatches(bData);
      setEnrollments(eData);
      setPayments(pData);
    } catch (err) {
      console.error('Failed to load education analytics data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const totalStudents = summary?.totalStudents ?? 0;
  const activeStudents = summary?.activeStudents ?? 0;
  const totalBatches = batches.length;
  const totalCollected = summary?.totalCollectedFees ?? 0;
  const totalPending = summary?.totalPendingFees ?? 0;
  const totalExpected = totalCollected + totalPending;
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 100;

  // Monthly Fee Trends (last 6 months)
  const getMonthlyTrends = () => {
    const monthsMap: Record<string, { label: string; collected: number; count: number }> = {};
    const now = new Date();

    // Initialize last 6 months in chronological order
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthsMap[key] = { label, collected: 0, count: 0 };
    }

    payments.forEach((p) => {
      if (p.paymentDate) {
        const key = p.paymentDate.substring(0, 7); // YYYY-MM
        if (monthsMap[key]) {
          monthsMap[key].collected += Number(p.amount) || 0;
          monthsMap[key].count += 1;
        } else {
          const d = new Date(p.paymentDate);
          const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          monthsMap[key] = {
            label,
            collected: Number(p.amount) || 0,
            count: 1,
          };
        }
      }
    });

    return Object.entries(monthsMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, data]) => ({ key, ...data }));
  };

  const monthlyTrends = getMonthlyTrends();
  const maxMonthlyCollection = Math.max(...monthlyTrends.map((m) => m.collected), 1000);

  // Payment mode breakdown
  const paymentModeMap: Record<string, number> = {};
  payments.forEach((p) => {
    const mode = p.paymentMethod || 'CASH';
    paymentModeMap[mode] = (paymentModeMap[mode] || 0) + (Number(p.amount) || 0);
  });

  // Course wise breakdown
  const courseStats = courses.map((c) => {
    const courseEnrollments = enrollments.filter((e) => e.courseId === c.id);
    const count = courseEnrollments.length;
    const revExpected = courseEnrollments.reduce((sum, e) => sum + (Number(e.netFees) || 0), 0);
    const revCollected = courseEnrollments.reduce((sum, e) => sum + (Number(e.paidAmount) || 0), 0);
    const revPending = courseEnrollments.reduce((sum, e) => sum + (Number(e.pendingAmount) || 0), 0);
    return {
      ...c,
      enrolledCount: count,
      revExpected,
      revCollected,
      revPending,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Education Business Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200 flex items-center gap-1.5">
              <BarChart3 size={13} className="text-indigo-600" />
              <span>Coaching Insights</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Student counts, batch quotas, fee collections, pending dues, and monthly tuition revenue trends.
          </p>
        </div>

        <Link
          to="/dashboard/reports"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <span>View Detailed Reports</span>
        </Link>
      </div>

      {/* 4 Core Coaching KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="clay-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Count</span>
            <GraduationCap size={15} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{loading ? '...' : totalStudents}</div>
          <p className="text-[10px] text-emerald-600 font-bold">{activeStudents} active learners</p>
        </div>

        <div className="clay-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Active Batches</span>
            <BookOpen size={15} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">{loading ? '...' : totalBatches}</div>
          <p className="text-[10px] text-slate-400">{courses.length} course curricula</p>
        </div>

        <div className="clay-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Fee Collection</span>
            <CircleDollarSign size={15} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{loading ? '...' : formatCurrency(totalCollected, currency)}</div>
          <p className="text-[10px] text-emerald-700 font-semibold">{collectionRate}% collection rate</p>
        </div>

        <div className="clay-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Pending Dues</span>
            <Receipt size={15} className="text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{loading ? '...' : formatCurrency(totalPending, currency)}</div>
          <p className="text-[10px] text-rose-700 font-semibold">{summary?.overdueCount || 0} overdue accounts</p>
        </div>
      </div>

      {/* Monthly Fee Collection & Revenue Trends */}
      <div className="clay-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Fee &amp; Revenue Trends</h3>
              <p className="text-xs text-slate-500">Tuition installment collections over the past 6 months</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Realized</span>
            <span className="text-base font-black text-emerald-600">{formatCurrency(totalCollected, currency)}</span>
          </div>
        </div>

        {/* Visual Monthly Revenue Bar Chart */}
        <div className="space-y-3">
          <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-44 pt-4 px-2 bg-slate-50/70 rounded-2xl border border-slate-100">
            {monthlyTrends.map((m) => {
              const heightPct = Math.max(Math.round((m.collected / maxMonthlyCollection) * 100), 8);
              return (
                <div key={m.key} className="flex flex-col items-center h-full justify-end group">
                  {/* Hover tooltip amount */}
                  <span className="text-[10px] font-bold text-slate-700 mb-1 opacity-90 group-hover:opacity-100 truncate max-w-full">
                    {m.collected > 0 ? formatCurrency(m.collected, currency) : '₹0'}
                  </span>

                  {/* Bar */}
                  <div className="w-full max-w-[48px] bg-slate-200 rounded-t-xl overflow-hidden flex flex-col justify-end" style={{ height: '70%' }}>
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        m.collected > 0
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300'
                          : 'bg-slate-300'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Month Label */}
                  <div className="mt-2 text-center">
                    <span className="text-[11px] font-bold text-slate-700 block">{m.label}</span>
                    <span className="text-[9px] text-slate-400 font-mono">{m.count} rec</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fee Collection & Financial Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fee Collection Rate & Health */}
        <div className="lg:col-span-2 clay-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CircleDollarSign size={16} className="text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Tuition Fee Realization &amp; Collections</h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700">
              Total Expected: {formatCurrency(totalExpected, currency)}
            </span>
          </div>

          {/* Large Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Collected: {formatCurrency(totalCollected, currency)} ({collectionRate}%)</span>
              </span>
              <span className="text-rose-600 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>Pending: {formatCurrency(totalPending, currency)} ({100 - collectionRate}%)</span>
              </span>
            </div>

            <div className="w-full h-4 rounded-full bg-rose-100 overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Fee / Student</span>
              <span className="text-sm font-bold text-slate-900">
                {totalStudents > 0 ? formatCurrency(totalExpected / totalStudents, currency) : '—'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Receipts Count</span>
              <span className="text-sm font-bold text-slate-900">{payments.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Overdue Accounts</span>
              <span className="text-sm font-black text-rose-600">{summary?.overdueCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Payment Mode Distribution */}
        <div className="clay-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <PieChart size={16} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Payment Modes</h3>
          </div>

          {Object.keys(paymentModeMap).length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No fee payment records recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(paymentModeMap).map(([mode, amt]) => {
                const pct = totalCollected > 0 ? Math.round((amt / totalCollected) * 100) : 0;
                return (
                  <div key={mode} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{mode}</span>
                      <span className="font-mono font-semibold text-slate-600">
                        {formatCurrency(amt, currency)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Course Enrollment & Revenue Breakdown */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Courses Enrollment &amp; Revenue Breakdown</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">{courses.length} Total Courses</span>
        </div>

        {courseStats.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">No courses created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                  <th className="pb-3">Course Title</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3 text-right">Standard Fee</th>
                  <th className="pb-3 text-center">Enrolled Students</th>
                  <th className="pb-3 text-right">Total Expected</th>
                  <th className="pb-3 text-right">Collected</th>
                  <th className="pb-3 text-right">Pending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courseStats.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-slate-900">
                      <div>{c.name}</div>
                      <span className="text-[10px] text-indigo-600 font-mono">{c.code || 'COURSE'}</span>
                    </td>
                    <td className="py-3 text-slate-600">{c.duration}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(c.totalFees, currency)}
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
                        {c.enrolledCount}
                      </span>
                    </td>
                    <td className="py-3 text-right font-black text-slate-900">
                      {formatCurrency(c.revExpected, currency)}
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-700">
                      {formatCurrency(c.revCollected, currency)}
                    </td>
                    <td className="py-3 text-right font-black text-rose-600">
                      {formatCurrency(c.revPending, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Batch Capacity & Timetable Occupancy */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Classroom Batch Quota Utilization</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">{batches.length} Batches</span>
        </div>

        {batches.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">No batches created yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((b) => {
              const enrolled = b.enrolledCount || 0;
              const cap = b.capacity || 30;
              const pct = Math.min(Math.round((enrolled / cap) * 100), 100);

              return (
                <div key={b.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{b.batchName}</h4>
                      <span className="text-[10px] text-slate-500">{b.courseName || 'Course'}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {enrolled} / {cap} Seats
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 90 ? 'bg-rose-500' : pct >= 60 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-slate-400" />
                      <span className="truncate max-w-[140px]">{b.schedule}</span>
                    </span>
                    <span className="font-bold text-indigo-700">{pct}% Filled</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
