import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  inventoryApi,
  StockItem,
  StockMovement,
  InventorySummary,
  Location,
  Supplier,
  Purchase,
  MovementType,
} from '../../api/inventory';
import { categoriesApi, Category } from '../../api/categories';
import { productsApi, Product } from '../../api/products';
import { businessApi } from '../../api/business';
import {
  Boxes,
  Package,
  AlertTriangle,
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
  Trash2,
  DollarSign,
  CheckCircle,
  XCircle,
  RefreshCw,
  Barcode,
} from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currency';

export const InventoryPage: React.FC = () => {
  const { business, user, updateBusinessState } = useAuth();
  const isOwner = user?.role === 'OWNER';
  const isLarge = business?.businessSize === 'LARGE';
  const isInventoryEnabled = business?.inventoryEnabled ?? true;

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
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('ALL');

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

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseSupplierId, setPurchaseSupplierId] = useState<string>('');
  const [purchaseLocationId, setPurchaseLocationId] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [purchaseNotes, setPurchaseNotes] = useState<string>('');
  const [purchaseLines, setPurchaseLines] = useState<Array<{ productId: string; productName: string; quantity: number; unitCost: number }>>([
    { productId: '', productName: '', quantity: 1, unitCost: 0 },
  ]);

  // Notifications
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currency = summary?.currency || business?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(currency);

  // Load Inventory Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [sumRes, stockRes, catsRes, prodRes] = await Promise.all([
        inventoryApi.getSummary(),
        inventoryApi.getStockList({
          search: stockSearch.trim() || undefined,
          categoryId: selectedCategory !== 'ALL' ? Number(selectedCategory) : undefined,
          lowStockOnly: lowStockOnly || undefined,
          size: 100,
        }),
        categoriesApi.getCategories(),
        productsApi.getProducts({ size: 200 }),
      ]);

      setSummary(sumRes);
      setStockItems(stockRes.content);
      setCategories(catsRes);
      setAllProducts(prodRes.content.filter((p) => p.productType === 'PHYSICAL'));

      if (isLarge) {
        const [locsRes, suppsRes, movsRes, purchRes] = await Promise.all([
          inventoryApi.getLocations(),
          inventoryApi.getActiveSuppliers(),
          inventoryApi.getMovements({ size: 50, movementType: movementTypeFilter !== 'ALL' ? (movementTypeFilter as MovementType) : undefined }),
          inventoryApi.searchPurchases({ size: 50 }),
        ]);
        setLocations(locsRes);
        setSuppliers(suppsRes);
        setMovements(movsRes.content);
        setPurchases(purchRes.content);
      }
    } catch (err: any) {
      setErrorMessage('Failed to load inventory data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, lowStockOnly, movementTypeFilter, isLarge]);

  const handleStockSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Toggle Global Inventory Enabled
  const handleToggleInventoryEnabled = async (enabled: boolean) => {
    try {
      setActionLoading(true);
      const updated = await businessApi.updateMyBusiness({
        name: business?.name || 'Business',
        inventoryEnabled: enabled,
      });
      updateBusinessState(updated);
      setSuccessMessage(`Inventory management is now ${enabled ? 'Enabled' : 'Disabled'}.`);
    } catch (err: any) {
      setErrorMessage('Failed to update inventory status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Stock Adjust Modal Handlers
  const openAdjustModal = (item: StockItem) => {
    setAdjustingItem(item);
    setAdjustDelta('0');
    setAdjustNewAbsolute(String(item.stockQuantity));
    setAdjustLocationId(locations.length > 0 ? String(locations[0].id) : '');
    setAdjustNotes('');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;
    setActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const delta = parseInt(adjustDelta, 10);
      const newAbs = adjustNewAbsolute.trim() !== '' ? parseInt(adjustNewAbsolute, 10) : undefined;

      await inventoryApi.adjustStock({
        productId: adjustingItem.productId,
        locationId: adjustLocationId ? Number(adjustLocationId) : undefined,
        adjustmentQuantity: isNaN(delta) || delta === 0 ? undefined : delta,
        newStockQuantity: newAbs,
        notes: adjustNotes || undefined,
      });

      setSuccessMessage(`Stock level for "${adjustingItem.productName}" updated successfully.`);
      setIsAdjustModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to adjust stock.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Stock Tracking for a Product
  const handleToggleProductTracking = async (item: StockItem) => {
    try {
      await productsApi.updateProduct(item.productId, {
        name: item.productName,
        productType: item.productType,
        price: item.price,
        costPrice: item.costPrice,
        sku: item.sku,
        trackStock: !item.trackStock,
        stockQuantity: item.stockQuantity,
        lowStockThreshold: item.lowStockThreshold,
      });
      setSuccessMessage(`Tracking ${!item.trackStock ? 'enabled' : 'disabled'} for "${item.productName}".`);
      loadData();
    } catch (err: any) {
      setErrorMessage('Failed to toggle tracking.');
    }
  };

  // Stock Transfer Handlers (Large Business)
  const openTransferModal = (defaultProduct?: StockItem) => {
    setTransferProductId(defaultProduct ? String(defaultProduct.productId) : allProducts.length > 0 ? String(allProducts[0].id) : '');
    setTransferSourceLocationId(locations.length > 0 ? String(locations[0].id) : '');
    setTransferTargetLocationId(locations.length > 1 ? String(locations[1].id) : '');
    setTransferQuantity('1');
    setTransferNotes('');
    setIsTransferModalOpen(true);
  };

  const handleSaveTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferProductId || !transferSourceLocationId || !transferTargetLocationId) return;
    setActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await inventoryApi.transferStock({
        productId: Number(transferProductId),
        sourceLocationId: Number(transferSourceLocationId),
        targetLocationId: Number(transferTargetLocationId),
        quantity: parseInt(transferQuantity, 10),
        notes: transferNotes || undefined,
      });

      setSuccessMessage('Stock transferred successfully between locations.');
      setIsTransferModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to transfer stock.');
    } finally {
      setActionLoading(false);
    }
  };

  // Location Modal Handlers (Large Business)
  const openAddLocationModal = () => {
    setEditingLocation(null);
    setLocationName('');
    setLocationCode('');
    setLocationAddress('');
    setLocationPhone('');
    setLocationPrimary(false);
    setIsLocationModalOpen(true);
  };

  const openEditLocationModal = (loc: Location) => {
    setEditingLocation(loc);
    setLocationName(loc.name);
    setLocationCode(loc.code || '');
    setLocationAddress(loc.address || '');
    setLocationPhone(loc.phone || '');
    setLocationPrimary(loc.primary);
    setIsLocationModalOpen(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      if (editingLocation) {
        await inventoryApi.updateLocation(editingLocation.id, {
          name: locationName.trim(),
          code: locationCode.trim() || undefined,
          address: locationAddress.trim() || undefined,
          phone: locationPhone.trim() || undefined,
          primary: locationPrimary,
        });
        setSuccessMessage(`Location "${locationName}" updated.`);
      } else {
        await inventoryApi.createLocation({
          name: locationName.trim(),
          code: locationCode.trim() || undefined,
          address: locationAddress.trim() || undefined,
          phone: locationPhone.trim() || undefined,
          primary: locationPrimary,
        });
        setSuccessMessage(`Location "${locationName}" created.`);
      }
      setIsLocationModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to save location.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLocation = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this location?')) return;
    try {
      await inventoryApi.deleteLocation(id);
      setSuccessMessage('Location deleted.');
      loadData();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to delete location.');
    }
  };

  // Supplier Modal Handlers (Large Business)
  const openAddSupplierModal = () => {
    setEditingSupplier(null);
    setSupplierName('');
    setSupplierContact('');
    setSupplierEmail('');
    setSupplierPhone('');
    setSupplierAddress('');
    setSupplierTaxNumber('');
    setIsSupplierModalOpen(true);
  };

  const openEditSupplierModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setSupplierName(sup.name);
    setSupplierContact(sup.contactPerson || '');
    setSupplierEmail(sup.email || '');
    setSupplierPhone(sup.phone || '');
    setSupplierAddress(sup.address || '');
    setSupplierTaxNumber(sup.taxNumber || '');
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

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
        setSuccessMessage(`Supplier "${supplierName}" updated.`);
      } else {
        await inventoryApi.createSupplier({
          name: supplierName.trim(),
          contactPerson: supplierContact.trim() || undefined,
          email: supplierEmail.trim() || undefined,
          phone: supplierPhone.trim() || undefined,
          address: supplierAddress.trim() || undefined,
          taxNumber: supplierTaxNumber.trim() || undefined,
        });
        setSuccessMessage(`Supplier "${supplierName}" created.`);
      }
      setIsSupplierModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to save supplier.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this supplier?')) return;
    try {
      await inventoryApi.deleteSupplier(id);
      setSuccessMessage('Supplier removed.');
      loadData();
    } catch (err: any) {
      setErrorMessage('Failed to delete supplier.');
    }
  };

  // Purchase Order Handlers (Large Business)
  const openAddPurchaseModal = () => {
    setPurchaseSupplierId(suppliers.length > 0 ? String(suppliers[0].id) : '');
    setPurchaseLocationId(locations.length > 0 ? String(locations[0].id) : '');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPurchaseNotes('');
    setPurchaseLines([{ productId: '', productName: '', quantity: 1, unitCost: 0 }]);
    setIsPurchaseModalOpen(true);
  };

  const addPurchaseLine = () => {
    setPurchaseLines([...purchaseLines, { productId: '', productName: '', quantity: 1, unitCost: 0 }]);
  };

  const removePurchaseLine = (index: number) => {
    if (purchaseLines.length > 1) {
      setPurchaseLines(purchaseLines.filter((_, idx) => idx !== index));
    }
  };

  const updatePurchaseLine = (index: number, field: string, value: any) => {
    const updated = [...purchaseLines];
    if (field === 'productId') {
      const selected = allProducts.find((p) => String(p.id) === value);
      updated[index].productId = value;
      updated[index].productName = selected ? selected.name : '';
      updated[index].unitCost = selected?.costPrice || 0;
    } else {
      (updated[index] as any)[field] = value;
    }
    setPurchaseLines(updated);
  };

  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const items = purchaseLines.map((line) => ({
        productId: line.productId ? Number(line.productId) : undefined,
        productName: line.productName.trim() || 'Purchased Item',
        quantity: line.quantity,
        unitCost: line.unitCost,
      }));

      await inventoryApi.createPurchase({
        supplierId: purchaseSupplierId ? Number(purchaseSupplierId) : undefined,
        locationId: purchaseLocationId ? Number(purchaseLocationId) : undefined,
        purchaseDate,
        notes: purchaseNotes || undefined,
        items,
      });

      setSuccessMessage('Purchase order recorded and stock received into inventory.');
      setIsPurchaseModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to record purchase.');
    } finally {
      setActionLoading(false);
    }
  };

  // If inventory is disabled globally
  if (!isInventoryEnabled) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Boxes size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">Inventory Tracking is Disabled</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Inventory management is currently turned off for {business?.name}. Enable it to start tracking stock quantities, receive low-stock alerts, and auto-reduce stock on checkout.
          </p>
          {isOwner && (
            <button
              onClick={() => handleToggleInventoryEnabled(true)}
              disabled={actionLoading}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {actionLoading ? 'Enabling...' : 'Enable Inventory Management'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isLarge ? 'Enterprise Inventory Hub' : 'Stock & Inventory'}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                isLarge ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {isLarge ? 'MULTI-LOCATION ENTERPRISE' : 'SINGLE-STORE FAST STOCK'}
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {isLarge
              ? 'Multi-branch warehouses, purchase orders, suppliers, and transaction-safe stock ledger'
              : 'Streamlined stock tracking, live thresholds, and instant stock level adjustments'}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => loadData()}
            title="Refresh Data"
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          {isLarge && isOwner && (
            <>
              <button
                onClick={() => openTransferModal()}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <ArrowRightLeft size={15} />
                <span>Transfer Stock</span>
              </button>

              <button
                onClick={openAddPurchaseModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={15} />
                <span>Record Inward Goods</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-800 text-xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-800 text-xs">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tracked Items */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tracked Products</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {summary?.totalTrackedProducts ?? 0}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Active in catalog</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Package size={20} />
          </div>
        </div>

        {/* Healthy Stock */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">In Stock</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {summary?.inStockProducts ?? 0}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Healthy levels</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle size={20} />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Low Stock</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {summary?.lowStockProducts ?? 0}
            </span>
            <span className="text-[10px] text-amber-600/80 font-medium">Reorder suggested</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle size={20} />
          </div>
        </div>

        {/* Valuation or Out of Stock */}
        {isLarge ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Valuation</span>
              <span className="text-xl font-black text-slate-900 mt-1 block">
                {(summary?.totalInventoryValuation ?? 0).toFixed(2)} {currencySymbol}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Cost Asset Value</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <DollarSign size={20} />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Out of Stock</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">
                {summary?.outOfStockProducts ?? 0}
              </span>
              <span className="text-[10px] text-rose-500 font-medium">Zero quantity</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <XCircle size={20} />
            </div>
          </div>
        )}
      </div>

      {/* Large Business Navigation Tabs */}
      {isLarge && (
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('STOCK')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'STOCK' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes size={15} />
            <span>Stock &amp; Balances</span>
          </button>

          <button
            onClick={() => setActiveTab('MOVEMENTS')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'MOVEMENTS' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History size={15} />
            <span>Movements Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('PURCHASES')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'PURCHASES' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart size={15} />
            <span>Purchases &amp; Inward</span>
          </button>

          <button
            onClick={() => setActiveTab('SUPPLIERS')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SUPPLIERS' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={15} />
            <span>Suppliers ({suppliers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('LOCATIONS')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'LOCATIONS' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 size={15} />
            <span>Branches / Locations ({locations.length})</span>
          </button>
        </div>
      )}

      {/* TAB 1: STOCK & BALANCES (For Both Small and Large) */}
      {(!isLarge || activeTab === 'STOCK') && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          {/* Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <form onSubmit={handleStockSearch} className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search item, SKU..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
              />
            </form>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <label className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span className="text-amber-700">Low Stock Only</span>
              </label>
            </div>
          </div>

          {/* Stock Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="px-4 py-3">Product / SKU</th>
                  <th className="px-4 py-3">Tracking</th>
                  <th className="px-4 py-3">Current Stock</th>
                  {isLarge && <th className="px-4 py-3">Multi-Branch Stock</th>}
                  <th className="px-4 py-3">Min Alert Level</th>
                  <th className="px-4 py-3">Unit Price / Cost</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={isLarge ? 7 : 6} className="px-4 py-12 text-center text-slate-400">
                      Loading inventory items...
                    </td>
                  </tr>
                ) : stockItems.length === 0 ? (
                  <tr>
                    <td colSpan={isLarge ? 7 : 6} className="px-4 py-12 text-center text-slate-500 space-y-2">
                      <Boxes size={32} className="mx-auto text-slate-300" />
                      <p className="font-bold text-slate-700">No products found</p>
                      <p className="text-[11px] text-slate-400">Add physical items in Products catalog to manage stock.</p>
                    </td>
                  </tr>
                ) : (
                  stockItems.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & SKU */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          {item.sku ? (
                            <span className="flex items-center gap-1 font-mono text-[10px]">
                              <Barcode size={11} />
                              {item.sku}
                            </span>
                          ) : (
                            <span>No SKU</span>
                          )}
                          {item.categoryName && <span>• {item.categoryName}</span>}
                        </div>
                      </td>

                      {/* Track Toggle */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggleProductTracking(item)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            item.trackStock
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                        >
                          {item.trackStock ? 'Tracked' : 'Disabled'}
                        </button>
                      </td>

                      {/* Current Stock */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-black border ${
                            !item.trackStock
                              ? 'bg-slate-50 text-slate-400 border-slate-200'
                              : item.outOfStock
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : item.lowStock
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <span>{item.trackStock ? item.stockQuantity : '—'}</span>
                          {item.lowStock && <AlertTriangle size={12} className="text-amber-600" />}
                        </span>
                      </td>

                      {/* Multi-Location Stock Breakdown (Large) */}
                      {isLarge && (
                        <td className="px-4 py-3.5">
                          {item.locationStocks && item.locationStocks.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.locationStocks.map((ls) => (
                                <span
                                  key={ls.locationId}
                                  className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium"
                                >
                                  {ls.locationName}: <strong>{ls.quantity}</strong>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Primary stock only</span>
                          )}
                        </td>
                      )}

                      {/* Min Alert Level */}
                      <td className="px-4 py-3.5 font-medium text-slate-600">
                        {item.trackStock ? item.lowStockThreshold : '—'}
                      </td>

                      {/* Price & Cost */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">
                          {item.price.toFixed(2)} {currencySymbol}
                        </div>
                        {item.costPrice !== undefined && item.costPrice !== null && (
                          <div className="text-[10px] text-slate-400">
                            Cost: {item.costPrice.toFixed(2)} {currencySymbol}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => openAdjustModal(item)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK MOVEMENTS LEDGER (Large Business) */}
      {isLarge && activeTab === 'MOVEMENTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Stock Movements Audit Ledger</h2>
              <p className="text-xs text-slate-500">Immutable record of all sales, purchases, transfers, and corrections</p>
            </div>

            <select
              value={movementTypeFilter}
              onChange={(e) => setMovementTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Movement Types</option>
              <option value="SALE">Sales (Checkout Decrement)</option>
              <option value="PURCHASE">Purchases (Inward Stock)</option>
              <option value="ADJUSTMENT">Manual Adjustments</option>
              <option value="TRANSFER">Inter-Branch Transfers</option>
              <option value="RETURN">Order Returns / Restocking</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="px-4 py-3">Date &amp; Time</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Stock Balance</th>
                  <th className="px-4 py-3">Reference / Notes</th>
                  <th className="px-4 py-3">Staff Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {m.productName}
                        {m.productSku && <span className="text-[10px] text-slate-400 font-mono block">{m.productSku}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            m.movementType === 'PURCHASE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : m.movementType === 'SALE'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : m.movementType === 'TRANSFER'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : m.movementType === 'RETURN'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {m.movementType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-black">
                        <span className={m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono">
                        {m.previousStock} &rarr; <strong className="text-slate-900">{m.newStock}</strong>
                      </td>
                      <td className="px-4 py-3">
                        {m.referenceNumber && (
                          <span className="font-mono text-[11px] font-bold text-indigo-600 block">
                            {m.referenceNumber}
                          </span>
                        )}
                        <span className="text-slate-500 text-[11px]">{m.notes || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {m.createdBy || 'System'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PURCHASES & INWARD GOODS (Large Business) */}
      {isLarge && activeTab === 'PURCHASES' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Purchase Orders &amp; Inward Shipments</h2>
              <p className="text-xs text-slate-500">Record inventory intake from suppliers into locations</p>
            </div>
            <button
              onClick={openAddPurchaseModal}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Plus size={15} />
              <span>Record Purchase</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Items Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600">{p.purchaseNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{p.purchaseDate}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{p.supplierName || '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{p.locationName || 'Main Store'}</td>
                      <td className="px-4 py-3 font-black text-slate-900">
                        {p.totalAmount.toFixed(2)} {currencySymbol}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            p.status === 'RECEIVED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : p.status === 'ORDERED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {p.items?.length || 0} items
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SUPPLIERS (Large Business) */}
      {isLarge && activeTab === 'SUPPLIERS' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Vendors &amp; Supplier Directory</h2>
              <p className="text-xs text-slate-500">Manage vendor contact info, tax registration, and order history</p>
            </div>
            {isOwner && (
              <button
                onClick={openAddSupplierModal}
                className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Plus size={15} />
                <span>Add Supplier</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-slate-400 text-xs">
                No suppliers configured. Click "Add Supplier" to create your first vendor.
              </div>
            ) : (
              suppliers.map((sup) => (
                <div key={sup.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{sup.name}</h3>
                      {sup.contactPerson && <p className="text-[11px] text-slate-500">{sup.contactPerson}</p>}
                    </div>
                    {isOwner && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openEditSupplierModal(sup)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(sup.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 border-t border-slate-200/60 pt-2 font-medium">
                    {sup.email && <div>Email: <span className="text-slate-800">{sup.email}</span></div>}
                    {sup.phone && <div>Phone: <span className="text-slate-800">{sup.phone}</span></div>}
                    {sup.taxNumber && <div>Tax ID: <span className="text-slate-800 font-mono">{sup.taxNumber}</span></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: LOCATIONS & WAREHOUSES (Large Business) */}
      {isLarge && activeTab === 'LOCATIONS' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Branches &amp; Warehouse Locations</h2>
              <p className="text-xs text-slate-500">Multi-location retail branches, storage depots, and primary counters</p>
            </div>
            {isOwner && (
              <button
                onClick={openAddLocationModal}
                className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Plus size={15} />
                <span>Add Location</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {locations.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-slate-400 text-xs">
                No custom locations added. Defaulting to Main Store.
              </div>
            ) : (
              locations.map((loc) => (
                <div key={loc.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-sm text-slate-900">{loc.name}</h3>
                        {loc.primary && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-100 text-indigo-700">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      {loc.code && <p className="text-[11px] text-slate-400 font-mono uppercase mt-0.5">Code: {loc.code}</p>}
                    </div>

                    {isOwner && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openEditLocationModal(loc)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white"
                        >
                          <Edit2 size={14} />
                        </button>
                        {!loc.primary && (
                          <button
                            onClick={() => handleDeleteLocation(loc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 border-t border-slate-200/60 pt-2 font-medium">
                    {loc.phone && <div>Phone: <span className="text-slate-800">{loc.phone}</span></div>}
                    {loc.address && <div className="text-[11px] text-slate-500">{loc.address}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* QUICK STOCK ADJUST MODAL */}
      {isAdjustModalOpen && adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Adjust Stock Level</h3>
                <p className="text-xs text-slate-400 font-medium">{adjustingItem.productName}</p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Current Stock Count:</span>
                <span className="font-black text-slate-900 text-sm">{adjustingItem.stockQuantity} units</span>
              </div>

              {isLarge && locations.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Location / Branch</label>
                  <select
                    value={adjustLocationId}
                    onChange={(e) => setAdjustLocationId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  >
                    <option value="">All Locations / Primary</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} {l.primary ? '(Primary)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Add / Deduct (+/-)</label>
                  <input
                    type="number"
                    value={adjustDelta}
                    onChange={(e) => {
                      setAdjustDelta(e.target.value);
                      const deltaVal = parseInt(e.target.value, 10) || 0;
                      setAdjustNewAbsolute(String(adjustingItem.stockQuantity + deltaVal));
                    }}
                    placeholder="+10 or -5"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">New Total Balance</label>
                  <input
                    type="number"
                    min="0"
                    value={adjustNewAbsolute}
                    onChange={(e) => {
                      setAdjustNewAbsolute(e.target.value);
                      const absVal = parseInt(e.target.value, 10) || 0;
                      setAdjustDelta(String(absVal - adjustingItem.stockQuantity));
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono text-indigo-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Reason / Audit Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Physical stock count, damaged item, or return"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK TRANSFER MODAL (Large Business) */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Transfer Stock Between Locations</h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTransfer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Product Item</label>
                <select
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                >
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.sku ? `(${p.sku})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">From (Source)</label>
                  <select
                    value={transferSourceLocationId}
                    onChange={(e) => setTransferSourceLocationId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">To (Destination)</label>
                  <select
                    value={transferTargetLocationId}
                    onChange={(e) => setTransferTargetLocationId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
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
                <label className="text-xs font-bold text-slate-700">Quantity to Transfer</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferQuantity}
                  onChange={(e) => setTransferQuantity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Transfer Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Restocking retail shelf from warehouse"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {actionLoading ? 'Transferring...' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PURCHASE MODAL (Large Business) */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-5 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record Inward Goods / Purchase</h3>
                <p className="text-xs text-slate-400">Increase stock quantities into warehouse upon receipt</p>
              </div>
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Supplier</label>
                  <select
                    value={purchaseSupplierId}
                    onChange={(e) => setPurchaseSupplierId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  >
                    <option value="">Direct / Walk-in Vendor</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Receiving Location</label>
                  <select
                    value={purchaseLocationId}
                    onChange={(e) => setPurchaseLocationId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Purchase Lines */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Line Items</span>
                  <button
                    type="button"
                    onClick={addPurchaseLine}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {purchaseLines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <select
                        value={line.productId}
                        onChange={(e) => updatePurchaseLine(idx, 'productId', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                      >
                        <option value="">Select Catalog Item or Custom...</option>
                        {allProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Item Title"
                        value={line.productName}
                        onChange={(e) => updatePurchaseLine(idx, 'productName', e.target.value)}
                        className="w-36 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
                      />

                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={line.quantity}
                        onChange={(e) => updatePurchaseLine(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                        className="w-16 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-center"
                      />

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Unit Cost"
                        value={line.unitCost}
                        onChange={(e) => updatePurchaseLine(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-right"
                      />

                      {purchaseLines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePurchaseLine(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Notes / Invoice Ref</label>
                <input
                  type="text"
                  placeholder="e.g. Vendor Invoice #9482 received in good condition"
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {actionLoading ? 'Recording...' : 'Receive Inward Goods'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCATION ADD/EDIT MODAL (Large Business) */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingLocation ? 'Edit Location' : 'Add Location / Branch'}
              </h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Location Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Downtown Flagship or Depot B"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Branch Code</label>
                  <input
                    type="text"
                    placeholder="e.g. WH-01"
                    value={locationCode}
                    onChange={(e) => setLocationCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 555 000 0000"
                    value={locationPhone}
                    onChange={(e) => setLocationPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Address</label>
                <textarea
                  rows={2}
                  placeholder="Physical street address..."
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="locPrimary"
                  checked={locationPrimary}
                  onChange={(e) => setLocationPrimary(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="locPrimary" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Set as Primary Store Location
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPLIER ADD/EDIT MODAL (Large Business) */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingSupplier ? 'Edit Supplier' : 'Add Vendor / Supplier'}
              </h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Beans & Dairy Co."
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. John Miller"
                    value={supplierContact}
                    onChange={(e) => setSupplierContact(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 555 123 4567"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email</label>
                <input
                  type="email"
                  placeholder="orders@supplier.com"
                  value={supplierEmail}
                  onChange={(e) => setSupplierEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tax / VAT ID</label>
                <input
                  type="text"
                  placeholder="e.g. US-84920482"
                  value={supplierTaxNumber}
                  onChange={(e) => setSupplierTaxNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
