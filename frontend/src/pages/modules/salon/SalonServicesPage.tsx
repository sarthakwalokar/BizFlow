import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency } from '../../../utils/currency';
import { salonApi, SalonServiceItem } from '../../../api/modules';
import {
  Scissors,
  Plus,
  Clock,
  Trash2,
  Edit2,
  X,
  Search,
} from 'lucide-react';

export const SalonServicesPage: React.FC = () => {
  const { t } = useTranslation();
  const { business } = useAuth();
  const currency = business?.currency || 'INR';

  const [services, setServices] = useState<SalonServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Haircare');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await salonApi.getServices();
      setServices(data);
    } catch (err) {
      console.error('Failed to load salon services', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingId) {
        await salonApi.updateService(editingId, {
          name: name.trim(),
          category: category.trim(),
          durationMinutes: Number(durationMinutes),
          price: Number(price) || 0,
          description: description.trim(),
        });
      } else {
        await salonApi.createService({
          name: name.trim(),
          category: category.trim(),
          durationMinutes: Number(durationMinutes),
          price: Number(price) || 0,
          description: description.trim(),
        });
      }

      setShowModal(false);
      resetForm();
      fetchServices();
    } catch (err) {
      console.error('Failed to save service', err);
    }
  };

  const handleEdit = (s: SalonServiceItem) => {
    setEditingId(s.id);
    setName(s.name);
    setCategory(s.category || 'Haircare');
    setDurationMinutes(s.durationMinutes);
    setPrice(s.price);
    setDescription(s.description || '');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('salon.deleteConfirm', 'Are you sure you want to remove this service?'))) return;
    try {
      await salonApi.deleteService(id);
      fetchServices();
    } catch (err) {
      console.error('Failed to delete service', err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Haircare');
    setDurationMinutes(30);
    setPrice('');
    setDescription('');
  };

  const filtered = services.filter((s) =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('salon.servicesTitle', 'Salon Services Menu')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-800 text-xs font-bold border border-pink-200 flex items-center gap-1.5">
              <Scissors size={12} className="text-pink-600" />
              <span>{t('salon.serviceCatalog', 'Service Catalog')}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('salon.servicesSubtitle', 'Manage treatments, beauty packages, styling tariffs, and standard durations.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>{t('salon.addService', 'Add Service')}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder={t('salon.searchPlaceholder', 'Search treatments or categories...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
        />
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="clay-card p-12 text-center text-slate-400 space-y-2">
          <Scissors size={32} className="mx-auto text-slate-300" />
          <p className="font-bold text-slate-800 text-sm">{t('salon.noServicesYet', 'No services added yet')}</p>
          <p className="text-xs text-slate-400">{t('salon.noServicesDesc', 'Add haircutting, coloring, spa treatments, or styling packages.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="clay-card p-5 space-y-3 flex flex-col justify-between hover:border-pink-200 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                    {s.category || t('salon.generalCategory', 'General')}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <Clock size={12} className="text-pink-600" />
                    <span>{t('salon.mins', '{{count}} mins', { count: s.durationMinutes })}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                {s.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{s.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-lg font-black text-slate-950">
                  {formatCurrency(s.price, currency)}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(s)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 cursor-pointer"
                    title={t('salon.editService', 'Edit Service')}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title={t('salon.deleteService', 'Delete Service')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT SERVICE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingId ? t('salon.modalEditTitle', 'Edit Salon Service') : t('salon.modalAddTitle', 'Add New Salon Service')}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t('salon.serviceName', 'Service Name')} *</label>
                <input
                  type="text"
                  required
                  placeholder={t('placeholders.salonServiceExample', 'e.g. Keratin Hair Treatment')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('salon.serviceCategory', 'Category')}</label>
                  <input
                    type="text"
                    placeholder={t('placeholders.salonCategoryExample', 'e.g. Hair, Skin, Nails')}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('salon.durationMins', 'Duration (Mins)')}</label>
                  <input
                    type="number"
                    min={5}
                    max={360}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t('salon.servicePrice', 'Service Price')} ({currency}) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t('common.description', 'Description')}</label>
                <textarea
                  rows={2}
                  placeholder={t('placeholders.serviceDetailsExample', 'Treatment details and benefits...')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {t('salon.saveService', 'Save Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
