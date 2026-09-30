import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency } from '../../../utils/currency';
import {
  educationApi,
  EduEnrollment,
  EduFeePayment,
} from '../../../api/modules';
import {
  DollarSign,
  Receipt,
  CheckCircle2,
  Printer,
  X,
  Search,
} from 'lucide-react';

export const EduFeeManagementPage: React.FC = () => {
  const { business } = useAuth();
  const currency = business?.currency || 'INR';

  const [enrollments, setEnrollments] = useState<EduEnrollment[]>([]);
  const [payments, setPayments] = useState<EduFeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'DUES' | 'HISTORY'>('DUES');
  const [search, setSearch] = useState('');

  // Collect Fee Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EduEnrollment | null>(null);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [currentReceiptData, setCurrentReceiptData] = useState<{
    receiptNumber: string;
    studentName: string;
    studentPhone?: string;
    courseName?: string;
    batchName?: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    notes?: string;
    totalFees?: number;
    paidAmount?: number;
    pendingAmount?: number;
    nextDueDate?: string;
  } | null>(null);

  const fetchDuesAndPayments = async () => {
    try {
      setLoading(true);
      const [eData, pData] = await Promise.all([
        educationApi.getEnrollments(statusFilter !== 'ALL' && statusFilter !== 'OVERDUE' ? statusFilter : undefined),
        educationApi.getFeePayments(),
      ]);
      setEnrollments(eData);
      setPayments(pData);
    } catch (err) {
      console.error('Failed to load fee dues and payments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuesAndPayments();
  }, [statusFilter]);

  const handleOpenPayModal = (enrollment: EduEnrollment) => {
    setSelectedEnrollment(enrollment);
    setPayAmount(enrollment.pendingAmount > 0 ? enrollment.pendingAmount : '');
    setPayMethod('CASH');
    setPayDate(new Date().toISOString().split('T')[0]);
    setNextDueDate('');
    setNotes('');
    setShowPayModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment || !payAmount || Number(payAmount) <= 0) return;

    try {
      setIsSubmitting(true);
      const updatedEnrollment = await educationApi.recordFeePayment({
        enrollmentId: selectedEnrollment.id,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        paymentDate: payDate,
        notes: notes.trim() || undefined,
        nextDueDate: nextDueDate || undefined,
      });

      setShowPayModal(false);

      // Generate receipt preview for current payment
      const receiptNum = 'REC-' + Math.floor(100000 + Math.random() * 900000);
      setCurrentReceiptData({
        receiptNumber: receiptNum,
        studentName: selectedEnrollment.studentName,
        studentPhone: selectedEnrollment.studentPhone,
        courseName: selectedEnrollment.courseName,
        batchName: selectedEnrollment.batchName,
        amount: Number(payAmount),
        paymentDate: payDate,
        paymentMethod: payMethod,
        notes: notes.trim() || undefined,
        totalFees: selectedEnrollment.totalFees,
        paidAmount: updatedEnrollment.paidAmount,
        pendingAmount: updatedEnrollment.pendingAmount,
        nextDueDate: nextDueDate || updatedEnrollment.nextDueDate,
      });
      setReceiptModalOpen(true);

      fetchDuesAndPayments();
    } catch (err) {
      console.error('Failed to record fee payment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewPastReceipt = (payment: EduFeePayment) => {
    const relatedEnrollment = enrollments.find((e) => e.id === payment.enrollmentId);
    setCurrentReceiptData({
      receiptNumber: payment.receiptNumber,
      studentName: payment.studentName,
      studentPhone: relatedEnrollment?.studentPhone,
      courseName: relatedEnrollment?.courseName,
      batchName: relatedEnrollment?.batchName,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      notes: payment.notes,
      totalFees: relatedEnrollment?.totalFees,
      paidAmount: relatedEnrollment?.paidAmount,
      pendingAmount: relatedEnrollment?.pendingAmount,
      nextDueDate: relatedEnrollment?.nextDueDate,
    });
    setReceiptModalOpen(true);
  };

  const totalCollected = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalPendingDues = enrollments.reduce((acc, e) => acc + (Number(e.pendingAmount) || 0), 0);
  const overdueCount = enrollments.filter((e) => {
    return e.pendingAmount > 0 && e.nextDueDate && new Date(e.nextDueDate) < new Date();
  }).length;

  const filteredEnrollments = enrollments.filter((e) => {
    const matchesSearch =
      e.studentName.toLowerCase().includes(search.toLowerCase()) ||
      (e.studentPhone && e.studentPhone.toLowerCase().includes(search.toLowerCase())) ||
      (e.courseName && e.courseName.toLowerCase().includes(search.toLowerCase())) ||
      (e.batchName && e.batchName.toLowerCase().includes(search.toLowerCase()));

    if (statusFilter === 'OVERDUE') {
      const isOverdue = e.pendingAmount > 0 && e.nextDueDate && new Date(e.nextDueDate) < new Date();
      return matchesSearch && isOverdue;
    }

    return matchesSearch;
  });

  const filteredPayments = payments.filter((p) =>
    p.studentName.toLowerCase().includes(search.toLowerCase()) ||
    p.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.paymentMethod.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Fee Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
              <DollarSign size={13} className="text-emerald-600" />
              <span>Tuition Fees</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track student fee packages, paid installments, pending balances, due dates, and generate fee receipts.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Collected</span>
          <div className="text-2xl font-black text-emerald-600">{formatCurrency(totalCollected, currency)}</div>
          <p className="text-[10px] text-emerald-700">{payments.length} fee receipts recorded</p>
        </div>

        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Pending Dues</span>
          <div className="text-2xl font-black text-rose-600">{formatCurrency(totalPendingDues, currency)}</div>
          <p className="text-[10px] text-rose-700">Outstanding student balances</p>
        </div>

        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Overdue Accounts</span>
          <div className="text-2xl font-black text-amber-600">{overdueCount}</div>
          <p className="text-[10px] text-amber-700">Passed payment due date</p>
        </div>

        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
          <div className="text-2xl font-black text-slate-900">{enrollments.length}</div>
          <p className="text-[10px] text-slate-400">Tuition accounts</p>
        </div>
      </div>

      {/* Tabs & Search Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('DUES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'DUES'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Student Fee Dues ({enrollments.length})
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Payment Receipts History ({payments.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'DUES' && (
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              {['ALL', 'PENDING', 'PARTIAL', 'PAID', 'OVERDUE'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}

          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'DUES' ? 'Search students or courses...' : 'Search receipts...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: DUES TABLE */}
      {activeTab === 'DUES' && (
        <div className="clay-card p-5 space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Receipt size={32} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-800 text-sm">No student fee records found</p>
              <p className="text-xs text-slate-400">Admit students into courses to track fee dues and payments.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Course &amp; Batch</th>
                    <th className="pb-3 text-right">Total Course Fee</th>
                    <th className="pb-3 text-right">Paid Amount</th>
                    <th className="pb-3 text-right">Pending Balance</th>
                    <th className="pb-3">Next Due Date</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEnrollments.map((enr) => {
                    const isOverdue =
                      enr.pendingAmount > 0 && enr.nextDueDate && new Date(enr.nextDueDate) < new Date();

                    return (
                      <tr key={enr.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Student Name */}
                        <td className="py-3 font-bold text-slate-900">
                          <div>{enr.studentName}</div>
                          <span className="text-[10px] text-slate-400 font-mono font-normal">
                            {enr.studentPhone || 'No phone'}
                          </span>
                        </td>

                        {/* Course & Batch */}
                        <td className="py-3">
                          <span className="font-semibold text-slate-800 block">{enr.courseName}</span>
                          <span className="text-[10px] text-indigo-600 font-bold">{enr.batchName}</span>
                        </td>

                        {/* Total Course Fee */}
                        <td className="py-3 text-right font-black text-slate-900">
                          {formatCurrency(enr.totalFees, currency)}
                        </td>

                        {/* Paid Amount */}
                        <td className="py-3 text-right font-bold text-emerald-700">
                          {formatCurrency(enr.paidAmount, currency)}
                        </td>

                        {/* Pending Balance */}
                        <td className="py-3 text-right font-black text-rose-600">
                          {formatCurrency(enr.pendingAmount, currency)}
                        </td>

                        {/* Due Date */}
                        <td className="py-3 font-mono text-[11px]">
                          <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                            {enr.nextDueDate || '—'}
                          </span>
                          {isOverdue && (
                            <span className="block text-[9px] text-rose-600 uppercase font-black">
                              OVERDUE
                            </span>
                          )}
                        </td>

                        {/* Payment Status */}
                        <td className="py-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              enr.paymentStatus === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : enr.paymentStatus === 'PARTIAL'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {enr.paymentStatus}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3 text-right">
                          {enr.pendingAmount > 0 ? (
                            <button
                              onClick={() => handleOpenPayModal(enr)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                            >
                              Collect Fee
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1">
                              <CheckCircle2 size={13} />
                              <span>Cleared</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HISTORY TABLE */}
      {activeTab === 'HISTORY' && (
        <div className="clay-card p-5 space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Receipt size={32} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-800 text-sm">No payment receipts found</p>
              <p className="text-xs text-slate-400">Fee installments will appear here once recorded.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                    <th className="pb-3">Receipt #</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Payment Date</th>
                    <th className="pb-3">Payment Mode</th>
                    <th className="pb-3">Notes</th>
                    <th className="pb-3 text-right">Amount Paid</th>
                    <th className="pb-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-900">
                        {p.receiptNumber}
                      </td>

                      <td className="py-3 font-semibold text-slate-800">
                        {p.studentName}
                      </td>

                      <td className="py-3 text-slate-600 font-mono">
                        {p.paymentDate}
                      </td>

                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {p.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3 text-slate-500 max-w-xs truncate">
                        {p.notes || '—'}
                      </td>

                      <td className="py-3 text-right font-black text-emerald-700 text-sm">
                        {formatCurrency(p.amount, currency)}
                      </td>

                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleViewPastReceipt(p)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Printer size={12} />
                          <span>View Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* COLLECT FEE MODAL */}
      {showPayModal && selectedEnrollment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Record Fee Installment</h3>
                <p className="text-[11px] text-slate-400">
                  {selectedEnrollment.studentName} • {selectedEnrollment.courseName} ({selectedEnrollment.batchName})
                </p>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              {/* Balances summary box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Course Fee</span>
                  <span className="text-xs font-bold text-slate-900">
                    {formatCurrency(selectedEnrollment.totalFees, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Already Paid</span>
                  <span className="text-xs font-bold text-emerald-700">
                    {formatCurrency(selectedEnrollment.paidAmount, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Pending Due</span>
                  <span className="text-xs font-black text-rose-600">
                    {formatCurrency(selectedEnrollment.pendingAmount, currency)}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Amount to Collect ({currency}) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min={1}
                  max={selectedEnrollment.pendingAmount}
                  placeholder="e.g. 5000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Payment Mode</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CARD">Debit / Credit Card</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Next Due Date (If remaining balance exists)</label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Receipt Notes / Remarks (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Installment 1 of 3, Cheque #12345"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Collect & Issue Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE FEE RECEIPT MODAL */}
      {receiptModalOpen && currentReceiptData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 receipt-modal-backdrop">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[95vh] overflow-y-auto print:p-0 print:border-none print:shadow-none receipt-modal-container">
            {/* Header (Hidden in Print for clean layout) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Fee Receipt Generated</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer size={13} />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setReceiptModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper Container */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-4 text-xs font-sans print:border-none print:bg-white print:p-0">
              {/* Institute Branding Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-base font-black text-slate-950 uppercase tracking-tight">
                    {business?.name || 'Coaching & Training Institute'}
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {business?.address || 'Official Coaching Center'}
                  </p>
                  {business?.phone && (
                    <p className="text-[10px] text-slate-500 font-mono">Phone: {business.phone}</p>
                  )}
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-200 inline-block uppercase">
                    Fee Receipt
                  </span>
                  <p className="text-[11px] font-mono font-bold text-slate-900 mt-1">
                    {currentReceiptData.receiptNumber}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Date: {currentReceiptData.paymentDate}
                  </p>
                </div>
              </div>

              {/* Student Details Card */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Student Name</span>
                  <span className="font-bold text-slate-900 text-sm block">
                    {currentReceiptData.studentName}
                  </span>
                  {currentReceiptData.studentPhone && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      Phone: {currentReceiptData.studentPhone}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Course &amp; Batch</span>
                  <span className="font-bold text-slate-900 block">
                    {currentReceiptData.courseName || 'Coaching Course'}
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold block">
                    {currentReceiptData.batchName || 'Regular Batch'}
                  </span>
                </div>
              </div>

              {/* Payment Summary Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Payment Mode:</span>
                  <span className="font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100 text-[10px]">
                    {currentReceiptData.paymentMethod}
                  </span>
                </div>

                {currentReceiptData.totalFees !== undefined && (
                  <div className="flex items-center justify-between py-1 text-slate-600">
                    <span>Total Course Fee:</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(currentReceiptData.totalFees, currency)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-2 bg-emerald-50 px-3 rounded-xl border border-emerald-100 text-emerald-950">
                  <span className="font-bold text-xs">Amount Received:</span>
                  <span className="font-black text-base text-emerald-700">
                    {formatCurrency(currentReceiptData.amount, currency)}
                  </span>
                </div>

                {currentReceiptData.pendingAmount !== undefined && (
                  <div className="flex items-center justify-between py-1 text-slate-600">
                    <span>Remaining Balance:</span>
                    <span className="font-black text-rose-600">
                      {formatCurrency(currentReceiptData.pendingAmount, currency)}
                    </span>
                  </div>
                )}

                {currentReceiptData.nextDueDate && (
                  <div className="flex items-center justify-between py-1 text-slate-500 text-[10px] font-mono">
                    <span>Next Due Date:</span>
                    <span>{currentReceiptData.nextDueDate}</span>
                  </div>
                )}

                {currentReceiptData.notes && (
                  <div className="pt-2 text-[11px] text-slate-500 italic">
                    Note: "{currentReceiptData.notes}"
                  </div>
                )}
              </div>

              {/* Signatures & Footer */}
              <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
                <div className="text-[10px] text-slate-400">
                  <p>This is a computer-generated fee receipt.</p>
                  <p>Thank you for learning with us!</p>
                </div>

                <div className="text-center">
                  <div className="h-10 border-b border-slate-300 w-32 mb-1" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                    Authorized Signatory
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 print:hidden">
              <button
                type="button"
                onClick={() => setReceiptModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <Printer size={13} />
                <span>Print Fee Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
