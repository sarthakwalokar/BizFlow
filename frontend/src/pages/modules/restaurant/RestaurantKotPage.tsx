import React, { useState, useEffect } from 'react';
import { restaurantApi, RestaurantKotTicket } from '../../../api/modules';
import {
  ChefHat,
  CheckCircle2,
  RefreshCw,
  Printer,
  Flame,
  UtensilsCrossed,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react';

export const RestaurantKotPage: React.FC = () => {
  const [kots, setKots] = useState<RestaurantKotTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Async Button Loading States
  const [updatingKotId, setUpdatingKotId] = useState<number | null>(null);
  const [deletingKotId, setDeletingKotId] = useState<number | null>(null);
  const [confirmDeleteKot, setConfirmDeleteKot] = useState<RestaurantKotTicket | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Print isolation modal state
  const isModalOpen = !!confirmDeleteKot;

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const fetchKotTickets = async () => {
    try {
      setLoading(true);
      const data = await restaurantApi.getKotTickets();
      setKots(data);
    } catch (err) {
      console.error('Failed to load KOT tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKotTickets();
    const interval = setInterval(fetchKotTickets, 20000); // Auto-refresh kitchen display
    return () => clearInterval(interval);
  }, []);

  // Simplified 3-Step Cooking Flow: Start Preparing -> Prepared -> Served
  const handleUpdateStatus = async (kot: RestaurantKotTicket, newStatus: string) => {
    if (updatingKotId) return; // Prevent double-clicking

    const previousStatus = kot.status;
    // Optimistic UI Update
    setKots((prev) =>
      prev.map((k) => (k.id === kot.id ? { ...k, status: newStatus as any } : k))
    );
    setUpdatingKotId(kot.id);
    setErrorToast(null);

    try {
      const updated = await restaurantApi.updateKotStatus(kot.id, newStatus);
      // Sync with server response
      setKots((prev) => prev.map((k) => (k.id === kot.id ? updated : k)));
    } catch (err: any) {
      console.error('Failed to update KOT status', err);
      // Rollback to previous status on error
      setKots((prev) =>
        prev.map((k) => (k.id === kot.id ? { ...k, status: previousStatus } : k))
      );
      setErrorToast(
        err.response?.data?.message || 'Could not update cooking status. Please try again.'
      );
    } finally {
      setUpdatingKotId(null);
    }
  };

  // Delete KOT Ticket
  const handleDeleteKot = async () => {
    if (!confirmDeleteKot) return;
    try {
      setDeletingKotId(confirmDeleteKot.id);
      await restaurantApi.deleteKotTicket(confirmDeleteKot.id);
      setKots((prev) => prev.filter((k) => k.id !== confirmDeleteKot.id));
      setConfirmDeleteKot(null);
    } catch (err: any) {
      console.error('Failed to delete KOT ticket', err);
      setErrorToast(err.response?.data?.message || 'Failed to delete KOT ticket.');
    } finally {
      setDeletingKotId(null);
    }
  };

  const filteredKots =
    filterStatus === 'ALL'
      ? kots
      : kots.filter((k) => k.status === filterStatus);

  const pendingCount = kots.filter((k) => k.status === 'PENDING').length;
  const preparingCount = kots.filter((k) => k.status === 'PREPARING').length;
  const preparedCount = kots.filter((k) => k.status === 'READY').length;
  const servedCount = kots.filter((k) => k.status === 'SERVED').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Kitchen Order Tickets (KOT)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 text-xs font-bold border border-orange-200 flex items-center gap-1.5">
              <ChefHat size={13} className="text-orange-600" />
              <span>Live Kitchen Display</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time kitchen order tickets with 3-step cooking status lifecycle: Start Preparing &rarr; Prepared &rarr; Served.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchKotTickets}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-orange-600' : ''} />
            <span>Refresh KOT</span>
          </button>
        </div>
      </div>

      {/* Error Toast / Alert */}
      {errorToast && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span>{errorToast}</span>
          </div>
          <button
            onClick={() => setErrorToast(null)}
            className="text-rose-400 hover:text-rose-700 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Awaiting (Pending)</span>
          <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
          <p className="text-[10px] text-amber-700">Awaiting kitchen start</p>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Preparing</span>
          <div className="text-2xl font-black text-blue-600">{preparingCount}</div>
          <p className="text-[10px] text-blue-700">Cooking on stoves</p>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Prepared (Ready)</span>
          <div className="text-2xl font-black text-emerald-600">{preparedCount}</div>
          <p className="text-[10px] text-emerald-700">Ready to be served</p>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Served</span>
          <div className="text-2xl font-black text-slate-900">{servedCount}</div>
          <p className="text-[10px] text-slate-400">Delivered to guests</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: `All Tickets (${kots.length})` },
          { id: 'PENDING', label: `Pending (${pendingCount})` },
          { id: 'PREPARING', label: `Preparing (${preparingCount})` },
          { id: 'READY', label: `Prepared (${preparedCount})` },
          { id: 'SERVED', label: `Served (${servedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === tab.id
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* KOT Cards Display Grid */}
      {loading && kots.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredKots.length === 0 ? (
        <div className="clay-card p-12 text-center text-slate-400 space-y-2">
          <ChefHat size={36} className="mx-auto text-slate-300" />
          <p className="font-bold text-slate-800 text-sm">No Kitchen Order Tickets in this view</p>
          <p className="text-xs text-slate-400">New orders dispatched from Tables &amp; Orders will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredKots.map((kot) => {
            const isPending = kot.status === 'PENDING';
            const isPreparing = kot.status === 'PREPARING';
            const isPrepared = kot.status === 'READY';
            const isServed = kot.status === 'SERVED';
            const isUpdating = updatingKotId === kot.id;

            return (
              <div
                key={kot.id}
                className={`rounded-2xl border bg-white p-5 space-y-4 shadow-xs transition-all flex flex-col justify-between ${
                  isPending
                    ? 'border-amber-300 ring-1 ring-amber-400/30'
                    : isPreparing
                    ? 'border-blue-300 ring-1 ring-blue-400/30'
                    : isPrepared
                    ? 'border-emerald-400 bg-emerald-50/15 ring-1 ring-emerald-400/20'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Ticket Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 font-black text-slate-900 text-base">
                        <span>{kot.kotNumber}</span>
                      </div>
                      <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md mt-1 inline-block border border-orange-200/60">
                        {kot.tableName || 'Takeaway'}
                      </span>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isPreparing
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : isPrepared
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isPending
                            ? 'PENDING'
                            : isPreparing
                            ? 'PREPARING'
                            : isPrepared
                            ? 'PREPARED'
                            : 'SERVED'}
                        </span>

                        {/* Delete KOT Action */}
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteKot(kot)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ml-1"
                          title="Delete KOT Ticket"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        {new Date(kot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    {kot.items && kot.items.length > 0 ? (
                      kot.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between text-xs py-1.5 border-b border-slate-50 last:border-none"
                        >
                          <div className="space-y-0.5 pr-2">
                            <span className="font-bold text-slate-900">{item.itemName}</span>
                            {item.notes && (
                              <span className="block text-[11px] text-amber-700 font-medium italic">
                                Note: {item.notes}
                              </span>
                            )}
                          </div>
                          <span className="font-black text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-900 shrink-0">
                            ×{item.quantity}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">Chef items pending dispatch</p>
                    )}
                  </div>
                </div>

                {/* Simplified 3-Step Action Workflow: Start Preparing -> Prepared -> Served */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  {isPending && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(kot, 'PREPARING')}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Flame size={14} />}
                      <span>{isUpdating ? 'Updating...' : 'Start Preparing'}</span>
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(kot, 'READY')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      <span>{isUpdating ? 'Updating...' : 'Prepared'}</span>
                    </button>
                  )}

                  {isPrepared && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(kot, 'SERVED')}
                      className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <UtensilsCrossed size={14} />}
                      <span>{isUpdating ? 'Updating...' : 'Served'}</span>
                    </button>
                  )}

                  {isServed && (
                    <div className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>Order Served</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                    title="Print KOT Ticket"
                  >
                    <Printer size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          DELETE KOT CONFIRMATION MODAL (Full Viewport Overlay)
         ========================================================================= */}
      {confirmDeleteKot && (
        <div className="fixed inset-0 w-full h-full min-h-screen z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 my-auto">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Delete Kitchen Ticket</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to delete KOT ticket <strong>{confirmDeleteKot.kotNumber}</strong> ({confirmDeleteKot.tableName})? This removes only the kitchen ticket; the dining table and customer order remain untouched.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteKot(null)}
                disabled={deletingKotId !== null}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Keep KOT
              </button>
              <button
                type="button"
                disabled={deletingKotId !== null}
                onClick={handleDeleteKot}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {deletingKotId !== null && <Loader2 size={13} className="animate-spin" />}
                <span>{deletingKotId !== null ? 'Deleting...' : 'Yes, Delete KOT'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
