import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productsApi, Product, ProductRequest, ProductType } from '../../api/products';
import { categoriesApi, Category } from '../../api/categories';
import {
  Package,
  Scissors,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Tag,
  Barcode,
  TrendingUp,
  Boxes,
} from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currency';

export const ProductListPage: React.FC = () => {
  const { business } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'ALL' | ProductType>('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [selectedActive, setSelectedActive] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState<ProductType>('PHYSICAL');
  const [categoryId, setCategoryId] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [costPrice, setCostPrice] = useState<string>('');
  const [sku, setSku] = useState('');
  const [active, setActive] = useState(true);
  const [trackStock, setTrackStock] = useState(true);
  const [stockQuantity, setStockQuantity] = useState('0');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');

  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProductsAndCategories = async () => {
    try {
      setLoading(true);
      const [prodPage, cats] = await Promise.all([
        productsApi.getProducts({
          size: 100,
          search: search || undefined,
          productType: selectedType !== 'ALL' ? selectedType : undefined,
          categoryId: selectedCategoryId !== 'ALL' ? Number(selectedCategoryId) : undefined,
          active: selectedActive !== 'ALL' ? selectedActive === 'ACTIVE' : undefined,
        }),
        categoriesApi.getCategories(),
      ]);

      const items = Array.isArray(prodPage) ? prodPage : (prodPage?.content || []);
      setProducts(items);
      setCategories(cats || []);
    } catch (err: any) {
      setErrorMessage('Failed to load products and services catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, [selectedType, selectedCategoryId, selectedActive]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProductsAndCategories();
  };

  const openAddModal = () => {
    setName('');
    setDescription('');
    // Suggest default type based on business vertical
    const isServiceBiz = business?.businessType === 'SALON' || business?.businessType === 'SERVICE';
    setProductType(isServiceBiz ? 'SERVICE' : 'PHYSICAL');
    setCategoryId(categories.length > 0 ? String(categories[0].id) : '');
    setPrice('');
    setCostPrice('');
    setSku('');
    setActive(true);
    setTrackStock(true);
    setStockQuantity('0');
    setLowStockThreshold('5');
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description || '');
    setProductType(p.productType);
    setCategoryId(p.category ? String(p.category.id) : '');
    setPrice(String(p.price));
    setCostPrice(p.costPrice !== undefined && p.costPrice !== null ? String(p.costPrice) : '');
    setSku(p.sku || '');
    setActive(p.active);
    setTrackStock(p.trackStock ?? false);
    setStockQuantity(p.stockQuantity !== undefined && p.stockQuantity !== null ? String(p.stockQuantity) : '0');
    setLowStockThreshold(p.lowStockThreshold !== undefined && p.lowStockThreshold !== null ? String(p.lowStockThreshold) : '5');
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const isPhysical = productType === 'PHYSICAL';
      const data: ProductRequest = {
        name,
        description: description || undefined,
        productType,
        categoryId: categoryId ? Number(categoryId) : undefined,
        price: parseFloat(price) || 0,
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        sku: sku || undefined,
        active,
        trackStock: isPhysical ? trackStock : false,
        stockQuantity: isPhysical && trackStock ? parseFloat(stockQuantity) || 0 : undefined,
        lowStockThreshold: isPhysical && trackStock ? parseFloat(lowStockThreshold) || 5 : undefined,
      };

      await productsApi.createProduct(data);
      setSuccessMessage(`"${name}" was successfully added to your catalog!`);
      setIsAddModalOpen(false);
      fetchProductsAndCategories();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to create product.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const isPhysical = productType === 'PHYSICAL';
      const data: ProductRequest = {
        name,
        description: description || undefined,
        productType,
        categoryId: categoryId ? Number(categoryId) : undefined,
        price: parseFloat(price) || 0,
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        sku: sku || undefined,
        active,
        trackStock: isPhysical ? trackStock : false,
        stockQuantity: isPhysical && trackStock ? parseFloat(stockQuantity) || 0 : undefined,
        lowStockThreshold: isPhysical && trackStock ? parseFloat(lowStockThreshold) || 5 : undefined,
      };

      await productsApi.updateProduct(editingProduct.id, data);
      setSuccessMessage(`"${name}" updated successfully!`);
      setEditingProduct(null);
      fetchProductsAndCategories();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to update product.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (p: Product) => {
    try {
      const updated = await productsApi.updateProductStatus(p.id, !p.active);
      setProducts(products.map((item) => (item.id === p.id ? updated : item)));
      setSuccessMessage(`"${p.name}" is now ${updated.active ? 'Active' : 'Inactive'}.`);
    } catch (err: any) {
      setErrorMessage('Failed to update product status.');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await productsApi.deleteProduct(deletingProduct.id);
      setSuccessMessage(`"${deletingProduct.name}" was permanently removed.`);
      setDeletingProduct(null);
      fetchProductsAndCategories();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to delete product.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const currency = business?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(currency);

  // Live profit calculation helper for modal
  const numPrice = parseFloat(price) || 0;
  const numCost = parseFloat(costPrice) || 0;
  const calculatedMargin =
    numPrice > 0 && numCost > 0 ? (((numPrice - numCost) / numPrice) * 100).toFixed(1) : null;
  const calculatedProfit = numPrice > 0 && numCost > 0 ? (numPrice - numCost).toFixed(2) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Products & Services Catalog
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage physical inventory items, service menus, prices, SKU codes, and cost margins.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus size={18} />
          <span>Add Product / Service</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-800 text-sm">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Type Segment Control */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-2xl w-full md:w-auto">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedType === 'ALL'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setSelectedType('PHYSICAL')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedType === 'PHYSICAL'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package size={14} />
              <span>Physical Goods</span>
            </button>
            <button
              onClick={() => setSelectedType('SERVICE')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedType === 'SERVICE'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scissors size={14} />
              <span>Services</span>
            </button>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-20 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold"
            >
              Search
            </button>
          </form>
        </div>

        {/* Sub filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <Filter size={14} />
            <span>Refine by:</span>
          </div>

          {/* Category dropdown */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status dropdown */}
          <select
            value={selectedActive}
            onChange={(e) => setSelectedActive(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive / Archived Only</option>
          </select>

          <span className="ml-auto text-xs font-semibold text-slate-400">
            {products.length} {products.length === 1 ? 'item' : 'items'} found
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Item & Code</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Margin</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Loading catalog items...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 space-y-2">
                    <Boxes size={36} className="mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-700">No items match your query</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Click "Add Product / Service" to expand your catalog or adjust active filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const hasMargin =
                    p.costPrice !== undefined &&
                    p.costPrice !== null &&
                    p.costPrice > 0 &&
                    p.price > 0;
                  const marginPct = hasMargin
                    ? (((p.price - p.costPrice!) / p.price) * 100).toFixed(0)
                    : null;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & SKU */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              p.productType === 'PHYSICAL'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-pink-50 text-pink-700'
                            }`}
                          >
                            {p.productType === 'PHYSICAL' ? (
                              <Package size={16} />
                            ) : (
                              <Scissors size={16} />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{p.name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                              {p.sku ? (
                                <span className="flex items-center gap-1 font-mono text-[10px]">
                                  <Barcode size={12} />
                                  {p.sku}
                                </span>
                              ) : (
                                <span>No SKU</span>
                              )}
                              {p.productType === 'PHYSICAL' && p.trackStock && (
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    (p.stockQuantity ?? 0) <= 0
                                      ? 'bg-rose-100 text-rose-700'
                                      : (p.stockQuantity ?? 0) <= (p.lowStockThreshold ?? 5)
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  Stock: {p.stockQuantity ?? 0}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            p.productType === 'PHYSICAL'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-pink-50 text-pink-700 border-pink-200'
                          }`}
                        >
                          {p.productType}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        {p.category ? (
                          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Tag size={12} className="text-slate-400" />
                            <span>{p.category.name}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Uncategorized</span>
                        )}
                      </td>

                      {/* Price & Cost */}
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {p.price.toFixed(2)} {currencySymbol}
                        </div>
                        {p.costPrice !== undefined && p.costPrice !== null && p.costPrice > 0 && (
                          <div className="text-[11px] text-slate-400">
                            Cost: {p.costPrice.toFixed(2)} {currencySymbol}
                          </div>
                        )}
                      </td>

                      {/* Margin */}
                      <td className="px-6 py-4">
                        {marginPct !== null ? (
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              Number(marginPct) >= 50
                                ? 'bg-emerald-50 text-emerald-700'
                                : Number(marginPct) > 0
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            <TrendingUp size={11} />
                            <span>{marginPct}%</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">-</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          title={`Click to ${p.active ? 'deactivate' : 'activate'}`}
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                            p.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {p.active ? (
                            <>
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={13} className="text-slate-400" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Item"
                            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(p)}
                            title="Delete Item"
                            className="p-2 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Product or Service</h3>
                  <p className="text-xs text-slate-500">Add an inventory item or service offering</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              {/* Type Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Item Classification <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center space-x-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      productType === 'PHYSICAL'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="productType"
                      value="PHYSICAL"
                      checked={productType === 'PHYSICAL'}
                      onChange={() => setProductType('PHYSICAL')}
                      className="sr-only"
                    />
                    <Package size={18} className="text-indigo-600" />
                    <div>
                      <div className="text-xs font-bold">Physical Good</div>
                      <div className="text-[10px] text-slate-500">Inventoried product</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      productType === 'SERVICE'
                        ? 'border-pink-600 bg-pink-50/50 text-pink-900 ring-2 ring-pink-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="productType"
                      value="SERVICE"
                      checked={productType === 'SERVICE'}
                      onChange={() => setProductType('SERVICE')}
                      className="sr-only"
                    />
                    <Scissors size={18} className="text-pink-600" />
                    <div>
                      <div className="text-xs font-bold">Service / Labor</div>
                      <div className="text-[10px] text-slate-500">Bookable / Performed</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Item Title / Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    productType === 'PHYSICAL'
                      ? 'e.g. Arabica Dark Roast (500g)'
                      : 'e.g. Deluxe Haircut & Wash'
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>

              {/* Category & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Category / Department
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white font-medium"
                  >
                    <option value="">Unassigned Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    SKU / Barcode Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SKU-10492"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Price & Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Selling Price ({currencySymbol}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-extrabold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Cost Price ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00 (Optional)"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* Margin Live Calculation */}
              {calculatedMargin && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                    <TrendingUp size={15} />
                    <span>Calculated Margin: {calculatedMargin}%</span>
                  </div>
                  <span className="font-extrabold text-emerald-700">
                    +{calculatedProfit} {currencySymbol} profit / unit
                  </span>
                </div>
              )}

              {/* Physical Inventory Tracking Options */}
              {productType === 'PHYSICAL' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Boxes size={16} className="text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">Track Stock Inventory</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={trackStock}
                        onChange={(e) => setTrackStock(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {trackStock && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          Initial Stock Quantity
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={stockQuantity}
                          onChange={(e) => setStockQuantity(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          Low Stock Alert Threshold
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={lowStockThreshold}
                          onChange={(e) => setLowStockThreshold(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-amber-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional details, sizing, or service scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="prodActive"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="prodActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Available for immediate sale & checkout
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Edit2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Item</h3>
                  <p className="text-xs text-slate-500">ID #{editingProduct.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              {/* Type Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Item Classification <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center space-x-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      productType === 'PHYSICAL'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="editProductType"
                      value="PHYSICAL"
                      checked={productType === 'PHYSICAL'}
                      onChange={() => setProductType('PHYSICAL')}
                      className="sr-only"
                    />
                    <Package size={18} className="text-indigo-600" />
                    <div>
                      <div className="text-xs font-bold">Physical Good</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      productType === 'SERVICE'
                        ? 'border-pink-600 bg-pink-50/50 text-pink-900 ring-2 ring-pink-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="editProductType"
                      value="SERVICE"
                      checked={productType === 'SERVICE'}
                      onChange={() => setProductType('SERVICE')}
                      className="sr-only"
                    />
                    <Scissors size={18} className="text-pink-600" />
                    <div>
                      <div className="text-xs font-bold">Service / Labor</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Item Title / Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>

              {/* Category & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Category / Department
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white font-medium"
                  >
                    <option value="">Unassigned Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    SKU / Barcode Code
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Price & Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Selling Price ({currencySymbol}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-extrabold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Cost Price ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* Margin Live Calculation */}
              {calculatedMargin && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                    <TrendingUp size={15} />
                    <span>Calculated Margin: {calculatedMargin}%</span>
                  </div>
                  <span className="font-extrabold text-emerald-700">
                    +{calculatedProfit} {currencySymbol} profit / unit
                  </span>
                </div>
              )}

              {/* Physical Inventory Tracking Options */}
              {productType === 'PHYSICAL' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Boxes size={16} className="text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">Track Stock Inventory</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={trackStock}
                        onChange={(e) => setTrackStock(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {trackStock && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          Current Stock Quantity
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={stockQuantity}
                          onChange={(e) => setStockQuantity(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          Low Stock Alert Threshold
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={lowStockThreshold}
                          onChange={(e) => setLowStockThreshold(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-amber-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="prodEditActive"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="prodEditActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Available for immediate sale & checkout
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center font-bold">
                <Trash2 size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Item</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold text-slate-900">"{deletingProduct.name}"</span>? This
              action cannot be undone.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteProduct}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
