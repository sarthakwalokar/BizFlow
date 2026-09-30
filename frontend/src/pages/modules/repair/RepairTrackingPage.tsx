import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency } from '../../../utils/currency';
import { repairApi, RepairJobCard } from '../../../api/modules';
import {
  Wrench,
  Search,
  Clock,
} from 'lucide-react';

export const RepairTrackingPage: React.FC = () => {
  const { business } = useAuth();
  const currency = business?.currency || 'INR';

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RepairJobCard[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const data = await repairApi.getJobCards({ search: query.trim() });
      setResults(data);
    } catch (err) {
      console.error('Failed to search repair jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const getStepActive = (currentStatus: string, step: string) => {
    const order = ['RECEIVED', 'DIAGNOSING', 'REPAIRING', 'READY', 'DELIVERED'];
    const curIdx = order.indexOf(currentStatus);
    const stepIdx = order.indexOf(step);
    return curIdx >= stepIdx;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Repair Status Tracker &amp; History
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-800 text-xs font-bold border border-violet-200 flex items-center gap-1.5">
            <Clock size={13} className="text-violet-600" />
            <span>Tracking Center</span>
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track stage-wise diagnostic status, parts replacement history, and customer job cards.
        </p>
      </div>

      {/* Search Bar */}
      <div className="clay-card p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              required
              placeholder="Search by Job Card Number (e.g. JOB-1001) or Customer Phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-violet-500/20 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Search size={15} />
            <span>{loading ? 'Searching...' : 'Track Job'}</span>
          </button>
        </form>
      </div>

      {/* Results List */}
      {searched && (
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="clay-card p-10 text-center text-slate-400 space-y-2">
              <Wrench size={32} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-800 text-sm">No repair records matching "{query}"</p>
              <p className="text-xs text-slate-400">Verify the job card number or contact phone number.</p>
            </div>
          ) : (
            results.map((job) => (
              <div key={job.id} className="clay-card p-6 sm:p-7 space-y-6">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900 font-mono">{job.jobCardNumber}</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                        {job.itemType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-bold">
                      {job.brand} {job.model} • Owner: {job.customerName} ({job.customerPhone})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-violet-100 text-violet-900 border border-violet-200">
                      {job.status}
                    </span>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      Target: {job.estimatedCompletionDate || 'Standard turnaround'}
                    </p>
                  </div>
                </div>

                {/* Progress Step Bar */}
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold">
                  {[
                    { key: 'RECEIVED', label: '1. Received' },
                    { key: 'DIAGNOSING', label: '2. Diagnosing' },
                    { key: 'REPAIRING', label: '3. Repairing' },
                    { key: 'READY', label: '4. Ready' },
                    { key: 'DELIVERED', label: '5. Delivered' },
                  ].map((step) => {
                    const active = getStepActive(job.status, step.key);
                    return (
                      <div key={step.key} className="space-y-1.5">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            active ? 'bg-violet-600' : 'bg-slate-200'
                          }`}
                        />
                        <span className={active ? 'text-violet-900' : 'text-slate-400'}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Diagnostics and Repair notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Reported Problem</span>
                    <p className="text-slate-900 font-medium">{job.problemDescription}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Work Performed</span>
                    <p className="text-slate-900 font-medium">
                      {job.workPerformed || 'Awaiting completion log from technician.'}
                    </p>
                  </div>
                </div>

                {/* Costs & Settlement */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-slate-600">
                    <span>Parts: {formatCurrency(job.partsCost || 0, currency)}</span>
                    <span>+</span>
                    <span>Labour: {formatCurrency(job.labourCost || 0, currency)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600">Total Charge:</span>
                    <span className="text-lg font-black text-slate-950">
                      {formatCurrency(job.totalFinalCost || job.totalEstimatedCost, currency)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      job.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {job.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
