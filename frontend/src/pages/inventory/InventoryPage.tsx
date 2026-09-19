import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  inventoryApi,
  StockItem,
  StockMovement,
  InventorySummary,
  Location,
  Supplier,
  Purchase,
} from '../../api/inventory';
import { categoriesApi, Category } from '../../api/categories';
import { productsApi, Product } from '../../api/products';
import { ButtonSpinner, TableSkeleton, MetricCardsSkeleton } from '../../components/common/LoadingStates';
import {
  Boxes,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  ArrowRightLeft,
  Building2,
  Users,
  ShoppingCart,
  History,
  X,
  Edit2,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export const InventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { business } = useAuth();
  const isLarge = business?.businessSize === 'LARGE';

  // Active Tab for Large Businesses
  const [activeTab, setActiveTab] = useState<'STOCK' | 'MOVEMENTS' | 'SUPPLIERS' | 'PURCHASES' | 'LOCATIONS'>('STOCK');

  // Common Data State
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [stockSearch, setStockSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);

  // Modals State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<StockItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<string>('0');
  const [adjustNewAbsolute, setAdjustNewAbsolute] = useState<string>('');
  const [adjustLocationId, setAdjustLocationId] = useState<string>('');
  const [adjustNotes, setAdjustNotes] = useState<string>('');

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferProductId, setTransferProductId] = useState<string>('');
  const [transferSourceLocationId, setTransferSourceLocationId] = useState<string>('');
  const [transferTargetLocationId, setTransferTargetLocationId] = useState<string>('');
  const [transferQuantity, setTransferQuantity] = useState<string>('1');
  const [transferNotes, setTransferNotes] = useState<string>('');

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationName, setLocationName] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationPhone, setLocationPhone] = useState('');
  const [locationPrimary, setLocationPrimary] = useState(false);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierTaxNumber, setSupplierTaxNumber] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currency = business?.currency || 'USD';

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumRes, stockRes, catsRes] = await Promise.all([
        inventoryApi.getSummary(),
        inventoryApi.getStockList({ size: 500 }),
        categoriesApi.getCategories(),
      ]);

      setSummary(sumRes);
      setStockItems(stockRes?.content || []);
      setCategories(catsRes || []);

      if (isLarge) {
        try {
          const [locsRes, suppsRes, movesRes, purchRes, prodsRes] = await Promise.all([
            inventoryApi.getLocations(),
            inventoryApi.getActiveSuppliers(),
            inventoryApi.getMovements({ size: 50 }),
            inventoryApi.searchPurchases({ size: 50 }),
            productsApi.getProducts({ active: true, size: 200 }),
          ]);
          setLocations(locsRes || []);
          setSuppliers(suppsRes || []);
          setMovements(movesRes?.content || []);
          setPurchases(purchRes?.content || []);
          const pList = Array.isArray(prodsRes) ? prodsRes : (prodsRes?.content || []);
          setAllProducts(pList.filter((p: Product) => p.productType === 'PHYSICAL'));
        } catch {
          // non-blocking
        }
      }
    } catch (err: any) {
      setErrorMessage(t('inventory.failedToLoad', 'Failed to load inventory data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isLarge]);

  const openAdjustModal = (item: StockItem) => {
    setAdjustingItem(item);
    setAdjustDelta('0');
    setAdjustNewAbsolute(String(item.stockQuantity));
    setAdjustLocationId(locations.length > 0 ? String(locations[0].id) : '');
    setAdjustNotes('');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const delta = parseInt(adjustDelta) || 0;
    const newQty = parseInt(adjustNewAbsolute);

    try {
      if (!isNaN(newQty) && adjustDelta === '0') {
        await inventoryApi.adjustStock({
          productId: adjustingItem.productId,
          newStockQuantity: newQty,
          locationId: adjustLocationId ? Number(adjustLocationId) : undefined,
          notes: adjustNotes || 'Manual stock override',
        });
      } else {
        await inventoryApi.adjustStock({
          productId: adjustingItem.productId,
          adjustmentQuantity: delta,
          locationId: adjustLocationId ? Number(adjustLocationId) : undefined,
          notes: adjustNotes || `Manual delta adjustment (${delta > 0 ? '+' : ''}${delta})`,
        });
      }

      setSuccessMessage(t('inventory.adjustmentSuccess', 'Stock level adjusted successfully!'));
      setIsAdjustModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t('inventory.adjustFailed', 'Failed to adjust stock.')
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransferStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferProductId || !transferSourceLocationId || !transferTargetLocationId) return;

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await inventoryApi.transferStock({
        productId: Number(transferProductId),
        sourceLocationId: Number(transferSourceLocationId),
        targetLocationId: Number(transferTargetLocationId),
        quantity: parseInt(transferQuantity) || 1,
        notes: transferNotes || undefined,
      });

      setSuccessMessage(t('inventory.transferSuccess', 'Stock transfer executed successfully.'));
      setIsTransferModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t('inventory.transferFailed', 'Failed to transfer stock.')
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) return;

    setActionLoading(true);
    try {
      if (editingLocation) {
        await inventoryApi.updateLocation(editingLocation.id, {
          name: locationName.trim(),
          code: locationCode.trim() || undefined,
          address: locationAddress.trim() || undefined,
          phone: locationPhone.trim() || undefined,
          primary: locationPrimary,
        });
        setSuccessMessage(t('inventory.locationUpdated', { name: locationName, defaultValue: `Location "${locationName}" updated.` }));
      } else {
        await inventoryApi.createLocation({
          name: locationName.trim(),
          code: locationCode.trim() || undefined,
          address: locationAddress.trim() || undefined,
          phone: locationPhone.trim() || undefined,
          primary: locationPrimary,
        });
        setSuccessMessage(t('inventory.locationCreated', { name: locationName, defaultValue: `Location "${locationName}" created.` }));
      }

      setIsLocationModalOpen(false);
      setEditingLocation(null);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || t('inventory.locationFailed', 'Failed to save location.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) return;

    setActionLoading(true);
    try {
      if (editingSupplier) {
        await inventoryApi.updateSupplier(editingSupplier.id, {
          name: supplierName.trim(),
          contactPerson: supplierContact.trim() || undefined,
          email: supplierEmail.trim() || undefined,
          phone: supplierPhone.trim() || undefined,
          address: supplierAddress.trim() || undefined,
          taxNumber: supplierTaxNumber.trim() || undefined,
        });
        setSuccessMessage(t('inventory.supplierUpdated', { name: supplierName, defaultValue: `Supplier "${supplierName}" updated.` }));
      } else {
        await inventoryApi.createSupplier({
          name: supplierName.trim(),
          contactPerson: supplierContact.trim() || undefined,
          email: supplierEmail.trim() || undefined,
          phone: supplierPhone.trim() || undefined,
          address: supplierAddress.trim() || undefined,
          taxNumber: supplierTaxNumber.trim() || undefined,
        });
        setSuccessMessage(t('inventory.supplierCreated', { name: supplierName, defaultValue: `Supplier "${supplierName}" registered.` }));
      }

      setIsSupplierModalOpen(false);
      setEditingSupplier(null);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || t('inventory.supplierFailed', 'Failed to save supplier.'));
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Stock items
  const filteredStock = stockItems.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(stockSearch.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(stockSearch.toLowerCase()));
    const matchesCat =
      selectedCategory === 'ALL'
        ? true
        : item.categoryName && item.categoryName === selectedCategory;
    const matchesLow = lowStockOnly ? item.lowStock || item.stockQuantity <= 0 : true;
    return matchesSearch && matchesCat && matchesLow;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight">{t('inventory.title')}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              isLarge
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isLarge ? t('auth.largeBusiness', 'Enterprise Multi-Location') : t('auth.smallBusiness', 'Lean Single-Counter')}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t('inventory.subtitle')}
          </p>
        </div>

        {isLarge && (
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setTransferProductId(allProducts.length > 0 ? String(allProducts[0].id) : '');
                setTransferSourceLocationId(locations.length > 0 ? String(locations[0].id) : '');
                setTransferTargetLocationId(locations.length > 1 ? String(locations[1].id) : '');
                setIsTransferModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold border border-zinc-200 shadow-xs cursor-pointer"
            >
              <ArrowRightLeft size={14} />
              <span>{t('inventory.transferStock', 'Transfer Stock')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle size={15} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* KPI Cards */}
      {loading ? (
        <MetricCardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('inventory.itemsTracked')}</span>
            <div className="text-2xl font-bold text-zinc-900">{summary?.totalTrackedProducts ?? stockItems.length}</div>
            <span className="text-[10px] text-zinc-400">{t('products.physicalGoods')}</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('inventory.lowStockWarning')}</span>
            <div className={`text-2xl font-bold ${summary?.lowStockProducts && summary.lowStockProducts > 0 ? 'text-amber-600' : 'text-zinc-900'}`}>
              {summary?.lowStockProducts ?? 0}
            </div>
            <span className="text-[10px] text-zinc-400">{t('inventory.reorderLevel')}</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('inventory.outOfStock')}</span>
            <div className={`text-2xl font-bold ${summary?.outOfStockProducts && summary.outOfStockProducts > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>
              {summary?.outOfStockProducts ?? 0}
            </div>
            <span className="text-[10px] text-zinc-400">{t('inventory.outStock')}</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('inventory.stockValue')}</span>
            <div className="text-2xl font-bold text-zinc-900">
              {formatCurrency(summary?.totalInventoryValuation ?? 0, currency)}
            </div>
            <span className="text-[10px] text-zinc-400">{t('inventory.title')}</span>
          </div>
        </div>
      )}

      {/* Large Business Navigation Tabs */}
      {isLarge && (
        <div className="flex items-center space-x-2 border-b border-zinc-200 pb-2 text-xs overflow-x-auto">
          {[
            { id: 'STOCK', label: t('inventory.currentStock', 'Stock Levels'), icon: Boxes },
            { id: 'MOVEMENTS', label: t('inventory.warehouseTab', 'Stock Movements'), icon: History },
            { id: 'SUPPLIERS', label: t('inventory.suppliersTab', 'Suppliers'), icon: Users },
            { id: 'PURCHASES', label: t('inventory.purchaseOrdersTab', 'Purchase Inward POs'), icon: ShoppingCart },
            { id: 'LOCATIONS', label: t('inventory.locationsTab', 'Locations & Branches'), icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                  active
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* TAB 1: STOCK LEVELS (Visible to both Small and Large) */}
      {(!isLarge || activeTab === 'STOCK') && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search size={14} className="absolute left-3.5 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder={t('common.search')}
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 focus:bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
              >
                <option value="ALL">{t('common.all')} {t('categories.title')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setLowStockOnly(!lowStockOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                  lowStockOnly
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {t('inventory.lowStock')}
              </button>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-4">{t('products.productName')}</th>
                    <th className="py-3 px-4">{t('products.category')}</th>
                    <th className="py-3 px-4">{t('products.price')}</th>
                    <th className="py-3 px-4">{t('inventory.currentStock')}</th>
                    <th className="py-3 px-4">{t('products.status')}</th>
                    <th className="py-3 px-4 text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <TableSkeleton rows={6} columns={6} />
                      </td>
                    </tr>
                  ) : filteredStock.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500 space-y-1">
                        <Boxes size={32} className="mx-auto text-zinc-300" />
                        <p className="font-bold text-zinc-700">{t('common.noDataFound')}</p>
                        <p className="text-[11px] text-zinc-400">{t('products.subtitle')}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStock.map((item) => {
                      const isOutOfStock = item.stockQuantity <= 0;
                      const isLow = item.lowStock || (item.stockQuantity > 0 && item.stockQuantity <= (item.lowStockThreshold ?? 5));

                      return (
                        <tr key={item.productId} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-zinc-900 block">{item.productName}</span>
                            {item.sku && (
                              <span className="text-[10px] text-zinc-400 font-mono">SKU: {item.sku}</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-zinc-600">{item.categoryName || '—'}</td>

                          <td className="py-3 px-4 font-black text-zinc-950">
                            {formatCurrency(item.price, currency)}
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-sm text-zinc-900">{item.stockQuantity}</span>
                            <span className="text-[10px] text-zinc-400 ml-1.5 font-normal">
                              (Min: {item.lowStockThreshold ?? 5})
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isOutOfStock
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : isLow
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isOutOfStock ? t('inventory.outOfStock') : isLow ? t('inventory.lowStock') : t('common.active')}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => openAdjustModal(item)}
                              className="px-3 py-1 bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-700 text-zinc-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              {t('inventory.stockAdjustment')}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK MOVEMENTS (Large Business Only) */}
      {isLarge && activeTab === 'MOVEMENTS' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-card overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900">{t('inventory.warehouseTab', 'Audit Ledger & Stock Movements')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-500 uppercase">
                <tr>
                  <th className="py-3 px-4">{t('common.date')}</th>
                  <th className="py-3 px-4">{t('products.productName')}</th>
                  <th className="py-3 px-4">{t('common.type')}</th>
                  <th className="py-3 px-4">{t('common.quantity')}</th>
                  <th className="py-3 px-4">{t('inventory.currentStock')}</th>
                  <th className="py-3 px-4">{t('common.notes')}</th>
                  <th className="py-3 px-4">{t('common.name')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      {t('common.noDataFound')}
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50/70">
                      <td className="py-3 px-4 text-zinc-500 whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-zinc-900">{m.productName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 font-bold text-[10px] uppercase">
                          {m.movementType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-700">{m.newStock}</td>
                      <td className="py-3 px-4 text-zinc-500 truncate max-w-xs">{m.notes || '—'}</td>
                      <td className="py-3 px-4 text-zinc-600">{m.createdBy || 'System'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUPPLIERS (Large Business Only) */}
      {isLarge && activeTab === 'SUPPLIERS' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingSupplier(null);
                setSupplierName('');
                setSupplierContact('');
                setSupplierEmail('');
                setSupplierPhone('');
                setSupplierAddress('');
                setSupplierTaxNumber('');
                setIsSupplierModalOpen(true);
              }}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium shadow-xs cursor-pointer flex items-center space-x-1.5"
            >
              <Plus size={15} />
              <span>{t('inventory.addSupplier')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.length === 0 ? (
              <div className="col-span-full py-12 text-center text-zinc-500 bg-white rounded-xl border border-zinc-200 p-8 space-y-1">
                <Users size={32} className="mx-auto text-zinc-300" />
                <p className="font-semibold text-zinc-700">{t('inventory.noSuppliersFound')}</p>
              </div>
            ) : (
              suppliers.map((s) => (
                <div key={s.id} className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-zinc-900 text-xs">{s.name}</h4>
                    <button
                      onClick={() => {
                        setEditingSupplier(s);
                        setSupplierName(s.name);
                        setSupplierContact(s.contactPerson || '');
                        setSupplierEmail(s.email || '');
                        setSupplierPhone(s.phone || '');
                        setSupplierAddress(s.address || '');
                        setSupplierTaxNumber(s.taxNumber || '');
                        setIsSupplierModalOpen(true);
                      }}
                      className="p-1 text-zinc-400 hover:text-brand-600 cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                  <div className="space-y-1 text-xs text-zinc-600">
                    {s.contactPerson && <p>{t('common.name')}: {s.contactPerson}</p>}
                    {s.phone && <p className="font-mono">{t('common.phone')}: {s.phone}</p>}
                    {s.email && <p>{t('common.email')}: {s.email}</p>}
                    {s.taxNumber && <p className="text-[10px] text-zinc-400">{t('inventory.supplierGst')}: {s.taxNumber}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PURCHASES / INWARD POS (Large Business Only) */}
      {isLarge && activeTab === 'PURCHASES' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-card overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900">{t('inventory.purchaseOrdersTab', 'Purchase Orders')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-500 uppercase">
                <tr>
                  <th className="py-3 px-4">{t('common.date')}</th>
                  <th className="py-3 px-4">{t('inventory.poNumber')}</th>
                  <th className="py-3 px-4">{t('inventory.supplier')}</th>
                  <th className="py-3 px-4">{t('common.quantity')}</th>
                  <th className="py-3 px-4">{t('common.total')}</th>
                  <th className="py-3 px-4">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-400">
                      {t('inventory.noPoFound')}
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/70">
                      <td className="py-3 px-4 text-zinc-500">
                        {new Date(p.purchaseDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900">{p.purchaseNumber || `PO-${p.id}`}</td>
                      <td className="py-3 px-4 font-semibold text-zinc-800">{p.supplierName}</td>
                      <td className="py-3 px-4 text-zinc-600">{p.items?.length || 0}</td>
                      <td className="py-3 px-4 font-bold text-zinc-950">{formatCurrency(p.totalAmount, currency)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: LOCATIONS & BRANCHES (Large Business Only) */}
      {isLarge && activeTab === 'LOCATIONS' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingLocation(null);
                setLocationName('');
                setLocationCode('');
                setLocationAddress('');
                setLocationPhone('');
                setLocationPrimary(false);
                setIsLocationModalOpen(true);
              }}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium shadow-xs cursor-pointer flex items-center space-x-1.5"
            >
              <Plus size={15} />
              <span>{t('inventory.addLocation', 'Add Location')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.length === 0 ? (
              <div className="col-span-full py-12 text-center text-zinc-500 bg-white rounded-xl border border-zinc-200 p-8 space-y-1">
                <Building2 size={32} className="mx-auto text-zinc-300" />
                <p className="font-semibold text-zinc-700">{t('common.noDataFound')}</p>
              </div>
            ) : (
              locations.map((loc) => (
                <div key={loc.id} className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-zinc-900 text-xs">{loc.name}</h4>
                      {loc.primary && (
                        <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-medium border border-brand-200">
                          Primary
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setEditingLocation(loc);
                        setLocationName(loc.name);
                        setLocationCode(loc.code || '');
                        setLocationAddress(loc.address || '');
                        setLocationPhone(loc.phone || '');
                        setLocationPrimary(loc.primary || false);
                        setIsLocationModalOpen(true);
                      }}
                      className="p-1 text-zinc-400 hover:text-brand-600 cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                  <div className="space-y-1 text-xs text-zinc-600">
                    {loc.code && <p className="font-mono text-[11px]">{t('common.code')}: {loc.code}</p>}
                    {loc.address && <p>{t('common.address')}: {loc.address}</p>}
                    {loc.phone && <p>{t('common.phone')}: {loc.phone}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-lg space-y-4 border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                  <Boxes size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">{t('inventory.adjustStockModalTitle')}</h3>
                  <p className="text-[11px] text-zinc-500">{adjustingItem.productName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-medium">{t('inventory.currentStock')}:</span>
                <span className="font-bold text-zinc-900 text-sm">{adjustingItem.stockQuantity}</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">{t('inventory.adjustQuantity')}</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustNewAbsolute}
                  onChange={(e) => {
                    setAdjustNewAbsolute(e.target.value);
                    setAdjustDelta('0');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">{t('inventory.reason')}</label>
                <input
                  type="text"
                  placeholder="e.g. Audit / Damaged goods"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-50 cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <ButtonSpinner text={t('common.saving')} />
                  ) : (
                    t('common.save')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal (Large Business) */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-lg space-y-4 border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-900">{t('inventory.transferStock', 'Transfer Stock Between Locations')}</h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleTransferStock} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">{t('products.productName')} *</label>
                <select
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.stockQuantity ?? 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">{t('inventory.fromLocation', 'From Location')} *</label>
                  <select
                    value={transferSourceLocationId}
                    onChange={(e) => setTransferSourceLocationId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">{t('inventory.toLocation', 'To Location')} *</label>
                  <select
                    value={transferTargetLocationId}
                    onChange={(e) => setTransferTargetLocationId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">{t('common.quantity')} *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferQuantity}
                  onChange={(e) => setTransferQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">{t('common.notes')}</label>
                <input
                  type="text"
                  placeholder="e.g. Branch store replenishment"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-50 cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <ButtonSpinner text={t('common.processing')} />
                  ) : (
                    t('inventory.transferStock', 'Execute Transfer')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-lg space-y-4 border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-900">
                {editingLocation ? t('inventory.editLocation', 'Edit Warehouse Location') : t('inventory.addLocation', 'Add New Location')}
              </h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">{t('inventory.locationName', 'Location Name')} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Central Warehouse / Counter A"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">{t('common.code')}</label>
                <input
                  type="text"
                  placeholder="e.g. WH-01"
                  value={locationCode}
                  onChange={(e) => setLocationCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">{t('common.address')}</label>
                <input
                  type="text"
                  placeholder="e.g. Industrial Area Phase 1"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-50 cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <ButtonSpinner text={t('common.saving')} />
                  ) : (
                    t('common.save')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-lg space-y-4 border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-900">
                {editingSupplier ? t('inventory.editSupplier', 'Edit Supplier') : t('inventory.addSupplier', 'Register Supplier')}
              </h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">{t('inventory.supplierName')} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Electronics Wholesale Ltd"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">{t('common.name')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh"
                    value={supplierContact}
                    onChange={(e) => setSupplierContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">{t('common.phone')}</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">{t('common.email')}</label>
                <input
                  type="email"
                  placeholder="procurement@vendor.in"
                  value={supplierEmail}
                  onChange={(e) => setSupplierEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">{t('inventory.supplierGst')}</label>
                <input
                  type="text"
                  placeholder="29AAAAA0000A1Z5"
                  value={supplierTaxNumber}
                  onChange={(e) => setSupplierTaxNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-50 cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <ButtonSpinner text={t('common.saving')} />
                  ) : (
                    t('common.save')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
