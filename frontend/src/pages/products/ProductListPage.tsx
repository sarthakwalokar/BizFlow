import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productsApi, Product, ProductRequest, ProductType } from '../../api/products';
import { categoriesApi, Category } from '../../api/categories';
import {
  Package,
  Scissors,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';
import { TableSkeleton, ButtonSpinner } from '../../components/common/LoadingStates';

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

  const currency = business?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  const fetchProductsAndCategories = async () => {
    try {
      setLoading(true);
      const [prodPage, cats] = await Promise.all([
        productsApi.getProducts({
          size: 100,
          search: search.trim() || undefined,
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
    const isServiceBiz = business?.businessType === 'SALON' || business?.businessType === 'SERVICE';
    setProductType(isServiceBiz ? 'SERVICE' : 'PHYSICAL');
    setCategoryId(categories.length > 0 ? String(categories[0].id) : '');
    setPrice('');
    setCostPrice('');
    setSku('');
    setActive(true);
    setTrackStock(!isServiceBiz);
    setStockQuantity('0');
    setLowStockThreshold('5');
    setIsAddModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description || '');
    setProductType(prod.productType);
    setCategoryId(prod.category ? String(prod.category.id) : '');
    setPrice(String(prod.price));
    setCostPrice(prod.costPrice !== undefined ? String(prod.costPrice) : '');
    setSku(prod.sku || '');
    setActive(prod.active);
    setTrackStock(prod.trackStock ?? true);
    setStockQuantity(String(prod.stockQuantity ?? 0));
    setLowStockThreshold(String(prod.lowStockThreshold ?? 5));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: ProductRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      productType,
      categoryId: categoryId ? Number(categoryId) : undefined,
      price: parseFloat(price) || 0,
      costPrice: costPrice ? parseFloat(costPrice) : undefined,
      sku: sku.trim() || undefined,
      active,
      trackStock: productType === 'PHYSICAL' ? trackStock : false,
      stockQuantity: productType === 'PHYSICAL' && trackStock ? parseInt(stockQuantity) || 0 : undefined,
      lowStockThreshold: productType === 'PHYSICAL' && trackStock ? parseInt(lowStockThreshold) || 5 : undefined,
    };

    try {
      await productsApi.createProduct(payload);
      setSuccessMessage(`"${payload.name}" added to catalog.`);
      setIsAddModalOpen(false);
      fetchProductsAndCategories();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to create product item.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !name.trim() || !price) return;

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: ProductRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      productType,
      categoryId: categoryId ? Number(categoryId) : undefined,
      price: parseFloat(price) || 0,
      costPrice: costPrice ? parseFloat(costPrice) : undefined,
      sku: sku.trim() || undefined,
      active,
      trackStock: productType === 'PHYSICAL' ? trackStock : false,
      stockQuantity: productType === 'PHYSICAL' && trackStock ? parseInt(stockQuantity) || 0 : undefined,
      lowStockThreshold: productType === 'PHYSICAL' && trackStock ? parseInt(lowStockThreshold) || 5 : undefined,
    };

    try {
      await productsApi.updateProduct(editingProduct.id, payload);
      setSuccessMessage(`"${payload.name}" updated successfully.`);
      setEditingProduct(null);
      fetchProductsAndCategories();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to update product item.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await productsApi.deleteProduct(deletingProduct.id);
      setSuccessMessage(`"${deletingProduct.name}" removed from catalog.`);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Products &amp; Services</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage your retail goods, professional services, inventory alerts, and pricing.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Item</span>
        </button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={15} className="text-brand-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-brand-700 hover:text-brand-900 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle size={15} className="text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 hover:text-red-900 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-card space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, barcode or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:border-brand-600"
            >
              <option value="ALL">All Types</option>
              <option value="PHYSICAL">Goods (Physical)</option>
              <option value="SERVICE">Services</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:border-brand-600"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Active Status Filter */}
            <select
              value={selectedActive}
              onChange={(e) => setSelectedActive(e.target.value)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:border-brand-600"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Archived</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Catalog Table */}
      {loading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500 space-y-1">
                      <Package size={32} className="mx-auto text-zinc-300" />
                      <p className="font-bold text-zinc-700">No items match your query</p>
                      <p className="text-[11px] text-zinc-400">Add a product or adjust your filters.</p>
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => {
                    const isOutOfStock = prod.trackStock && (prod.stockQuantity ?? 0) <= 0;
                    const isLowStock = prod.trackStock && (prod.stockQuantity ?? 0) > 0 && (prod.stockQuantity ?? 0) <= (prod.lowStockThreshold ?? 5);

                    return (
                      <tr key={prod.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              prod.productType === 'PHYSICAL'
                                ? 'bg-zinc-100 text-zinc-700'
                                : 'bg-flow-50 text-flow-700'
                            }`}>
                              {prod.productType === 'PHYSICAL' ? <Package size={16} /> : <Scissors size={16} />}
                            </div>
                            <div>
                              <span className="font-bold text-zinc-900 block">{prod.name}</span>
                              {prod.sku && (
                                <span className="text-[10px] text-zinc-400 font-mono">SKU: {prod.sku}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            prod.productType === 'PHYSICAL'
                              ? 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                              : 'bg-flow-50 text-flow-700 border border-flow-200'
                          }`}>
                            {prod.productType}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-zinc-600">
                          {prod.category ? prod.category.name : '—'}
                        </td>

                        <td className="py-3 px-4 font-black text-zinc-950">
                          {formatCurrency(prod.price, currency)}
                          {prod.costPrice !== undefined && prod.costPrice > 0 && (
                            <span className="block text-[10px] text-zinc-400 font-normal">
                              Cost: {formatCurrency(prod.costPrice, currency)}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {prod.trackStock ? (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                isOutOfStock
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : isLowStock
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-zinc-100 text-zinc-700'
                              }`}
                            >
                              {isOutOfStock
                                ? 'Out of Stock'
                                : isLowStock
                                ? `Low: ${prod.stockQuantity}`
                                : `${prod.stockQuantity} in stock`}
                            </span>
                          ) : (
                            <span className="text-zinc-400 text-[11px]">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              prod.active
                                ? 'bg-brand-50 text-brand-700 border border-brand-200'
                                : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {prod.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => setDeletingProduct(prod)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 size={14} />
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
      )}

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-dropdown space-y-4 border border-zinc-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Package size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    {editingProduct ? 'Edit Catalog Item' : 'Add New Catalog Item'}
                  </h3>
                  <p className="text-[11px] text-zinc-500">Configure item pricing and stock</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Chai (Large) / Haircut & Style"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Item Type *</label>
                  <select
                    value={productType}
                    onChange={(e) => {
                      const t = e.target.value as ProductType;
                      setProductType(t);
                      if (t === 'SERVICE') setTrackStock(false);
                    }}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="PHYSICAL">Goods (Physical Product)</option>
                    <option value="SERVICE">Service / Labour</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="">None (Uncategorized)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">
                    Selling Price ({currencySymbol}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-bold focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Cost Price ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Optional unit cost"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:ring-1 focus:ring-brand-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">SKU / Barcode (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. PRD-890123"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:ring-1 focus:ring-brand-600"
                />
              </div>

              {productType === 'PHYSICAL' && (
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trackStock}
                      onChange={(e) => setTrackStock(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-600"
                    />
                    <span className="text-xs font-bold text-zinc-800">Track stock inventory for this item</span>
                  </label>

                  {trackStock && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-zinc-600">Stock Quantity</label>
                        <input
                          type="number"
                          min="0"
                          value={stockQuantity}
                          onChange={(e) => setStockQuantity(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-bold focus:ring-1 focus:ring-brand-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-zinc-600">Low Stock Alert Level</label>
                        <input
                          type="number"
                          min="0"
                          value={lowStockThreshold}
                          onChange={(e) => setLowStockThreshold(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-bold focus:ring-1 focus:ring-brand-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {actionLoading ? (
                    <ButtonSpinner text="Saving..." />
                  ) : editingProduct ? (
                    'Update Item'
                  ) : (
                    'Add to Catalog'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-dropdown space-y-4 border border-zinc-200">
            <div className="flex items-center space-x-2.5 text-rose-600">
              <Trash2 size={20} />
              <h3 className="text-base font-bold text-zinc-900">Delete Catalog Item</h3>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to remove{' '}
              <strong className="text-zinc-900">"{deletingProduct.name}"</strong>?
              This will deactivate or delete the item from your catalog.
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {actionLoading ? <ButtonSpinner text="Deleting..." /> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
