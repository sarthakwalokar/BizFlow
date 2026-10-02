import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency } from '../../../utils/currency';
import {
  salonApi,
  SalonAppointment,
  SalonServiceItem,
  CustomerServiceHistory,
} from '../../../api/modules';
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Scissors,
  Phone,
  X,
} from 'lucide-react';

export const SalonAppointmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { business } = useAuth();
  const currency = business?.currency || 'INR';

  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [services, setServices] = useState<SalonServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [staffName, setStaffName] = useState('');
  const [apptTime, setApptTime] = useState('11:00 AM');
  const [apptNotes, setApptNotes] = useState('');

  // Customer History Modal
  const [historyCustomer, setHistoryCustomer] = useState<CustomerServiceHistory | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await salonApi.getAppointments({ date: selectedDate });
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load salon appointments', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const data = await salonApi.getServices();
      setServices(data);
    } catch (err) {
      console.error('Failed to load salon services', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) return;

    const serv = services.find((s) => s.id === Number(selectedServiceId));
    try {
      await salonApi.createAppointment({
        customerName: customerName.trim() || 'Walk-in Guest',
        customerPhone: customerPhone.trim() || undefined,
        serviceId: serv?.id,
        serviceName: serv?.name || 'Hair & Beauty Care',
        staffName: staffName.trim() || 'Senior Stylist',
        appointmentDate: selectedDate,
        startTime: apptTime,
        durationMinutes: serv?.durationMinutes || 45,
        price: serv?.price || 0,
        notes: apptNotes.trim() || undefined,
      });

      setShowAddModal(false);
      setCustomerName('');
      setCustomerPhone('');
      setSelectedServiceId('');
      setStaffName('');
      setApptNotes('');
      fetchAppointments();
    } catch (err) {
      console.error('Failed to book appointment', err);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await salonApi.updateStatus(id, status);
      fetchAppointments();
    } catch (err) {
      console.error('Failed to update appointment status', err);
    }
  };

  const handleViewCustomerHistory = async (phone: string) => {
    if (!phone) return;
    try {
      const history = await salonApi.getCustomerHistory(phone);
      setHistoryCustomer(history);
    } catch (err) {
      console.error('Failed to load customer history', err);
    }
  };

  const filteredAppts = statusFilter === 'ALL'
    ? appointments
    : appointments.filter((a) => a.status === statusFilter);

  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const inProgressCount = appointments.filter((a) => a.status === 'IN_PROGRESS').length;
  const bookedCount = appointments.filter((a) => a.status === 'BOOKED' || a.status === 'CONFIRMED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('salon.appointmentsTitle', 'Salon & Beauty Appointments')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-800 text-xs font-bold border border-pink-200 flex items-center gap-1.5">
              <Scissors size={12} className="text-pink-600" />
              <span>{t('salon.moduleBadge', 'Salon Module')}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('salon.appointmentsSubtitle', 'Daily booking calendar, stylist assignments, client history, and duration tracking.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>{t('salon.bookAppointment', 'Book Appointment')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('salon.totalBooked', 'Total Booked')}</span>
          <div className="text-2xl font-black text-slate-900">{appointments.length}</div>
          <p className="text-[10px] text-slate-400">{t('salon.forSelectedDate', 'For selected date')}</p>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{t('salon.upcoming', 'Upcoming')}</span>
          <div className="text-2xl font-black text-amber-600">{bookedCount}</div>
          <p className="text-[10px] text-amber-700">{t('salon.scheduledSlots', 'Scheduled slots')}</p>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{t('salon.inChair', 'In Chair')}</span>
          <div className="text-2xl font-black text-blue-600">{inProgressCount}</div>
          <p className="text-[10px] text-blue-700">{t('salon.serviceInProgress', 'Service in progress')}</p>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{t('salon.completed', 'Completed')}</span>
          <div className="text-2xl font-black text-emerald-600">{completedCount}</div>
          <p className="text-[10px] text-emerald-700">{t('salon.checkedOutBilled', 'Checked out & billed')}</p>
        </div>
      </div>

      {/* Date Picker & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-pink-600" />
          <span className="text-xs font-bold text-slate-700">{t('salon.selectDate', 'Select Date')}:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'BOOKED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List / Table */}
      <div className="clay-card p-5 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredAppts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Scissors size={32} className="mx-auto text-slate-300" />
            <p className="font-bold text-slate-800 text-sm">{t('salon.noApptsDate', 'No appointments scheduled for this date')}</p>
            <p className="text-xs text-slate-400">{t('salon.noApptsDesc', 'Click "Book Appointment" to schedule your first salon booking.')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                  <th className="pb-3">{t('salon.thTimeDuration', 'Time & Duration')}</th>
                  <th className="pb-3">{t('salon.thCustomer', 'Customer')}</th>
                  <th className="pb-3">{t('salon.thService', 'Service')}</th>
                  <th className="pb-3">{t('salon.thStylist', 'Stylist')}</th>
                  <th className="pb-3">{t('salon.thPrice', 'Price')}</th>
                  <th className="pb-3 text-center">{t('salon.thStatus', 'Status')}</th>
                  <th className="pb-3 text-right">{t('salon.thActions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppts.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-pink-600" />
                        <span>{appt.startTime}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {t('salon.mins', '{{count}} mins', { count: appt.durationMinutes })}
                      </span>
                    </td>

                    <td className="py-3 font-semibold text-slate-800">
                      <div>{appt.customerName}</div>
                      {appt.customerPhone && (
                        <button
                          onClick={() => handleViewCustomerHistory(appt.customerPhone!)}
                          className="text-[10px] text-pink-600 hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                        >
                          <Phone size={10} />
                          <span>{appt.customerPhone} ({t('salon.viewHistory', 'View History')})</span>
                        </button>
                      )}
                    </td>

                    <td className="py-3">
                      <span className="font-bold text-slate-900">{appt.serviceName}</span>
                      {appt.notes && (
                        <span className="block text-[10px] text-slate-400 italic">{appt.notes}</span>
                      )}
                    </td>

                    <td className="py-3 text-slate-600 font-medium">
                      {appt.staffName || t('salon.anyAvailable', 'Any Available')}
                    </td>

                    <td className="py-3 font-black text-slate-900">
                      {formatCurrency(appt.price, currency)}
                    </td>

                    <td className="py-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          appt.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : appt.status === 'IN_PROGRESS'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : appt.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {appt.status !== 'IN_PROGRESS' && appt.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'IN_PROGRESS')}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[10px] cursor-pointer"
                          >
                            {t('salon.start', 'Start')}
                          </button>
                        )}
                        {appt.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] cursor-pointer"
                          >
                            {t('salon.done', 'Done')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BOOK APPOINTMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">{t('salon.bookClientAppt', 'Book Client Appointment')}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t('salon.clientNameOpt', 'Client Name (Optional)')}</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Sen (or Walk-in Guest)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t('salon.clientPhoneOpt', 'Client Phone Number (Optional)')}</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210 (Optional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t('salon.selectService', 'Select Service')} *</label>
                <select
                  required
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="">{t('salon.chooseService', '-- Choose a Service --')}</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.durationMinutes} mins) - {formatCurrency(s.price, currency)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('salon.timeSlot', 'Time Slot')}</label>
                  <input
                    type="text"
                    placeholder="e.g. 02:30 PM"
                    value={apptTime}
                    onChange={(e) => setApptTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('salon.assignedStylist', 'Assigned Stylist')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Maya Sharma"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t('salon.clientNotes', 'Client Preferences / Notes')}</label>
                <input
                  type="text"
                  placeholder="e.g. Organic hair spa treatment"
                  value={apptNotes}
                  onChange={(e) => setApptNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {t('salon.confirmBooking', 'Confirm Booking')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER SERVICE HISTORY DRAWER */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{historyCustomer.customerName}</h3>
                <p className="text-[11px] text-slate-400">{t('common.phone', 'Phone')}: {historyCustomer.customerPhone}</p>
              </div>
              <button
                onClick={() => setHistoryCustomer(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Lifetime stats */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-pink-50/50 border border-pink-100 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">{t('salon.totalVisits', 'Total Visits')}</span>
                <span className="text-lg font-black text-slate-900">{t('salon.visitsCount', '{{count}} Visits', { count: historyCustomer.totalAppointments })}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">{t('salon.lifetimeSpent', 'Lifetime Spent')}</span>
                <span className="text-lg font-black text-pink-700">{formatCurrency(historyCustomer.totalSpent, currency)}</span>
              </div>
            </div>

            {/* Past Visits List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('salon.pastAppts', 'Past Appointments')}</h4>
              {historyCustomer.pastAppointments.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{p.serviceName}</span>
                    <span>{formatCurrency(p.price, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{p.appointmentDate} at {p.startTime} ({p.staffName || 'Stylist'})</span>
                    <span className="font-semibold text-emerald-700">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 text-right">
              <button
                onClick={() => setHistoryCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
