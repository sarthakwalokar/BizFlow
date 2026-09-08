import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productsApi, Product, ProductType } from '../../api/products';
import { categoriesApi, Category } from '../../api/categories';
import { customersApi, Customer } from '../../api/customers';
import { billingApi, CreateOrderRequest, OrderItemRequest, Order, PaymentMethod } from '../../api/billing';
import { InvoiceReceiptModal } from '../../components/billing/InvoiceReceiptModal';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  UserPlus,
  Package,
  Scissors,
  CreditCard,
  QrCode,
  Wallet,
  Coins,
  CheckCircle2,
  AlertCircle,
  X,
  Receipt,
  RotateCcw,
  IndianRupee,
} from 'lucide-react';

interface CartItem {
  productId?: number;
  productName: string;
  productType: ProductType;
  quantity: number;
  unitPrice: number;
}

export const POSBillingPage: React.FC = () => {
  const { business } = useAuth();

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | ProductType>('ALL');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<string>('0');
  const [isPercentageDiscount, setIsPercentageDiscount] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [cashTendered, setCashTendered] = useState<string>('');

  // Customer State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  // New Customer Form
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  // Processing & Modal state
  const [processingOrder, setProcessingOrder] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const currency = business?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(currency);

  useEffect(() => {
    const initPOS = async () => {
      try {
        setLoadingCatalog(true);
        const [prodRes, catRes] = await Promise.all([
          productsApi.getProducts({ active: true, size: 200 }),
          categoriesApi.getCategories(true),
        ]);
        const items = Array.isArray(prodRes) ? prodRes : (prodRes?.content || []);
        setProducts(items);
        setCategories(catRes || []);
      } catch (err) {
        setErrorMessage('Failed to load products and categories.');
      } finally {
        setLoadingCatalog(false);
      }
    };

    initPOS();
  }, []);

  // Quick Customer Search
  useEffect(() => {
    const searchCust = async () => {
      if (customerSearch.trim().length > 1) {
        try {
          const res = await customersApi.quickSearch(customerSearch);
          setCustomerResults(res);
          setIsCustomerDropdownOpen(true);
        } catch {
          setCustomerResults([]);
        }
      } else {
        setCustomerResults([]);
        setIsCustomerDropdownOpen(false);
      }
    };

    const timeout = setTimeout(searchCust, 250);
    return () => clearTimeout(timeout);
  }, [customerSearch]);

  // Cart Management
  const addToCart = (product: Product) => {
    setErrorMessage(null);

    if (product.trackStock && (product.stockQuantity ?? 0) <= 0) {
      setErrorMessage(`"${product.name}" is currently out of stock.`);
      return;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.productId === product.id);

      if (existingIndex > -1) {
        const existing = prevCart[existingIndex];
        const newQty = existing.quantity + 1;

        if (product.trackStock && newQty > (product.stockQuantity ?? 0)) {
          setErrorMessage(
            `Cannot add more "${product.name}". Only ${product.stockQuantity ?? 0} in stock.`
          );
          return prevCart;
        }

        const updated = [...prevCart];
        updated[existingIndex] = { ...existing, quantity: newQty };
        return updated;
      }

      return [
        ...prevCart,
        {
          productId: product.id,
          productName: product.name,
          productType: product.productType,
          quantity: 1,
          unitPrice: product.price,
        },
      ];
    });
  };

  const updateQuantity = (productId: number | undefined, delta: number) => {
    setErrorMessage(null);
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.productId === productId) {
            const product = products.find((p) => p.id === productId);
            const newQty = item.quantity + delta;

            if (newQty <= 0) return null;

            if (product && product.trackStock && newQty > (product.stockQuantity ?? 0)) {
              setErrorMessage(
                `Cannot set quantity to ${newQty}. Only ${product.stockQuantity ?? 0} units available.`
              );
              return item;
            }

            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: number | undefined) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount('0');
    setOrderNotes('');
    setTransactionRef('');
    setCashTendered('');
    setSelectedCustomer(null);
    setCustomerSearch('');
    setErrorMessage(null);
  };

  // Pricing calculations
  const subtotal = cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

  const numDiscount = parseFloat(discount) || 0;
  const calculatedDiscount = isPercentageDiscount
    ? (subtotal * numDiscount) / 100
    : numDiscount;
  const clampedDiscount = Math.min(subtotal, Math.max(0, calculatedDiscount));

  const afterDiscount = Math.max(0, subtotal - clampedDiscount);

  const taxRate = business?.taxRate || 0;
  const taxInclusive = business?.taxInclusive || false;

  let calculatedTax = 0;
  let grandTotal = 0;

  if (taxInclusive) {
    grandTotal = afterDiscount;
    calculatedTax = afterDiscount - afterDiscount / (1 + taxRate / 100);
  } else {
    calculatedTax = (afterDiscount * taxRate) / 100;
    grandTotal = afterDiscount + calculatedTax;
  }

  // Cash change calculation
  const numCashTendered = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, numCashTendered - grandTotal);

  // Quick cash tender helper
  const handleQuickCash = (amount: number) => {
    setCashTendered(amount.toString());
  };

  // Submit Order Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Add items from the catalog first.');
      return;
    }

    setProcessingOrder(true);
    setErrorMessage(null);

    const itemsRequest: OrderItemRequest[] = cart.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productType: item.productType,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    const orderPayload: CreateOrderRequest = {
      customerId: selectedCustomer?.id,
      items: itemsRequest,
      discount: clampedDiscount,
      paymentMethod,
      transactionReference: transactionRef || undefined,
      notes: orderNotes || undefined,
    };

    try {
      const created = await billingApi.createOrder(orderPayload);
      setCompletedOrder(created);
      setSuccessToast(`Bill ${created.invoiceNumber} processed successfully!`);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Failed to process checkout. Please try again.'
      );
    } finally {
      setProcessingOrder(false);
    }
  };

  // Create Quick Customer
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    setCreatingCustomer(true);
    try {
      const newCust = await customersApi.createCustomer({
        name: newCustName,
        phone: newCustPhone || undefined,
        email: newCustEmail || undefined,
      });

      setSelectedCustomer(newCust);
      setIsNewCustomerModalOpen(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustEmail('');
      setSuccessToast(`Customer "${newCust.name}" attached to bill.`);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to register customer. Check phone or email.'
      );
    } finally {
      setCreatingCustomer(false);
    }
  };

  // Filter Catalog
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesCat =
      selectedCategory === 'ALL' ? true : p.category && String(p.category.id) === selectedCategory;
    const matchesType = selectedType === 'ALL' ? true : p.productType === selectedType;
    return matchesSearch && matchesCat && matchesType;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* LEFT: Catalog Section */}
      <div className="flex-1 w-full space-y-4">
        {/* Top Controls: Search & Category Pills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Scan barcode, type SKU or product name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setSelectedType('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedType === 'ALL'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedType('PHYSICAL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  selectedType === 'PHYSICAL'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package size={13} />
                <span>Goods</span>
              </button>
              <button
                onClick={() => setSelectedType('SERVICE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  selectedType === 'SERVICE'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scissors size={13} />
                <span>Services</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === String(cat.id)
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
          {loadingCatalog ? (
            <div className="col-span-full py-16 text-center text-slate-400">Loading catalog items...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
              <Package size={36} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-700">No matching catalog items found</p>
              <p className="text-xs text-slate-400">Try adjusting your keyword search or category filter.</p>
            </div>
          ) : (
            filteredProducts.map((prod) => {
              const inCartItem = cart.find((i) => i.productId === prod.id);
              const isOutOfStock = prod.trackStock && (prod.stockQuantity ?? 0) <= 0;
              const isLowStock = prod.trackStock && (prod.stockQuantity ?? 0) > 0 && (prod.stockQuantity ?? 0) <= (prod.lowStockThreshold ?? 5);

              return (
                <button
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  disabled={isOutOfStock}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 relative group cursor-pointer hover:border-indigo-400 active:scale-98 ${
                    inCartItem
                      ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                      : isOutOfStock
                      ? 'bg-slate-100/60 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white border-slate-200 hover:bg-slate-50/60 shadow-xs'
                  }`}
                >
                  {inCartItem && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-sm">
                      {inCartItem.quantity}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          prod.productType === 'PHYSICAL'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-pink-50 text-pink-700 border border-pink-200'
                        }`}
                      >
                        {prod.productType}
                      </span>
                      {prod.category && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                          {prod.category.name}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                      {prod.name}
                    </h4>

                    {prod.sku && (
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {prod.sku}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {prod.trackStock && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded inline-block ${
                            isOutOfStock
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isLowStock
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'text-slate-500'
                          }`}
                        >
                          {isOutOfStock
                            ? 'Out of Stock'
                            : isLowStock
                            ? `Low: ${prod.stockQuantity}`
                            : `${prod.stockQuantity} in stock`}
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-black text-slate-900">
                      {formatCurrency(prod.price, currency)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: Active Cart & Checkout Panel */}
      <div className="w-full lg:w-[420px] bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <ShoppingCart size={18} className="text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Billing Cart</h3>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
              {cart.reduce((a, b) => a + b.quantity, 0)} items
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Customer Attachment Section */}
        <div className="p-3 border-b border-slate-200 bg-white">
          {selectedCustomer ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h5 className="text-xs font-bold text-slate-900 truncate">
                    {selectedCustomer.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 truncate">
                    {selectedCustomer.phone || selectedCustomer.email || 'Attached Customer'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center space-x-1.5">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Attach Customer (Phone / Name)..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                  title="New Customer"
                >
                  <UserPlus size={14} />
                  <span>New</span>
                </button>
              </div>

              {/* Customer search dropdown */}
              {isCustomerDropdownOpen && customerResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {customerResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(c);
                        setIsCustomerDropdownOpen(false);
                        setCustomerSearch('');
                      }}
                      className="w-full p-2.5 text-left hover:bg-indigo-50 flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-500">{c.phone || c.email}</div>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-semibold">Select</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Toasts / Alerts */}
        {errorMessage && (
          <div className="mx-3 mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successToast && (
          <div className="mx-3 mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start space-x-2">
            <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 p-3 overflow-y-auto max-h-[300px] min-h-[160px] divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ShoppingCart size={32} className="mx-auto text-slate-300" />
              <p className="text-xs font-medium">Cart is currently empty</p>
              <p className="text-[10px] text-slate-400">Click products on the left to add items</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="py-2.5 flex items-center justify-between gap-2">
                <div className="overflow-hidden flex-1">
                  <h5 className="font-bold text-xs text-slate-900 truncate">
                    {item.productName}
                  </h5>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {formatCurrency(item.unitPrice, currency)}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-1.5 bg-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() => updateQuantity(item.productId, -1)}
                    className="w-6 h-6 rounded-md bg-white text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer shadow-xs"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, 1)}
                    className="w-6 h-6 rounded-md bg-white text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="text-right min-w-[65px]">
                  <span className="text-xs font-extrabold text-slate-900 block">
                    {formatCurrency(item.quantity * item.unitPrice, currency)}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-1 text-slate-300 hover:text-rose-500 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Calculation & Payment Methods Section */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3.5">
          {/* Subtotal, Discount & Tax */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(subtotal, currency)}
              </span>
            </div>

            {/* Discount row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1 text-slate-600">
                <span>Discount</span>
                <button
                  onClick={() => setIsPercentageDiscount(!isPercentageDiscount)}
                  className="px-1.5 py-0.5 rounded bg-slate-200 text-[10px] font-bold hover:bg-slate-300 cursor-pointer"
                >
                  {isPercentageDiscount ? '%' : currencySymbol}
                </button>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-20 px-2 py-0.5 rounded-lg border border-slate-200 text-right text-xs font-bold focus:ring-1 focus:ring-indigo-500 bg-white"
                />
                {clampedDiscount > 0 && (
                  <span className="text-rose-600 font-bold">
                    -{formatCurrency(clampedDiscount, currency)}
                  </span>
                )}
              </div>
            </div>

            {/* Tax row */}
            {taxRate > 0 && (
              <div className="flex items-center justify-between text-slate-600">
                <span>
                  {business?.taxName || 'GST'} ({taxRate}%{taxInclusive ? ' incl.' : ''})
                </span>
                <span className="font-bold text-slate-900">
                  {taxInclusive ? '(included) ' : '+'}
                  {formatCurrency(calculatedTax, currency)}
                </span>
              </div>
            )}

            {/* Grand Total */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Grand Total</span>
              <span className="font-black text-slate-900 text-xl">
                {formatCurrency(grandTotal, currency)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector Pills */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Payment Method
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                { id: 'CASH', label: 'Cash', icon: Coins },
                { id: 'CARD', label: 'Card', icon: CreditCard },
                { id: 'CREDIT', label: 'Credit', icon: Wallet },
                { id: 'OTHER', label: 'Other', icon: IndianRupee },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`py-1.5 px-1 rounded-xl text-center border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={14} className={isSelected ? 'text-white' : 'text-slate-500'} />
                    <span className="text-[10px] font-bold mt-0.5">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Cash Tender Presets for Cash Mode */}
          {paymentMethod === 'CASH' && (
            <div className="p-2.5 bg-slate-100/80 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Quick Cash Tender
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-slate-500">Tendered: {currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-20 px-2 py-0.5 text-right font-bold text-xs bg-white rounded border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {[
                  { label: 'Exact', amount: Math.ceil(grandTotal) },
                  { label: '₹100', amount: 100 },
                  { label: '₹200', amount: 200 },
                  { label: '₹500', amount: 500 },
                  { label: '₹2000', amount: 2000 },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickCash(preset.amount)}
                    className="px-2 py-1 bg-white hover:bg-indigo-50 border border-slate-200 text-[10px] font-bold text-slate-700 rounded-lg cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {numCashTendered >= grandTotal && grandTotal > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs font-bold text-emerald-700">
                  <span>Change Due:</span>
                  <span>{formatCurrency(changeDue, currency)}</span>
                </div>
              )}
            </div>
          )}

          {/* Transaction Ref input for digital payments */}
          {paymentMethod !== 'CASH' && (
            <input
              type="text"
              placeholder="UPI Txn ID / Card Auth Code (Optional)..."
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}

          {/* Checkout Action Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || processingOrder}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <Receipt size={17} />
            <span>
              {processingOrder
                ? 'Processing...'
                : `Charge ${formatCurrency(grandTotal, currency)}`}
            </span>
          </button>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      {completedOrder && (
        <InvoiceReceiptModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          onNewSale={() => {
            clearCart();
            if (searchInputRef.current) {
              searchInputRef.current.focus();
            }
          }}
        />
      )}

      {/* Quick Add Customer Modal */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Customer</h3>
                  <p className="text-[11px] text-slate-500">Quickly register a new customer</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCustomer}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {creatingCustomer ? 'Saving...' : 'Save & Attach'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
