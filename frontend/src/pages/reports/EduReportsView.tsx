import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import {
  educationApi,
  EduStudent,
  EduBatch,
  EduEnrollment,
  EduFeePayment,
} from '../../api/modules';
import {
  FileText,
  Printer,
  Download,
  Search,
  Filter,
  GraduationCap,
  CircleDollarSign,
  Receipt,
  BookOpen,
} from 'lucide-react';

type EduReportType = 'STUDENTS' | 'FEE_COLLECTION' | 'PENDING_DUES' | 'BATCH_SUMMARY';

export const EduReportsView: React.FC = () => {
  const { t } = useTranslation();
  const { business } = useAuth();
  const currency = business?.currency || 'INR';

  const [activeReport, setActiveReport] = useState<EduReportType>('STUDENTS');
  const [students, setStudents] = useState<EduStudent[]>([]);
  const [batches, setBatches] = useState<EduBatch[]>([]);
  const [enrollments, setEnrollments] = useState<EduEnrollment[]>([]);
  const [payments, setPayments] = useState<EduFeePayment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const fetchAllReportData = async () => {
    try {
      setLoading(true);
      const [sData, bData, eData, pData] = await Promise.all([
        educationApi.getStudents().catch(() => []),
        educationApi.getBatches().catch(() => []),
        educationApi.getEnrollments().catch(() => []),
        educationApi.getFeePayments().catch(() => []),
      ]);
      setStudents(sData);
      setBatches(bData);
      setEnrollments(eData);
      setPayments(pData);
    } catch (err) {
      console.error('Failed to load education reports data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReportData();
  }, []);

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentIdNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search));
    const matchesBatch = selectedBatchId === 'ALL' || String(s.currentBatchId) === String(selectedBatchId);
    return matchesSearch && matchesBatch;
  });

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    return (
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Filtered Dues
  const filteredPendingDues = enrollments.filter((e) => {
    if (e.pendingAmount <= 0) return false;
    const matchesSearch =
      e.studentName.toLowerCase().includes(search.toLowerCase()) ||
      e.courseName.toLowerCase().includes(search.toLowerCase());
    const isOverdue = e.nextDueDate && new Date(e.nextDueDate) < new Date();
    const matchesStatus =
      selectedStatus === 'ALL' || (selectedStatus === 'OVERDUE' && isOverdue);
    return matchesSearch && matchesStatus;
  });

  // Filtered Batches
  const filteredBatches = batches.filter((b) => {
    return (
      b.batchName.toLowerCase().includes(search.toLowerCase()) ||
      (b.courseName && b.courseName.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `edu_report_${activeReport.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeReport === 'STUDENTS') {
      headers = [t('education.reports.studentId', 'Student ID'), t('education.reports.fullName', 'Full Name'), t('education.reports.phone', 'Phone'), t('education.reports.parentName', 'Parent Name'), t('education.reports.batch', 'Batch'), t('education.reports.admissionDate', 'Admission Date'), t('common.status', 'Status')];
      rows = filteredStudents.map((s) => [
        `"${s.studentIdNumber}"`,
        `"${s.fullName}"`,
        `"${s.phone}"`,
        `"${s.parentName || ''}"`,
        `"${s.currentBatchName || ''}"`,
        `"${s.admissionDate}"`,
        `"${s.status}"`,
      ]);
    } else if (activeReport === 'FEE_COLLECTION') {
      headers = [t('education.reports.receiptNumber', 'Receipt #'), t('education.reports.studentName', 'Student Name'), t('education.reports.paymentDate', 'Payment Date'), t('education.reports.method', 'Method'), t('education.reports.notes', 'Notes'), t('education.reports.amount', 'Amount')];
      rows = filteredPayments.map((p) => [
        `"${p.receiptNumber}"`,
        `"${p.studentName}"`,
        `"${p.paymentDate}"`,
        `"${p.paymentMethod}"`,
        `"${p.notes || ''}"`,
        `"${p.amount}"`,
      ]);
    } else if (activeReport === 'PENDING_DUES') {
      headers = [t('education.reports.studentName', 'Student Name'), t('education.reports.phone', 'Phone'), t('education.reports.course', 'Course'), t('education.reports.batch', 'Batch'), t('education.reports.netFee', 'Net Fee'), t('education.reports.paid', 'Paid'), t('education.reports.pending', 'Pending'), t('education.reports.nextDueDate', 'Next Due Date')];
      rows = filteredPendingDues.map((e) => [
        `"${e.studentName}"`,
        `"${e.studentPhone || ''}"`,
        `"${e.courseName}"`,
        `"${e.batchName || ''}"`,
        `"${e.netFees}"`,
        `"${e.paidAmount}"`,
        `"${e.pendingAmount}"`,
        `"${e.nextDueDate || ''}"`,
      ]);
    } else if (activeReport === 'BATCH_SUMMARY') {
      headers = [t('education.reports.batchName', 'Batch Name'), t('education.reports.course', 'Course'), t('education.reports.schedule', 'Schedule'), t('education.reports.startDate', 'Start Date'), t('education.reports.endDate', 'End Date'), t('education.reports.enrolled', 'Enrolled'), t('education.reports.capacity', 'Capacity')];
      rows = filteredBatches.map((b) => [
        `"${b.batchName}"`,
        `"${b.courseName || ''}"`,
        `"${b.schedule || ''}"`,
        `"${b.startDate || ''}"`,
        `"${b.endDate || ''}"`,
        `"${b.enrolledCount || 0}"`,
        `"${b.capacity || 30}"`,
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('reports.title', 'Reports & Documentation')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200 flex items-center gap-1.5">
              <FileText size={13} className="text-indigo-600" />
              <span>{t('education.reports.badge', 'Education Reports')}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('education.reports.subtitle', 'Generate and export student rosters, fee collections, pending dues accounts, and batch schedules.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Printer size={14} />
            <span>{t('common.print', 'Print Report')}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>{t('reports.exportCsv', 'Export CSV')}</span>
          </button>
        </div>
      </div>

      {/* Report Categories Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setActiveReport('STUDENTS');
            setSearch('');
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
            activeReport === 'STUDENTS'
              ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <GraduationCap size={16} />
            </div>
            <span className="text-xs font-black text-indigo-700">{students.length}</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">{t('education.reports.studentReport', 'Student Report')}</h4>
          <p className="text-[10px] text-slate-500">{t('education.reports.studentReportDesc', 'Student profiles & contacts')}</p>
        </button>

        <button
          onClick={() => {
            setActiveReport('FEE_COLLECTION');
            setSearch('');
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
            activeReport === 'FEE_COLLECTION'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CircleDollarSign size={16} />
            </div>
            <span className="text-xs font-black text-emerald-700">{payments.length}</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">{t('education.reports.feeReport', 'Fee Collection Report')}</h4>
          <p className="text-[10px] text-slate-500">{t('education.reports.feeReportDesc', 'Receipts & payment audit')}</p>
        </button>

        <button
          onClick={() => {
            setActiveReport('PENDING_DUES');
            setSearch('');
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
            activeReport === 'PENDING_DUES'
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Receipt size={16} />
            </div>
            <span className="text-xs font-black text-rose-700">
              {enrollments.filter((e) => e.pendingAmount > 0).length}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">{t('education.reports.duesReport', 'Pending Fee Report')}</h4>
          <p className="text-[10px] text-slate-500">{t('education.reports.duesReportDesc', 'Balances & overdue dues')}</p>
        </button>

        <button
          onClick={() => {
            setActiveReport('BATCH_SUMMARY');
            setSearch('');
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
            activeReport === 'BATCH_SUMMARY'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <BookOpen size={16} />
            </div>
            <span className="text-xs font-black text-blue-700">{batches.length}</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">{t('education.reports.batchReport', 'Batch Report')}</h4>
          <p className="text-[10px] text-slate-500">{t('education.reports.batchReportDesc', 'Classroom quotas & schedules')}</p>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={t('education.reports.searchPlaceholder', 'Search report records...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeReport === 'STUDENTS' && (
            <div className="flex items-center gap-1.5">
              <Filter size={13} className="text-slate-400" />
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
              >
                <option value="ALL">{t('education.reports.allBatches', 'All Batches')}</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeReport === 'PENDING_DUES' && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
            >
              <option value="ALL">{t('education.reports.allPending', 'All Pending Accounts')}</option>
              <option value="OVERDUE">{t('education.reports.overdueOnly', 'Overdue Accounts Only')}</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Report Table Preview Card */}
      <div className="clay-card p-5 space-y-4 print:p-0 print:border-none print:shadow-none">
        {/* Printable Report Header */}
        <div className="hidden print:block pb-4 border-b border-slate-300">
          <h2 className="text-lg font-black text-slate-950 uppercase">{business?.name || 'BizFlow Coaching'}</h2>
          <p className="text-xs text-slate-600">
            {activeReport === 'STUDENTS' && t('education.reports.studentTitle', 'Student Directory & Admissions Report')}
            {activeReport === 'FEE_COLLECTION' && t('education.reports.feeTitle', 'Fee Collection & Receipt Log Report')}
            {activeReport === 'PENDING_DUES' && t('education.reports.duesTitle', 'Outstanding Pending Fee Dues Report')}
            {activeReport === 'BATCH_SUMMARY' && t('education.reports.batchTitle', 'Course & Classroom Batch Summary Report')}
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            {t('education.reports.generatedOn', 'Generated on')}: {new Date().toLocaleString()}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* 1. STUDENT LIST REPORT TABLE */}
            {activeReport === 'STUDENTS' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                      <th className="pb-3">{t('education.reports.studentRoll', 'Student Roll / ID')}</th>
                      <th className="pb-3">{t('education.reports.fullName', 'Full Name')}</th>
                      <th className="pb-3">{t('education.reports.phone', 'Phone')}</th>
                      <th className="pb-3">{t('education.reports.parentNamePhone', 'Parent Name & Phone')}</th>
                      <th className="pb-3">{t('education.reports.assignedBatch', 'Assigned Batch')}</th>
                      <th className="pb-3">{t('education.reports.admissionDate', 'Admission Date')}</th>
                      <th className="pb-3 text-center">{t('common.status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          {t('education.reports.noStudentsFound', 'No student records found matching the filter.')}
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 font-mono font-bold text-slate-700">{s.studentIdNumber}</td>
                          <td className="py-2.5 font-bold text-slate-900">{s.fullName}</td>
                          <td className="py-2.5 text-slate-700 font-mono">{s.phone}</td>
                          <td className="py-2.5 text-slate-700">
                            {s.parentName ? `${s.parentName} (${s.parentPhone || '—'})` : '—'}
                          </td>
                          <td className="py-2.5">
                            <span className="font-semibold text-slate-800">{s.currentBatchName || t('common.unassigned', 'Unassigned')}</span>
                          </td>
                          <td className="py-2.5 text-slate-600 font-mono">{s.admissionDate}</td>
                          <td className="py-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {s.status === 'ACTIVE' ? t('common.active', 'ACTIVE') : s.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. FEE COLLECTION REPORT TABLE */}
            {activeReport === 'FEE_COLLECTION' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                      <th className="pb-3">{t('education.reports.receiptNumber', 'Receipt #')}</th>
                      <th className="pb-3">{t('education.reports.studentName', 'Student Name')}</th>
                      <th className="pb-3">{t('education.reports.paymentDate', 'Payment Date')}</th>
                      <th className="pb-3">{t('education.reports.paymentMethod', 'Payment Method')}</th>
                      <th className="pb-3">{t('education.reports.notes', 'Notes')}</th>
                      <th className="pb-3 text-right">{t('education.reports.amountCollected', 'Amount Collected')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          {t('education.reports.noPaymentsFound', 'No fee payment receipts recorded yet.')}
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 font-mono font-bold text-slate-900">{p.receiptNumber}</td>
                          <td className="py-2.5 font-bold text-slate-900">{p.studentName}</td>
                          <td className="py-2.5 text-slate-600 font-mono">{p.paymentDate}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-500">{p.notes || '—'}</td>
                          <td className="py-2.5 text-right font-black text-emerald-700">
                            {formatCurrency(p.amount, currency)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {filteredPayments.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 font-bold">
                        <td colSpan={5} className="py-3 text-right text-slate-700 uppercase text-[10px]">
                          {t('education.reports.totalCollected', 'Total Collected:')}
                        </td>
                        <td className="py-3 text-right text-sm font-black text-emerald-700">
                          {formatCurrency(
                            filteredPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0),
                            currency
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}

            {/* 3. PENDING FEE DUES REPORT TABLE */}
            {activeReport === 'PENDING_DUES' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                      <th className="pb-3">{t('education.reports.studentName', 'Student Name')}</th>
                      <th className="pb-3">{t('education.reports.phone', 'Phone')}</th>
                      <th className="pb-3">{t('education.reports.courseBatch', 'Course & Batch')}</th>
                      <th className="pb-3 text-right">{t('education.reports.totalNetFee', 'Total Net Fee')}</th>
                      <th className="pb-3 text-right">{t('education.reports.paidAmount', 'Paid Amount')}</th>
                      <th className="pb-3 text-right">{t('education.reports.pendingBalance', 'Pending Balance')}</th>
                      <th className="pb-3">{t('education.reports.nextDueDate', 'Next Due Date')}</th>
                      <th className="pb-3 text-center">{t('common.status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPendingDues.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          {t('education.reports.noDuesFound', 'No pending fee records found.')}
                        </td>
                      </tr>
                    ) : (
                      filteredPendingDues.map((e) => {
                        const isOverdue = e.nextDueDate && new Date(e.nextDueDate) < new Date();
                        return (
                          <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 font-bold text-slate-900">{e.studentName}</td>
                            <td className="py-2.5 text-slate-600 font-mono">{e.studentPhone || '—'}</td>
                            <td className="py-2.5">
                              <span className="font-semibold text-slate-800">{e.courseName}</span>
                              <span className="text-[10px] text-indigo-600 block">{e.batchName}</span>
                            </td>
                            <td className="py-2.5 text-right font-semibold text-slate-900">
                              {formatCurrency(e.netFees, currency)}
                            </td>
                            <td className="py-2.5 text-right font-bold text-emerald-700">
                              {formatCurrency(e.paidAmount, currency)}
                            </td>
                            <td className="py-2.5 text-right font-black text-rose-600">
                              {formatCurrency(e.pendingAmount, currency)}
                            </td>
                            <td className="py-2.5 font-mono text-[11px]">
                              <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                                {e.nextDueDate || '—'}
                              </span>
                            </td>
                            <td className="py-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isOverdue
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {isOverdue ? t('education.reports.overdue', 'OVERDUE') : e.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {filteredPendingDues.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 font-bold">
                        <td colSpan={5} className="py-3 text-right text-slate-700 uppercase text-[10px]">
                          {t('education.reports.totalOutstanding', 'Total Outstanding Balance:')}
                        </td>
                        <td className="py-3 text-right text-sm font-black text-rose-600">
                          {formatCurrency(
                            filteredPendingDues.reduce((acc, e) => acc + (Number(e.pendingAmount) || 0), 0),
                            currency
                          )}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}

            {/* 4. BATCH & COURSE SUMMARY REPORT */}
            {activeReport === 'BATCH_SUMMARY' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                      <th className="pb-3">{t('education.reports.batchName', 'Batch Name')}</th>
                      <th className="pb-3">{t('education.reports.courseCurriculum', 'Course Curriculum')}</th>
                      <th className="pb-3">{t('education.reports.weeklySchedule', 'Weekly Schedule')}</th>
                      <th className="pb-3">{t('education.reports.startDate', 'Start Date')}</th>
                      <th className="pb-3">{t('education.reports.endDate', 'End Date')}</th>
                      <th className="pb-3 text-center">{t('education.reports.enrolledCapacity', 'Enrolled / Capacity')}</th>
                      <th className="pb-3 text-center">{t('education.reports.occupancyRate', 'Occupancy Rate')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBatches.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          {t('education.reports.noBatchesFound', 'No batches found.')}
                        </td>
                      </tr>
                    ) : (
                      filteredBatches.map((b) => {
                        const enrolled = b.enrolledCount || 0;
                        const cap = b.capacity || 30;
                        const pct = Math.min(Math.round((enrolled / cap) * 100), 100);

                        return (
                          <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 font-bold text-slate-900">{b.batchName}</td>
                            <td className="py-2.5 font-semibold text-slate-800">{b.courseName || t('education.course', 'Course')}</td>
                            <td className="py-2.5 text-slate-600">{b.schedule}</td>
                            <td className="py-2.5 text-slate-600 font-mono">{b.startDate || '—'}</td>
                            <td className="py-2.5 text-slate-600 font-mono">{b.endDate || t('education.reports.ongoing', 'Ongoing')}</td>
                            <td className="py-2.5 text-center font-mono font-bold text-slate-800">
                              {enrolled} / {cap}
                            </td>
                            <td className="py-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  pct >= 90
                                    ? 'bg-rose-50 text-rose-700'
                                    : pct >= 60
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                {pct}%
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
