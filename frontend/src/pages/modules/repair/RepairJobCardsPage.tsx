import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency } from '../../../utils/currency';
import {
  repairApi,
  RepairJobCard,
} from '../../../api/modules';
import { RepairJobCardPrintModal } from './RepairJobCardPrintModal';
import {
  Wrench,
  Plus,
  Search,
  Clock,
  Printer,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const RepairJobCardsPage: React.FC = () => {
  const { t } = useTranslation();
  const { business } = useAuth();
  const currency = business?.currency || 'INR';

  const [jobCards, setJobCards] = useState<RepairJobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedJobForSlip, setSelectedJobForSlip] = useState<RepairJobCard | null>(null);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [itemType, setItemType] = useState('Smartphone');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialOrImei, setSerialOrImei] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [diagnosticNotes, setDiagnosticNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number | ''>('');
  const [technician, setTechnician] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [estDate, setEstDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Edit / Status Modal State
  const [editingJob, setEditingJob] = useState<RepairJobCard | null>(null);
  const [editWork, setEditWork] = useState('');
  const [editDiag, setEditDiag] = useState('');
  const [editPartsCost, setEditPartsCost] = useState<number | ''>('');
  const [editLabourCost, setEditLabourCost] = useState<number | ''>('');
  const [editStatus, setEditStatus] = useState<RepairJobCard['status']>('RECEIVED');
  const [editPaymentStatus, setEditPaymentStatus] = useState<RepairJobCard['paymentStatus']>('PENDING');

  const fetchJobCards = async () => {
    try {
      setLoading(true);
      const data = await repairApi.getJobCards({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setJobCards(data);
    } catch (err) {
      console.error('Failed to load repair job cards', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobCards();
  }, [search, statusFilter]);

  const handleCreateJobCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;

    try {
      await repairApi.createJobCard({
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        itemType: itemType.trim() || 'Device',
        brand: brand.trim(),
        model: model.trim(),
        serialOrImei: serialOrImei.trim() || undefined,
        problemDescription: problemDescription.trim(),
        diagnosticNotes: diagnosticNotes.trim() || undefined,
        totalEstimatedCost: Number(estimatedCost) || 0,
        assignedTechnician: technician.trim() || 'Senior Technician',
        priority,
        estimatedCompletionDate: estDate,
      });

      setShowCreateModal(false);
      resetCreateForm();
      fetchJobCards();
    } catch (err) {
      console.error('Failed to create job card', err);
    }
  };

  const handleOpenEdit = (job: RepairJobCard) => {
    setEditingJob(job);
    setEditWork(job.workPerformed || '');
    setEditDiag(job.diagnosticNotes || '');
    setEditPartsCost(job.partsCost || '');
    setEditLabourCost(job.labourCost || '');
    setEditStatus(job.status);
    setEditPaymentStatus(job.paymentStatus);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    try {
      const parts = Number(editPartsCost) || 0;
      const labour = Number(editLabourCost) || 0;
      await repairApi.updateJobCard(editingJob.id, {
        diagnosticNotes: editDiag.trim(),
        workPerformed: editWork.trim(),
        partsCost: parts,
        labourCost: labour,
        totalFinalCost: parts + labour,
        status: editStatus,
        paymentStatus: editPaymentStatus,
      });

      setEditingJob(null);
      fetchJobCards();
    } catch (err) {
      console.error('Failed to update job card', err);
    }
  };

  const resetCreateForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerAddress('');
    setItemType('Smartphone');
    setBrand('');
    setModel('');
    setSerialOrImei('');
    setProblemDescription('');
    setDiagnosticNotes('');
    setEstimatedCost('');
    setTechnician('');
    setPriority('NORMAL');
  };

  const receivedCount = jobCards.filter((j) => j.status === 'RECEIVED' || j.status === 'DIAGNOSING').length;
  const repairingCount = jobCards.filter((j) => j.status === 'REPAIRING').length;
  const readyCount = jobCards.filter((j) => j.status === 'READY').length;
  const deliveredCount = jobCards.filter((j) => j.status === 'DELIVERED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('repair.pageTitle', 'Repair & Service Job Cards')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-800 text-xs font-bold border border-violet-200 flex items-center gap-1.5">
              <Wrench size={12} className="text-violet-600" />
              <span>{t('repair.moduleTag', 'Repair Module')}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('repair.pageSubtitle', 'Job card ticketing, device diagnostics, technician assignments, and pickup dispatch.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/dashboard/repairs/tracking"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Clock size={14} className="text-violet-600" />
            <span>{t('repair.trackRepair', 'Track Repair')}</span>
          </Link>

          <button
            onClick={() => {
              resetCreateForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>{t('repair.newJobCard', 'New Job Card')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('repair.inIntake', 'In Intake / Diag')}</span>
          <div className="text-2xl font-black text-slate-900">{receivedCount}</div>
          <p className="text-[10px] text-slate-400">{t('repair.receivedDevices', 'Received devices')}</p>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{t('repair.underRepair', 'Under Repair')}</span>
          <div className="text-2xl font-black text-blue-600">{repairingCount}</div>
          <p className="text-[10px] text-blue-700">{t('repair.onWorkbench', 'On workbench')}</p>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{t('repair.readyForPickup', 'Ready for Pickup')}</span>
          <div className="text-2xl font-black text-emerald-600">{readyCount}</div>
          <p className="text-[10px] text-emerald-700">{t('repair.customerNotified', 'Customer notified')}</p>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('repair.delivered', 'Delivered')}</span>
          <div className="text-2xl font-black text-slate-900">{deliveredCount}</div>
          <p className="text-[10px] text-slate-400">{t('repair.completedJobs', 'Completed jobs')}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={t('repair.searchJobCards', 'Search by Job #, Customer, Device, or S/N...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'RECEIVED', 'DIAGNOSING', 'REPAIRING', 'READY', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? t('common.all', 'ALL') : t(`repair.status.${st}`, st)}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards Table */}
      <div className="clay-card p-5 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : jobCards.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Wrench size={32} className="mx-auto text-slate-300" />
            <p className="font-bold text-slate-800 text-sm">{t('repair.noJobsFound', 'No repair job cards found')}</p>
            <p className="text-xs text-slate-400">{t('repair.clickNewJob', 'Click "New Job Card" to intake a device for diagnosis and repair.')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                  <th className="pb-3">{t('repair.jobCardNo', 'Job Card #')}</th>
                  <th className="pb-3">{t('repair.customer', 'Customer')}</th>
                  <th className="pb-3">{t('repair.deviceAndProblem', 'Device & Problem')}</th>
                  <th className="pb-3">{t('repair.technician', 'Technician')}</th>
                  <th className="pb-3">{t('repair.costEstFinal', 'Cost (Est/Final)')}</th>
                  <th className="pb-3 text-center">{t('common.status', 'Status')}</th>
                  <th className="pb-3 text-right">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobCards.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900">
                      <div>{job.jobCardNumber}</div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 ${
                        job.priority === 'URGENT'
                          ? 'bg-rose-100 text-rose-800'
                          : job.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t(`repair.priority.${job.priority}`, job.priority)}
                      </span>
                    </td>

                    <td className="py-3 font-semibold text-slate-800">
                      <div>{job.customerName}</div>
                      <span className="text-[10px] text-slate-400 font-mono block">{job.customerPhone}</span>
                    </td>

                    <td className="py-3">
                      <div className="font-bold text-slate-900">{job.brand} {job.model} ({job.itemType})</div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{job.problemDescription}</p>
                    </td>

                    <td className="py-3 text-slate-600">
                      {job.assignedTechnician || t('repair.unassigned', 'Unassigned')}
                    </td>

                    <td className="py-3 font-black text-slate-900">
                      <div>{formatCurrency(job.totalFinalCost || job.totalEstimatedCost, currency)}</div>
                      <span className={`text-[9px] font-bold ${
                        job.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {t(`repair.paymentStatus.${job.paymentStatus}`, job.paymentStatus)}
                      </span>
                    </td>

                    <td className="py-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          job.status === 'DELIVERED'
                            ? 'bg-slate-100 text-slate-800'
                            : job.status === 'READY'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : job.status === 'REPAIRING'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : job.status === 'DIAGNOSING'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {t(`repair.status.${job.status}`, job.status)}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(job)}
                          className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 font-bold text-[10px] cursor-pointer"
                        >
                          {t('repair.updateStatus', 'Update Status')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedJobForSlip(job)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                          title={t('repair.printSlip', 'Print Handover Slip')}
                        >
                          <Printer size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE JOB CARD MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">{t('repair.intakeTitle', 'Intake Device & Create Job Card')}</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateJobCard} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('repair.customerNameOpt', 'Customer Name (Optional)')}</label>
                  <input
                    type="text"
                    placeholder={t('placeholders.customerNameExample', 'e.g. Vikram Joshi')}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('repair.customerPhoneOpt', 'Customer Phone (Optional)')}</label>
                  <input
                    type="tel"
                    placeholder={t('placeholders.phoneExample', 'e.g. 9812345678')}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('repair.customerEmailOpt', 'Customer Email (Optional)')}</label>
                  <input
                    type="email"
                    placeholder={t('placeholders.emailExample', 'e.g. customer@example.com')}
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('repair.customerAddressOpt', 'Customer Address (Optional)')}</label>
                  <input
                    type="text"
                    placeholder={t('placeholders.addressExample', 'e.g. 45 Park Avenue, City')}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('repair.itemType', 'Item Type')}</label>
                  <input
                    type="text"
                    placeholder={t('placeholders.itemTypeExample', 'e.g. Laptop, Phone')}
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('repair.brand', 'Brand')}</label>
                  <input
                    type="text"
                    placeholder={t('placeholders.brandExample', 'e.g. HP, Sony')}
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('repair.model', 'Model')}</label>
                  <input
                    type="text"
                    placeholder={t('placeholders.modelExample', 'e.g. Pavilion 15')}
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t('repair.serialOrImeiOpt', 'Serial Number / IMEI (Optional)')}</label>
                <input
                  type="text"
                  placeholder={t('placeholders.serialExample', 'e.g. 5CD1234XYZ')}
                  value={serialOrImei}
                  onChange={(e) => setSerialOrImei(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t('repair.problemDescRequired', 'Problem Description *')}</label>
                <textarea
                  rows={2}
                  required
                  placeholder={t('repair.problemPlaceholder', 'Customer complaints (e.g. screen flickering, no power, battery drain)...')}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('repair.estimatedCost', 'Estimated Cost')} ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 2500"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('repair.assignTechnician', 'Assign Technician')}</label>
                  <input
                    type="text"
                    placeholder={t('placeholders.technicianExample', 'e.g. Rajesh Kumar')}
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('repair.priority', 'Priority')}</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="NORMAL">{t('repair.priorityNormal', 'Normal')}</option>
                    <option value="HIGH">{t('repair.priorityHigh', 'High')}</option>
                    <option value="URGENT">{t('repair.priorityUrgent', 'Urgent (Express)')}</option>
                    <option value="LOW">{t('repair.priorityLow', 'Low')}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('repair.estCompletion', 'Est. Completion')}</label>
                  <input
                    type="date"
                    value={estDate}
                    onChange={(e) => setEstDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {t('repair.createJobCardBtn', 'Create Job Card')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / PROGRESS MODAL */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t('repair.updateJobTitle', 'Update Job {{number}}', { number: editingJob.jobCardNumber })}
                </h3>
                <p className="text-[11px] text-slate-400">{editingJob.customerName} • {editingJob.brand} {editingJob.model}</p>
              </div>
              <button
                onClick={() => setEditingJob(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t('repair.repairStatusRequired', 'Repair Status *')}</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  <option value="RECEIVED">{t('repair.statusOpt.RECEIVED', 'RECEIVED (Intake)')}</option>
                  <option value="DIAGNOSING">{t('repair.statusOpt.DIAGNOSING', 'DIAGNOSING (Bench Testing)')}</option>
                  <option value="REPAIRING">{t('repair.statusOpt.REPAIRING', 'REPAIRING (In Progress)')}</option>
                  <option value="READY">{t('repair.statusOpt.READY', 'READY (Ready for Pickup)')}</option>
                  <option value="DELIVERED">{t('repair.statusOpt.DELIVERED', 'DELIVERED (Handed over)')}</option>
                  <option value="CANCELLED">{t('repair.statusOpt.CANCELLED', 'CANCELLED')}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t('repair.diagFindings', 'Diagnostic Findings')}</label>
                <textarea
                  rows={2}
                  placeholder={t('repair.diagPlaceholder', 'Root cause diagnosis...')}
                  value={editDiag}
                  onChange={(e) => setEditDiag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t('repair.workPerformedParts', 'Work Performed / Parts Replaced')}</label>
                <textarea
                  rows={2}
                  placeholder={t('repair.workPerformedPlaceholder', 'e.g. Replaced display IC and motherboard capacitor...')}
                  value={editWork}
                  onChange={(e) => setEditWork(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('repair.partsCost', 'Parts Cost')} ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={editPartsCost}
                    onChange={(e) => setEditPartsCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('repair.labourCost', 'Labour / Service Cost')} ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={editLabourCost}
                    onChange={(e) => setEditLabourCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t('repair.paymentSettlement', 'Payment Settlement')}</label>
                <select
                  value={editPaymentStatus}
                  onChange={(e) => setEditPaymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="PENDING">{t('repair.pendingCollect', 'PENDING (Collect upon delivery)')}</option>
                  <option value="PAID">{t('repair.paidSettled', 'PAID (Settled)')}</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {t('repair.saveProgress', 'Save Progress')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE REPAIR JOB CARD HANDOVER SLIP MODAL */}
      {selectedJobForSlip && (
        <RepairJobCardPrintModal
          jobCard={selectedJobForSlip}
          onClose={() => setSelectedJobForSlip(null)}
        />
      )}
    </div>
  );
};
