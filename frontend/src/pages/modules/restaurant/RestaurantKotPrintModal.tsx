import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { RestaurantKotTicket } from '../../../api/modules';
import {
  Printer,
  X,
  ChefHat,
} from 'lucide-react';

interface RestaurantKotPrintModalProps {
  kot: RestaurantKotTicket;
  onClose: () => void;
}

export const RestaurantKotPrintModal: React.FC<RestaurantKotPrintModalProps> = ({
  kot,
  onClose,
}) => {
  const { t } = useTranslation();
  const { business } = useAuth();

  useEffect(() => {
    document.body.classList.add('receipt-modal-open');
    return () => {
      document.body.classList.remove('receipt-modal-open');
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const businessName = business?.name || 'KITCHEN DISPLAY SYSTEM';
  const formattedTime = new Date(kot.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const formattedDate = new Date(kot.createdAt).toLocaleDateString('en-IN', {
    dateStyle: 'medium',
  });

  const totalQuantity = (kot.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto receipt-modal-backdrop backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl my-auto overflow-hidden flex flex-col max-h-[95vh] border border-zinc-200 receipt-modal-container transition-all">
        {/* Controls Header (Hidden during print) */}
        <div className="px-5 py-3.5 bg-zinc-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950 font-bold shrink-0">
              <ChefHat size={16} />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold truncate">
                {t('restaurant.kotPrintTitle', 'Kitchen Order Ticket (KOT)')}
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono truncate">
                #{kot.kotNumber} • {kot.tableName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Printer size={14} />
              <span>{t('restaurant.printKot', 'Print KOT')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Kitchen Ticket Paper Area (80mm Thermal Receipt Layout) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-100 flex justify-center items-center receipt-printable-content">
          <div
            id="printable-receipt-content"
            className="w-full max-w-[340px] bg-white border border-slate-300 rounded-xl p-6 space-y-4 font-mono text-xs shadow-xl text-slate-950 receipt-format-thermal box-border print:border-none print:shadow-none print:p-2"
          >
            {/* Header */}
            <div className="text-center space-y-1 border-b-2 border-dashed border-slate-400 pb-3">
              <div className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">
                *** KITCHEN ORDER TICKET ***
              </div>
              <h1 className="text-base font-black uppercase tracking-tight text-slate-950">
                {businessName}
              </h1>
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="text-sm font-black px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono">
                  {kot.kotNumber}
                </span>
                <span className="text-sm font-black text-slate-950 border-2 border-slate-900 px-2 py-0.5 rounded">
                  {kot.tableName || 'TAKEAWAY'}
                </span>
              </div>
            </div>

            {/* Time & Server Metadata */}
            <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2 text-slate-700">
              <div className="flex justify-between">
                <span>PUNCH TIME:</span>
                <span className="font-bold text-slate-950">{formattedTime}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{formattedDate}</span>
              </div>
              {kot.orderId && (
                <div className="flex justify-between text-slate-500">
                  <span>ORDER REF:</span>
                  <span>#{kot.orderId}</span>
                </div>
              )}
            </div>

            {/* KOT Items List */}
            <div className="space-y-2 border-b-2 border-dashed border-slate-400 pb-3">
              <div className="flex justify-between font-black text-xs border-b border-slate-200 pb-1 text-slate-900">
                <span>QTY & ITEM NAME</span>
                <span>STATUS</span>
              </div>

              {kot.items && kot.items.length > 0 ? (
                kot.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-start text-xs">
                      <div className="font-black text-sm text-slate-950 flex-1 pr-2">
                        <span className="inline-block min-w-[28px] text-base font-black">
                          {item.quantity}x
                        </span>
                        <span>{item.itemName}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0 pt-0.5">
                        {item.kotStatus || kot.status}
                      </span>
                    </div>

                    {item.notes && (
                      <div className="pl-7 text-[11px] text-rose-700 font-bold italic">
                        ↳ Instruction: {item.notes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-slate-400">No items in ticket</div>
              )}
            </div>

            {/* Ticket Special Instruction / Notes */}
            {kot.notes && (
              <div className="p-2 bg-slate-100 rounded border border-slate-300 text-[11px] text-slate-900">
                <span className="font-bold uppercase block text-[10px] text-slate-600">SPECIAL TICKET INSTRUCTION:</span>
                <p className="font-bold">{kot.notes}</p>
              </div>
            )}

            {/* Summary Footer */}
            <div className="flex justify-between items-center text-xs font-black pt-1">
              <span>TOTAL ITEMS:</span>
              <span className="text-sm">{totalQuantity} QTY</span>
            </div>

            <div className="text-center text-[9px] text-slate-400 pt-2 border-t border-dashed border-slate-300">
              --- END OF KITCHEN TICKET ---
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-white border-t border-zinc-200 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <p className="text-xs text-zinc-500 font-mono">
            80mm Thermal Kitchen Printer Format
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              {t('common.close', 'Close')}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer size={15} />
              <span>{t('restaurant.printKot', 'Print KOT')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
