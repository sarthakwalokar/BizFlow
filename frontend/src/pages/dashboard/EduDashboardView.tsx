import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  educationApi,
  EduSummary,
  EduBatch,
  EduCourse,
} from '../../api/modules';
import { formatCurrency } from '../../utils/currency';
import {
  GraduationCap,
  BookOpen,
  CircleDollarSign,
  Users,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Receipt,
  FileText,
} from 'lucide-react';

export const EduDashboardView: React.FC = () => {
  const { t } = useTranslation();
  const { user, business } = useAuth();
  const currency = business?.currency || 'INR';

  const [summary, setSummary] = useState<EduSummary | null>(null);
  const [batches, setBatches] = useState<EduBatch[]>([]);
  const [courses, setCourses] = useState<EduCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning', 'Good Morning');
    if (hour < 17) return t('dashboard.goodAfternoon', 'Good Afternoon');
    return t('dashboard.goodEvening', 'Good Evening');
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumData, bData, cData] = await Promise.all([
        educationApi.getSummary().catch(() => null),
        educationApi.getBatches().catch(() => []),
        educationApi.getCourses().catch(() => []),
      ]);
      setSummary(sumData);
      setBatches(bData);
      setCourses(cData);
    } catch (err) {
      console.error('Failed to load education dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalStudents = summary?.totalStudents ?? 0;
  const activeStudents = summary?.activeStudents ?? 0;
  const totalBatches = summary?.totalBatches ?? batches.length;
  const totalCollected = summary?.totalCollectedFees ?? 0;
  const totalPending = summary?.totalPendingFees ?? 0;
  const overdueCount = summary?.overdueCount ?? 0;
  const recentAdmissions = summary?.recentAdmissions ?? [];
  const pendingDues = summary?.pendingDues ?? [];
  const recentPayments = summary?.recentPayments ?? [];

  return (
    <div className="space-y-6">
      {/* Hero / Header Card */}
      <div className="clay-card p-6 sm:p-7 relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border-none shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <GraduationCap size={13} className="text-emerald-400" />
                <span>{t('education.dashboardTitle', 'Education & Coaching Dashboard')}</span>
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {getGreeting()}, {user?.fullName || t('education.educator', 'Educator')}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {t('education.dashboardSubtitle', 'Get a clear view of your daily business performance and stay on top of what matters.')}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/dashboard/education/students"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>{t('education.admitStudent', 'Admit Student')}</span>
            </Link>

            <Link
              to="/dashboard/education/fees"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <CircleDollarSign size={15} />
              <span>{t('education.collectFee', 'Collect Fee')}</span>
            </Link>

            <Link
              to="/dashboard/education/courses"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              <BookOpen size={14} />
              <span>{t('education.coursesAndBatches', 'Courses & Batches')}</span>
            </Link>

            <Link
              to="/dashboard/reports"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              title={t('education.instituteReports', 'Institute Reports')}
            >
              <FileText size={14} />
              <span>{t('nav.reports', 'Reports')}</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="clay-card p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('education.totalStudents', 'Total Students')}</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{loading ? '...' : totalStudents}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activeStudents} {t('common.active', 'Active')}
              </span>
              <span className="text-[11px] text-slate-400">
                {totalStudents - activeStudents} {t('education.inactiveCompleted', 'inactive/completed')}
              </span>
            </div>
          </div>
          <Link
            to="/dashboard/education/students"
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>{t('education.viewStudentDirectory', 'View Student Directory')}</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Active Batches */}
        <div className="clay-card p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('education.batchesAndClasses', 'Batches & Classes')}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{loading ? '...' : totalBatches}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {courses.length} {t('education.coursesOffered', 'Courses Offered')}
              </span>
            </div>
          </div>
          <Link
            to="/dashboard/education/courses"
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>{t('education.manageTimetables', 'Manage Timetables & Quotas')}</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Total Collected Fees */}
        <div className="clay-card p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('education.feesCollected', 'Fees Collected')}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CircleDollarSign size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">
              {loading ? '...' : formatCurrency(totalCollected, currency)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[11px] text-emerald-700 font-semibold">
                {t('education.totalTuitionRecorded', 'Total tuition receipts recorded')}
              </span>
            </div>
          </div>
          <Link
            to="/dashboard/education/fees"
            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>{t('education.viewPaymentHistory', 'View Payment History')}</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Pending Fees Dues */}
        <div className="clay-card p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('education.pendingDues', 'Pending Dues')}</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Receipt size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600">
              {loading ? '...' : formatCurrency(totalPending, currency)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {overdueCount > 0 ? (
                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                  {overdueCount} {t('education.overdue', 'Overdue')}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">{t('education.allCurrentAccounts', 'All current accounts')}</span>
              )}
            </div>
          </div>
          <Link
            to="/dashboard/education/fees"
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>{t('education.collectPendingInstallments', 'Collect Pending Installments')}</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Recent Admissions & Batch Schedules */}
        <div className="space-y-6">
          {/* Recent Admissions */}
          <div className="clay-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users size={15} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{t('education.recentAdmissions', 'Recent Student Admissions')}</h3>
              </div>
              <Link
                to="/dashboard/education/students"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                <span>{t('common.all', 'View All')}</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : recentAdmissions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <GraduationCap size={28} className="mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-700">{t('education.noStudentsEnrolled', 'No students enrolled yet')}</p>
                <Link
                  to="/dashboard/education/students"
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  + {t('education.admitFirstStudent', 'Admit your first student')}
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentAdmissions.slice(0, 5).map((stu) => (
                  <div key={stu.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-black flex items-center justify-center text-xs shrink-0">
                        {stu.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{stu.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {stu.studentIdNumber} • {stu.phone}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {stu.currentBatchName ? (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200">
                          {stu.currentBatchName}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">{t('education.unassigned', 'Unassigned')}</span>
                      )}
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{stu.admissionDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Batch Schedules */}
          <div className="clay-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock size={15} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{t('education.activeBatchesTimetables', 'Active Batches & Timetables')}</h3>
              </div>
              <Link
                to="/dashboard/education/courses"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>{t('education.manageBatches', 'Manage Batches')}</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : batches.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Calendar size={28} className="mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-700">{t('education.noBatchesCreated', 'No batches created yet')}</p>
                <Link
                  to="/dashboard/education/courses"
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  + {t('education.createFirstBatch', 'Create your first batch')}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {batches.slice(0, 4).map((b) => {
                  const enrolled = b.enrolledCount || 0;
                  const cap = b.capacity || 30;
                  const pct = Math.min(Math.round((enrolled / cap) * 100), 100);

                  return (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{b.batchName}</h4>
                          <span className="text-[10px] text-slate-500">{b.courseName || 'Coaching Course'}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-600">
                          {enrolled} / {cap} {t('education.seats', 'Seats')} ({pct}%)
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 90
                              ? 'bg-rose-500'
                              : pct >= 60
                              ? 'bg-amber-500'
                              : 'bg-indigo-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-slate-400" />
                          <span>{b.schedule}</span>
                        </span>
                        <span className="font-mono">{t('education.starts', 'Starts')}: {b.startDate || t('education.ongoing', 'Ongoing')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Fee Dues Alerts & Recent Fee Receipts */}
        <div className="space-y-6">
          {/* Pending Fee Dues */}
          <div className="clay-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertCircle size={15} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{t('education.pendingDuesInstallments', 'Pending Fee Dues & Installments')}</h3>
              </div>
              <Link
                to="/dashboard/education/fees"
                className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
              >
                <span>{t('education.viewAllDues', 'View All Dues')}</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : pendingDues.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 size={28} className="mx-auto text-emerald-500" />
                <p className="text-xs font-bold text-slate-800">{t('education.allFeesCleared', 'All fees are cleared!')}</p>
                <p className="text-[11px] text-slate-400">{t('education.noPendingInstallments', 'No pending student installments.')}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingDues.slice(0, 5).map((enr) => {
                  const isOverdue =
                    enr.pendingAmount > 0 &&
                    enr.nextDueDate &&
                    new Date(enr.nextDueDate) < new Date();

                  return (
                    <div key={enr.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{enr.studentName}</p>
                        <p className="text-[10px] text-slate-500">
                          {enr.courseName} • <span className="font-mono">{enr.batchName}</span>
                        </p>
                        <span
                          className={`text-[9px] font-mono font-bold ${
                            isOverdue ? 'text-rose-600 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {t('education.due', 'Due')}: {enr.nextDueDate || t('education.immediate', 'Immediate')}{' '}
                          {isOverdue && `(${t('education.overdueCaps', 'OVERDUE')})`}
                        </span>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-2.5">
                        <div>
                          <span className="text-xs font-black text-rose-600 block">
                            {formatCurrency(enr.pendingAmount, currency)}
                          </span>
                          <span className="text-[9px] text-slate-400">{t('education.pending', 'pending')}</span>
                        </div>

                        <Link
                          to="/dashboard/education/fees"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-2xs transition-all"
                        >
                          {t('education.collect', 'Collect')}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Fee Receipts */}
          <div className="clay-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Receipt size={15} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{t('education.recentFeeReceipts', 'Recent Fee Receipts Issued')}</h3>
              </div>
              <Link
                to="/dashboard/education/fees"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
              >
                <span>{t('education.viewReceipts', 'View Receipts')}</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : recentPayments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Receipt size={28} className="mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-700">{t('education.noReceiptsYet', 'No payment receipts yet')}</p>
                <p className="text-[11px] text-slate-400">{t('education.installmentsShowPrompt', 'Fee installments will show here once recorded.')}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentPayments.slice(0, 5).map((pay) => (
                  <div key={pay.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{pay.studentName}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px] font-bold">
                          {pay.receiptNumber}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {pay.paymentDate} • {pay.paymentMethod}
                      </p>
                    </div>

                    <div className="text-right shrink-0 font-black text-xs text-emerald-700">
                      +{formatCurrency(pay.amount, currency)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightweight Coaching Flow Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-indigo-950">{t('education.coachingWorkflow', 'Simple Coaching Management Workflow')}</h4>
            <p className="text-[11px] text-indigo-800">
              Students &rarr; Courses &amp; Batches &rarr; Fee Management &rarr; Business Analytics &amp; Reports
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/reports"
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all cursor-pointer shadow-2xs"
          >
            {t('education.instituteReports', 'Education Reports')}
          </Link>
          <Link
            to="/dashboard/analytics"
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            {t('nav.analytics', 'View Analytics')}
          </Link>
        </div>
      </div>
    </div>
  );
};
