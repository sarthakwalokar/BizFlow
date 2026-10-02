import React, { useState, useEffect } from 'react';
import {
  electronicsApi,
  DeviceSerialItem,
} from '../../../api/modules';
import { productsApi, Product } from '../../../api/products';
import {
  Smartphone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ElectronicsSerialsPage: React.FC = () => {
  const [devices, setDevices] = useState<DeviceSerialItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [imeiNumber, setImeiNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [warrantyMonths, setWarrantyMonths] = useState(12);
  const [warrantyProvider, setWarrantyProvider] = useState('Brand Manufacturer');
  const [notes, setNotes] = useState('');

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await electronicsApi.getDevices(search);
      setDevices(data);
    } catch (err) {
      console.error('Failed to load electronic serial devices', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productsApi.getProducts({ size: 100, active: true });
      setProducts(res.content || []);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim()) return;

    try {
      await electronicsApi.registerDevice({
        productId: selectedProductId !== '' ? Number(selectedProductId) : undefined,
        productName: productName.trim() || 'Electronic Device',
        brand: brand.trim(),
        model: model.trim(),
        serialNumber: serialNumber.trim(),
        imeiNumber: imeiNumber.trim() || undefined,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        invoiceNumber: invoiceNumber.trim() || undefined,
        purchaseDate,
        warrantyMonths: Number(warrantyMonths),
        warrantyProvider: warrantyProvider.trim() || 'Brand Manufacturer',
        notes: notes.trim() || undefined,
      });

      setShowModal(false);
      resetForm();
      fetchDevices();
    } catch (err) {
      console.error('Failed to register device', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this device serial record?')) return;
    try {
      await electronicsApi.deleteDevice(id);
      fetchDevices();
    } catch (err) {
      console.error('Failed to delete device record', err);
    }
  };

  const resetForm = () => {
    setSelectedProductId('');
    setProductName('');
    setBrand('');
    setModel('');
    setSerialNumber('');
    setImeiNumber('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerAddress('');
    setInvoiceNumber('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setWarrantyMonths(12);
    setWarrantyProvider('Brand Manufacturer');
    setNotes('');
  };

  const activeCount = devices.filter((d) => d.warrantyStatus === 'ACTIVE').length;
  const expiringCount = devices.filter((d) => d.warrantyStatus === 'EXPIRING_SOON').length;
  const expiredCount = devices.filter((d) => d.warrantyStatus === 'EXPIRED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Serial / IMEI &amp; Warranty Tracking
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 text-xs font-bold border border-cyan-200 flex items-center gap-1.5">
              <Smartphone size={12} className="text-cyan-600" />
              <span>Electronics Module</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track device serial numbers, dual-SIM IMEIs, customer purchase links, and real-time warranty expirations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/dashboard/electronics/warranty-lookup"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Warranty Lookup</span>
          </Link>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Register Device</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered</span>
          <div className="text-2xl font-black text-slate-900">{devices.length}</div>
          <p className="text-[10px] text-slate-400">Unique serial devices</p>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active Warranty</span>
          <div className="text-2xl font-black text-emerald-600">{activeCount}</div>
          <p className="text-[10px] text-emerald-700">Covered under warranty</p>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Expiring in 30d</span>
          <div className="text-2xl font-black text-amber-600">{expiringCount}</div>
          <p className="text-[10px] text-amber-700">Recommend renewal</p>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Expired</span>
          <div className="text-2xl font-black text-rose-600">{expiredCount}</div>
          <p className="text-[10px] text-rose-700">Out of warranty</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Serial Number, IMEI, Customer, or Model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
        />
      </div>

      {/* Devices List Table */}
      <div className="clay-card p-5 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Smartphone size={32} className="mx-auto text-slate-300" />
            <p className="font-bold text-slate-800 text-sm">No electronic devices registered yet</p>
            <p className="text-xs text-slate-400">Click "Register Device" to log serial numbers, IMEI, and warranty periods.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                  <th className="pb-3">Product / Device</th>
                  <th className="pb-3">Serial / IMEI</th>
                  <th className="pb-3">Customer Link</th>
                  <th className="pb-3">Purchased</th>
                  <th className="pb-3">Warranty Expiry</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {devices.map((dev) => (
                  <tr key={dev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                          <Smartphone size={13} />
                        </div>
                        <div>
                          <span>{dev.productName}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {dev.brand} {dev.model}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 font-mono">
                      <div className="font-bold text-slate-800 text-[11px]">S/N: {dev.serialNumber}</div>
                      {dev.imeiNumber && (
                        <div className="text-[10px] text-slate-400">IMEI: {dev.imeiNumber}</div>
                      )}
                    </td>

                    <td className="py-3">
                      {dev.customerName ? (
                        <div>
                          <span className="font-semibold text-slate-800 block">{dev.customerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{dev.customerPhone || '—'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3 text-slate-600 font-mono text-[11px]">
                      {dev.purchaseDate}
                    </td>

                    <td className="py-3 font-mono text-[11px]">
                      <span className="font-bold text-slate-900 block">{dev.warrantyExpiryDate}</span>
                      <span className="text-[10px] text-slate-400">
                        {dev.daysRemaining > 0 ? `${dev.daysRemaining} days left` : 'Expired'}
                      </span>
                    </td>

                    <td className="py-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          dev.warrantyStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : dev.warrantyStatus === 'EXPIRING_SOON'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {dev.warrantyStatus}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(dev.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REGISTER DEVICE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Register Serial / IMEI &amp; Warranty</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterDevice} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Link Catalog Product (Optional)</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const id = e.target.value === '' ? '' : Number(e.target.value);
                    setSelectedProductId(id);
                    if (id !== '') {
                      const found = products.find((p) => p.id === id);
                      if (found) setProductName(found.name);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="">-- Select Catalog Item or type custom --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Product / Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 15 Pro Max 256GB"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Samsung, Dell"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Model Name / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. A2849 / SM-S918B"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Serial Number (S/N) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. F2LZW123Q6N"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">IMEI Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 354890123456789"
                    value={imeiNumber}
                    onChange={(e) => setImeiNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Warranty Coverage (Months)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                  Customer Ownership Link (Optional)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Customer Name (Optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <input
                    type="tel"
                    placeholder="Customer Phone (Optional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="email"
                    placeholder="Customer Email (Optional)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Customer Address (Optional)"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Invoice Number (e.g. INV-0042)"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Warranty Provider (e.g. AppleCare+)"
                    value={warrantyProvider}
                    onChange={(e) => setWarrantyProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Save Device Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
