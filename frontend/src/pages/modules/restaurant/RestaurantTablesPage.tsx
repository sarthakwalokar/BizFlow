import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency } from '../../../utils/currency';
import {
  restaurantApi,
  RestaurantTable,
  RestaurantOrder,
  RestaurantOrderItem,
} from '../../../api/modules';
import { productsApi, Product } from '../../../api/products';
import { categoriesApi, Category } from '../../../api/categories';
import {
  UtensilsCrossed,
  Plus,
  Users,
  CheckCircle2,
  X,
  Search,
  ShoppingBag,
  ChevronRight,
  Receipt,
  Printer,
  CreditCard,
  QrCode,
  Banknote,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  ChefHat,
  Calendar,
  Clock,
  Trash2,
  AlertTriangle,
  FileText,
  Loader2,
} from 'lucide-react';

type ViewMode = 'TABLES' | 'PARCELS';

export const RestaurantTablesPage: React.FC = () => {
  const { t } = useTranslation();
  const { business } = useAuth();
  const currency = business?.currency || 'INR';

  const [viewMode, setViewMode] = useState<ViewMode>('TABLES');
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [takeawayOrders, setTakeawayOrders] = useState<RestaurantOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>('ALL');

  // Modal States: Tables
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newCapacity, setNewCapacity] = useState(4);
  const [newSection, setNewSection] = useState('Main Dining');

  // Table Reservation Modal State
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveTableTarget, setReserveTableTarget] = useState<RestaurantTable | null>(null);
  const [reserveCustomerName, setReserveCustomerName] = useState('');
  const [reserveCustomerPhone, setReserveCustomerPhone] = useState('');
  const [reserveNotes, setReserveNotes] = useState('');
  const [reserveTime, setReserveTime] = useState('');
  const [reserving, setReserving] = useState(false);

  // Active Selected Table Drawer
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [tableOrder, setTableOrder] = useState<RestaurantOrder | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);

  // Add Item to Order State (Dine-in or Parcel)
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [productSearch, setProductSearch] = useState('');
  const [orderItemsCart, setOrderItemsCart] = useState<
    { productId: number; itemName: string; quantity: number; unitPrice: number; notes: string }[]
  >([]);

  // Parcel / Takeaway Flow State
  const [showParcelModal, setShowParcelModal] = useState(false);
  const [parcelCustomerName, setParcelCustomerName] = useState('');
  const [parcelCustomerPhone, setParcelCustomerPhone] = useState('');
  const [parcelCustomerEmail, setParcelCustomerEmail] = useState('');
  const [parcelCustomerAddress, setParcelCustomerAddress] = useState('');
  const [parcelNotes, setParcelNotes] = useState('');
  const [parcelCart, setParcelCart] = useState<
    { productId: number; itemName: string; quantity: number; unitPrice: number; notes: string }[]
  >([]);
  const [parcelProductSearch, setParcelProductSearch] = useState('');
  const [parcelCategory, setParcelCategory] = useState<string>('ALL');

  // Payment Settlement Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [settlementTarget, setSettlementTarget] = useState<{
    type: 'DINE_IN' | 'TAKEAWAY';
    tableId?: number;
    tableName?: string;
    orderId?: number;
    orderNumber?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    items: RestaurantOrderItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    grandTotal: number;
  } | null>(null);

  const [settleCustomerName, setSettleCustomerName] = useState('');
  const [settleCustomerPhone, setSettleCustomerPhone] = useState('');
  const [settleCustomerEmail, setSettleCustomerEmail] = useState('');
  const [settleCustomerAddress, setSettleCustomerAddress] = useState('');
  const [showSettleCustomerForm, setShowSettleCustomerForm] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [settlingPayment, setSettlingPayment] = useState(false);

  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    orderNumber: string;
    orderType: string;
    tableName?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    items: RestaurantOrderItem[];
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
    paymentMethod: string;
    cashTendered?: number;
    changeDue?: number;
    paidAt: string;
  } | null>(null);

  // Async Confirmation Dialog
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmText: string;
    danger?: boolean;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Lock background scrolling whenever any modal overlay is active
  const isAnyModalOpen =
    showAddTableModal ||
    showReserveModal ||
    showAddItemModal ||
    showParcelModal ||
    showPaymentModal ||
    showReceiptModal ||
    !!confirmModal;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('receipt-modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('receipt-modal-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('receipt-modal-open');
    };
  }, [isAnyModalOpen]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const [tableData, orderData, prodData, catData] = await Promise.all([
        restaurantApi.getTables().catch(() => []),
        restaurantApi.getOrders().catch(() => []),
        productsApi.getProducts({ size: 100, active: true }).catch(() => ({ content: [] })),
        categoriesApi.getCategories().catch(() => []),
      ]);
      setTables(tableData);
      const takeaways = (orderData || []).filter(
        (o) => o.orderType === 'TAKEAWAY' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
      );
      setTakeawayOrders(takeaways);
      setProducts(prodData.content || []);
      setCategories(catData || []);

      if (selectedTable) {
        const updated = tableData.find((t) => t.id === selectedTable.id);
        if (updated) {
          setSelectedTable(updated);
          setTableOrder(updated.activeOrder || null);
        }
      }
    } catch (err) {
      console.error('Failed to load restaurant data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum.trim()) return;
    try {
      await restaurantApi.createTable({
        tableNumber: newTableNum.trim(),
        name: newTableName.trim() || `Table ${newTableNum.trim()}`,
        capacity: newCapacity,
        sectionFloor: newSection.trim() || 'Main Dining',
      });
      setShowAddTableModal(false);
      setNewTableNum('');
      setNewTableName('');
      setNewCapacity(4);
      fetchTables();
    } catch (err) {
      console.error('Failed to create table', err);
    }
  };

  // Open Reservation Modal
  const handleOpenReserveModal = (table: RestaurantTable, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReserveTableTarget(table);
    setReserveCustomerName(table.reservationCustomerName || '');
    setReserveCustomerPhone(table.reservationCustomerPhone || '');
    setReserveNotes(table.reservationNotes || '');
    setReserveTime(table.reservationTime || '');
    setShowReserveModal(true);
  };

  // Submit Table Reservation
  const handleSaveReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveTableTarget || !reserveCustomerName.trim()) return;
    try {
      setReserving(true);
      const updated = await restaurantApi.reserveTable(reserveTableTarget.id, {
        customerName: reserveCustomerName.trim(),
        customerPhone: reserveCustomerPhone.trim() || undefined,
        notes: reserveNotes.trim() || undefined,
        reservationTime: reserveTime.trim() || undefined,
      });

      setShowReserveModal(false);
      setReserveTableTarget(null);
      setReserveCustomerName('');
      setReserveCustomerPhone('');
      setReserveNotes('');
      setReserveTime('');

      if (selectedTable?.id === updated.id) {
        setSelectedTable(updated);
      }
      fetchTables();
    } catch (err) {
      console.error('Failed to reserve table', err);
    } finally {
      setReserving(false);
    }
  };

  // Cancel Table Reservation (Revert to Available)
  const handleCancelReservationPrompt = (table: RestaurantTable, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      title: t('restaurant.tables.cancelReservationTitle', 'Cancel Table Reservation'),
      message: t(
        'restaurant.tables.cancelReservationMsg',
        'Are you sure you want to cancel the reservation for {{name}} ({{guest}})? The table will become available for seating.',
        {
          name: table.name || `${t('restaurant.tables.table', 'Table')} ${table.tableNumber}`,
          guest: table.reservationCustomerName || t('restaurant.tables.guest', 'Guest'),
        }
      ),
      confirmText: t('restaurant.tables.cancelReservationBtn', 'Yes, Cancel Reservation'),
      danger: true,
      onConfirm: async () => {
        try {
          const updated = await restaurantApi.cancelReservation(table.id);
          if (selectedTable?.id === updated.id) {
            setSelectedTable(updated);
          }
          await fetchTables();
        } catch (err) {
          console.error('Failed to cancel reservation', err);
        }
      },
    });
  };

  const handleSelectTable = (table: RestaurantTable) => {
    setSelectedTable(table);
    setTableOrder(table.activeOrder || null);
  };

  // Add Item to Dine-In Cart
  const handleAddItemToDineInCart = (product: Product) => {
    setOrderItemsCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          itemName: product.name,
          quantity: 1,
          unitPrice: product.price,
          notes: '',
        },
      ];
    });
  };

  const handleUpdateDineInQty = (productId: number, delta: number) => {
    setOrderItemsCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handleUpdateDineInNotes = (productId: number, notes: string) => {
    setOrderItemsCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, notes } : i))
    );
  };

  // Submit Dine-In items to KOT
  const handleSubmitDineInToKot = async () => {
    if (!selectedTable || orderItemsCart.length === 0) return;
    try {
      setOrderLoading(true);
      const activeOrd = tableOrder;
      const existingItems = activeOrd?.items?.map((i) => ({
        productId: i.productId,
        itemName: i.itemName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        notes: i.notes,
      })) || [];

      const newOrder = await restaurantApi.createOrder({
        tableId: selectedTable.id,
        orderType: 'DINE_IN',
        customerName: selectedTable.reservationCustomerName || activeOrd?.customerName || undefined,
        customerPhone: selectedTable.reservationCustomerPhone || activeOrd?.customerPhone || undefined,
        items: [...existingItems, ...orderItemsCart],
      });

      setTableOrder(newOrder);
      setOrderItemsCart([]);
      setShowAddItemModal(false);
      fetchTables();
    } catch (err) {
      console.error('Failed to send dine-in order to kitchen', err);
    } finally {
      setOrderLoading(false);
    }
  };

  // Delete Dine-in or Takeaway Order
  const handleDeleteOrderPrompt = (orderId: number, orderLabel: string) => {
    setConfirmModal({
      title: t('restaurant.tables.deleteOrderTitle', 'Delete Restaurant Order'),
      message: t(
        'restaurant.tables.deleteOrderMsg',
        'Are you sure you want to delete order {{orderLabel}}? This will clear unpaid food items and associated kitchen tickets. Protected completed bills will not be deleted.',
        { orderLabel }
      ),
      confirmText: t('restaurant.tables.deleteOrderBtn', 'Yes, Delete Order'),
      danger: true,
      onConfirm: async () => {
        try {
          await restaurantApi.deleteOrder(orderId);
          if (tableOrder?.id === orderId) {
            setTableOrder(null);
          }
          await fetchTables();
        } catch (err: any) {
          console.error('Failed to delete order', err);
          alert(err.response?.data?.message || 'Failed to delete order.');
        }
      },
    });
  };

  // Parcel item handlers
  const handleAddParcelItem = (product: Product) => {
    setParcelCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          itemName: product.name,
          quantity: 1,
          unitPrice: product.price,
          notes: '',
        },
      ];
    });
  };

  const handleUpdateParcelQty = (productId: number, delta: number) => {
    setParcelCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handleUpdateParcelNotes = (productId: number, notes: string) => {
    setParcelCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, notes } : i))
    );
  };

  // Create Parcel / Takeaway Order (Pay Later or Direct Bill)
  const handleCreateParcelOrder = async (payImmediately: boolean) => {
    if (parcelCart.length === 0) return;
    try {
      setOrderLoading(true);
      const created = await restaurantApi.createOrder({
        orderType: 'TAKEAWAY',
        customerName: parcelCustomerName.trim() || undefined,
        customerPhone: parcelCustomerPhone.trim() || undefined,
        customerEmail: parcelCustomerEmail.trim() || undefined,
        customerAddress: parcelCustomerAddress.trim() || undefined,
        notes: parcelNotes.trim() || undefined,
        items: parcelCart,
      });

      setShowParcelModal(false);
      setParcelCart([]);
      setParcelCustomerName('');
      setParcelCustomerPhone('');
      setParcelCustomerEmail('');
      setParcelCustomerAddress('');
      setParcelNotes('');

      if (payImmediately) {
        const subtotal = created.totalAmount || 0;
        const taxRate = business?.taxRate || 0;
        const taxAmount = (subtotal * taxRate) / 100;
        const grandTotal = subtotal + taxAmount;

        setSettleCustomerName(created.customerName || '');
        setSettleCustomerPhone(created.customerPhone || '');
        setSettleCustomerEmail(created.customerEmail || '');
        setSettleCustomerAddress(created.customerAddress || '');
        setShowSettleCustomerForm(false);

        setSettlementTarget({
          type: 'TAKEAWAY',
          orderId: created.id,
          orderNumber: created.orderNumber,
          customerName: created.customerName,
          customerPhone: created.customerPhone,
          customerEmail: created.customerEmail,
          customerAddress: created.customerAddress,
          items: created.items || [],
          subtotal,
          taxRate,
          taxAmount,
          grandTotal,
        });
        setCashTendered(String(grandTotal));
        setShowPaymentModal(true);
      } else {
        fetchTables();
        setViewMode('PARCELS');
      }
    } catch (err) {
      console.error('Failed to create parcel order', err);
    } finally {
      setOrderLoading(false);
    }
  };

  // Open Settlement Modal for Dine-In
  const handleOpenDineInSettlement = () => {
    if (!selectedTable || !tableOrder) return;
    const subtotal = tableOrder.totalAmount || 0;
    const taxRate = business?.taxRate || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const grandTotal = subtotal + taxAmount;

    const cName = tableOrder.customerName || selectedTable.reservationCustomerName || '';
    const cPhone = tableOrder.customerPhone || selectedTable.reservationCustomerPhone || '';
    const cEmail = tableOrder.customerEmail || '';
    const cAddress = tableOrder.customerAddress || '';

    setSettleCustomerName(cName);
    setSettleCustomerPhone(cPhone);
    setSettleCustomerEmail(cEmail);
    setSettleCustomerAddress(cAddress);
    setShowSettleCustomerForm(Boolean(cName || cPhone));

    setSettlementTarget({
      type: 'DINE_IN',
      tableId: selectedTable.id,
      tableName: selectedTable.name || `Table ${selectedTable.tableNumber}`,
      orderId: tableOrder.id,
      orderNumber: tableOrder.orderNumber,
      customerName: cName,
      customerPhone: cPhone,
      customerEmail: cEmail,
      customerAddress: cAddress,
      items: tableOrder.items || [],
      subtotal,
      taxRate,
      taxAmount,
      grandTotal,
    });
    setCashTendered(String(grandTotal));
    setShowPaymentModal(true);
  };

  // Open Settlement Modal for Existing Parcel Order
  const handleOpenParcelSettlement = (order: RestaurantOrder) => {
    const subtotal = order.totalAmount || 0;
    const taxRate = business?.taxRate || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const grandTotal = subtotal + taxAmount;

    setSettleCustomerName(order.customerName || '');
    setSettleCustomerPhone(order.customerPhone || '');
    setSettleCustomerEmail(order.customerEmail || '');
    setSettleCustomerAddress(order.customerAddress || '');
    setShowSettleCustomerForm(Boolean(order.customerName || order.customerPhone));

    setSettlementTarget({
      type: 'TAKEAWAY',
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      customerAddress: order.customerAddress,
      items: order.items || [],
      subtotal,
      taxRate,
      taxAmount,
      grandTotal,
    });
    setCashTendered(String(grandTotal));
    setShowPaymentModal(true);
  };

  // Execute Final Bill Payment & Settle
  const handleCompletePayment = async () => {
    if (!settlementTarget) return;
    try {
      setSettlingPayment(true);
      const settlePayload = {
        paymentMethod,
        amountPaid: settlementTarget.grandTotal,
        customerName: settleCustomerName.trim() || undefined,
        customerPhone: settleCustomerPhone.trim() || undefined,
        customerEmail: settleCustomerEmail.trim() || undefined,
        customerAddress: settleCustomerAddress.trim() || undefined,
      };

      if (settlementTarget.type === 'DINE_IN' && settlementTarget.tableId) {
        await restaurantApi.settleTableBill(settlementTarget.tableId, settlePayload);
      } else if (settlementTarget.orderId) {
        await restaurantApi.settleOrder(settlementTarget.orderId, settlePayload);
      }

      const tendered = parseFloat(cashTendered) || settlementTarget.grandTotal;
      const changeDue = Math.max(0, tendered - settlementTarget.grandTotal);

      setReceiptData({
        orderNumber: settlementTarget.orderNumber || 'ORD',
        orderType: settlementTarget.type === 'DINE_IN' ? `Dine-In (${settlementTarget.tableName})` : 'Parcel / Takeaway',
        tableName: settlementTarget.tableName,
        customerName: settleCustomerName.trim() || settlementTarget.customerName || undefined,
        customerPhone: settleCustomerPhone.trim() || settlementTarget.customerPhone || undefined,
        customerEmail: settleCustomerEmail.trim() || settlementTarget.customerEmail || undefined,
        customerAddress: settleCustomerAddress.trim() || settlementTarget.customerAddress || undefined,
        items: settlementTarget.items,
        subtotal: settlementTarget.subtotal,
        taxAmount: settlementTarget.taxAmount,
        grandTotal: settlementTarget.grandTotal,
        paymentMethod,
        cashTendered: paymentMethod === 'CASH' ? tendered : undefined,
        changeDue: paymentMethod === 'CASH' ? changeDue : undefined,
        paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      });

      setShowPaymentModal(false);
      setSettlementTarget(null);
      setSelectedTable(null);
      setTableOrder(null);
      setShowReceiptModal(true);
      fetchTables();
    } catch (err) {
      console.error('Failed to complete restaurant payment', err);
    } finally {
      setSettlingPayment(false);
    }
  };

  const sections = ['ALL', ...Array.from(new Set(tables.map((t) => t.sectionFloor).filter(Boolean)))];
  const filteredTables = selectedSection === 'ALL'
    ? tables
    : tables.filter((t) => t.sectionFloor === selectedSection);

  const occupiedCount = tables.filter((t) => t.status === 'OCCUPIED').length;
  const reservedCount = tables.filter((t) => t.status === 'RESERVED').length;
  const availableCount = tables.filter((t) => t.status === 'AVAILABLE').length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('restaurant.tables.title', 'Tables & Orders')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1.5">
              <UtensilsCrossed size={12} className="text-amber-600" />
              <span>{t('restaurant.tables.badge', 'Restaurant Billing & Reservations')}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('restaurant.tables.subtitle', 'Manage table bookings, dine-in tabs, takeaway orders, and instant receipt checkouts.')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setParcelCart([]);
              setShowParcelModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <ShoppingBag size={15} />
            <span>{t('restaurant.tables.newParcel', '+ New Parcel / Takeaway')}</span>
          </button>

          <button
            onClick={() => setShowAddTableModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>{t('restaurant.tables.addTable', 'Add Table')}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('restaurant.tables.totalTables', 'Total Tables')}</span>
          <div className="text-2xl font-black text-slate-900">{tables.length}</div>
          <p className="text-[10px] text-slate-400">
            {t('restaurant.tables.totalSeats', '{{count}} total seats', { count: tables.reduce((acc, t) => acc + t.capacity, 0) })}
          </p>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{t('restaurant.tables.available', 'Available')}</span>
          <div className="text-2xl font-black text-emerald-600">{availableCount}</div>
          <p className="text-[10px] text-emerald-700">{t('restaurant.tables.readyToSeat', 'Ready to seat')}</p>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{t('restaurant.tables.occupiedTabs', 'Occupied Tabs')}</span>
          <div className="text-2xl font-black text-amber-600">{occupiedCount}</div>
          <p className="text-[10px] text-amber-700">{t('restaurant.tables.diningInProgress', 'Dining in progress')}</p>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">{t('restaurant.tables.reservedTables', 'Reserved Tables')}</span>
          <div className="text-2xl font-black text-purple-600">{reservedCount}</div>
          <p className="text-[10px] text-purple-700">{t('restaurant.tables.customerBookings', 'Customer bookings')}</p>
        </div>
      </div>

      {/* View Switcher Tabs: Dining Tables vs Parcels & Takeaways */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('TABLES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'TABLES'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <UtensilsCrossed size={14} />
            <span>{t('restaurant.tables.dineInTables', 'Dine-In Tables ({{count}})', { count: tables.length })}</span>
          </button>

          <button
            onClick={() => setViewMode('PARCELS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'PARCELS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag size={14} />
            <span>{t('restaurant.tables.activeParcels', 'Active Parcels & Takeaways ({{count}})', { count: takeawayOrders.length })}</span>
          </button>
        </div>

        {viewMode === 'TABLES' && (
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto">
            {sections.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedSection === sec
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec === 'ALL' ? t('restaurant.tables.allSections', 'All Sections') : sec}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          VIEW 1: DINE-IN TABLES & RESERVATIONS
         ========================================================================= */}
      {viewMode === 'TABLES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tables Grid */}
          <div className={selectedTable ? 'lg:col-span-7 space-y-4' : 'lg:col-span-12 space-y-4'}>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-36 rounded-2xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : filteredTables.length === 0 ? (
              <div className="clay-card p-12 text-center text-slate-400 space-y-3">
                <UtensilsCrossed size={36} className="mx-auto text-slate-300" />
                <div>
                  <p className="font-bold text-slate-800 text-sm">{t('restaurant.tables.noTablesFound', 'No dining tables found')}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t('restaurant.tables.noTablesHint', 'Click "Add Table" to set up your floor seating layout.')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredTables.map((table) => {
                  const isSelected = selectedTable?.id === table.id;
                  const isOccupied = table.status === 'OCCUPIED';
                  const isReserved = table.status === 'RESERVED';

                  return (
                    <div
                      key={table.id}
                      onClick={() => handleSelectTable(table)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40 shadow-md'
                          : isOccupied
                          ? 'border-amber-200 bg-amber-50/20 hover:border-amber-300 shadow-xs'
                          : isReserved
                          ? 'border-purple-200 bg-purple-50/25 hover:border-purple-300 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Top status & Capacity */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOccupied
                              ? 'bg-amber-100 text-amber-800'
                              : isReserved
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isOccupied
                            ? t('restaurant.tables.statusOccupied', 'OCCUPIED')
                            : isReserved
                            ? t('restaurant.tables.statusReserved', 'RESERVED')
                            : t('restaurant.tables.statusAvailable', 'AVAILABLE')}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                          <Users size={12} />
                          <span>{table.capacity}</span>
                        </span>
                      </div>

                      {/* Table Name & Number */}
                      <div className="my-3 space-y-0.5">
                        <h3 className="text-base font-black text-slate-900">
                          {table.name || `${t('restaurant.tables.table', 'Table')} ${table.tableNumber}`}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">{table.sectionFloor}</p>
                      </div>

                      {/* Reservation or Order Info */}
                      {isReserved && table.reservationCustomerName && (
                        <div className="mb-2 p-2 rounded-xl bg-purple-100/60 text-purple-950 text-[11px] space-y-0.5">
                          <div className="font-bold flex items-center gap-1 truncate">
                            <UserIcon size={11} className="text-purple-700 shrink-0" />
                            <span className="truncate">{table.reservationCustomerName}</span>
                          </div>
                          {table.reservationTime && (
                            <div className="text-[10px] text-purple-800 flex items-center gap-1">
                              <Clock size={10} className="shrink-0" />
                              <span>{table.reservationTime}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer Summary */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        {isOccupied && table.activeOrder ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-amber-700 font-bold block">
                              {t('restaurant.tables.itemsOrdered', '{{count}} items ordered', { count: table.activeOrder.items?.length || 0 })}
                            </span>
                            <span className="font-black text-slate-900">
                              {formatCurrency(table.activeOrder.totalAmount || 0, currency)}
                            </span>
                          </div>
                        ) : isReserved ? (
                          <span className="text-[11px] text-purple-700 font-bold">{t('restaurant.tables.bookedTable', 'Booked Table')}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-emerald-600 font-semibold">{t('restaurant.tables.statusAvailable', 'Available')}</span>
                          </div>
                        )}
                        <ChevronRight size={14} className="text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Table Drawer (5 cols) */}
          {selectedTable && (
            <div className="lg:col-span-5 clay-card p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                        selectedTable.status === 'RESERVED'
                          ? 'bg-purple-50 text-purple-700'
                          : selectedTable.status === 'OCCUPIED'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      <UtensilsCrossed size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {selectedTable.name || `${t('restaurant.tables.table', 'Table')} ${selectedTable.tableNumber}`}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            selectedTable.status === 'OCCUPIED'
                              ? 'bg-amber-100 text-amber-800'
                              : selectedTable.status === 'RESERVED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {selectedTable.status === 'OCCUPIED'
                            ? t('restaurant.tables.statusOccupied', 'OCCUPIED')
                            : selectedTable.status === 'RESERVED'
                            ? t('restaurant.tables.statusReserved', 'RESERVED')
                            : t('restaurant.tables.statusAvailable', 'AVAILABLE')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {selectedTable.sectionFloor} • {t('restaurant.tables.capacityGuests', 'Capacity {{count}} guests', { count: selectedTable.capacity })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTable(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Table Reservation Info Card */}
                {selectedTable.status === 'RESERVED' && (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 uppercase flex items-center gap-1">
                        <Calendar size={13} />
                        <span>{t('restaurant.tables.activeReservation', 'Active Reservation')}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleCancelReservationPrompt(selectedTable, e)}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 cursor-pointer transition-colors"
                      >
                        {t('restaurant.tables.cancelReservation', 'Cancel Reservation')}
                      </button>
                    </div>

                    <div className="text-xs text-purple-950 space-y-1 bg-white/70 p-3 rounded-lg border border-purple-100">
                      <p className="font-bold flex items-center gap-1.5">
                        <UserIcon size={13} className="text-purple-600" />
                        <span>{selectedTable.reservationCustomerName}</span>
                      </p>
                      {selectedTable.reservationCustomerPhone && (
                        <p className="flex items-center gap-1.5 text-slate-600">
                          <Phone size={13} className="text-slate-400" />
                          <span>{selectedTable.reservationCustomerPhone}</span>
                        </p>
                      )}
                      {selectedTable.reservationTime && (
                        <p className="flex items-center gap-1.5 text-slate-600">
                          <Clock size={13} className="text-slate-400" />
                          <span>{t('restaurant.tables.timeSlot', 'Time / Slot: {{time}}', { time: selectedTable.reservationTime })}</span>
                        </p>
                      )}
                      {selectedTable.reservationNotes && (
                        <p className="text-[11px] text-purple-800 italic pt-1 border-t border-purple-100">
                          {t('restaurant.tables.notesWithQuotes', 'Notes: "{{notes}}"', { notes: selectedTable.reservationNotes })}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setOrderItemsCart([]);
                        setShowAddItemModal(true);
                      }}
                      className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <UtensilsCrossed size={14} />
                      <span>{t('restaurant.tables.seatGuestsTakeOrder', 'Seat Guests & Take Order')}</span>
                    </button>
                  </div>
                )}

                {/* Available Table Booking Quick Trigger */}
                {selectedTable.status === 'AVAILABLE' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleOpenReserveModal(selectedTable, e)}
                      className="flex-1 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Calendar size={13} />
                      <span>{t('restaurant.tables.bookReserveTable', 'Book / Reserve Table')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOrderItemsCart([]);
                        setShowAddItemModal(true);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Plus size={13} />
                      <span>{t('restaurant.tables.takeDineInOrder', 'Take Dine-In Order')}</span>
                    </button>
                  </div>
                )}

                {/* Active Order Items List */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {t('restaurant.tables.currentDiningTab', 'Current Dining Tab')}
                    </h4>
                    {tableOrder && tableOrder.items && tableOrder.items.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setOrderItemsCart([]);
                            setShowAddItemModal(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer"
                        >
                          <Plus size={12} />
                          <span>{t('restaurant.tables.addItemsBtn', '+ Add Items')}</span>
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteOrderPrompt(
                              tableOrder.id,
                              `#${tableOrder.orderNumber} (${selectedTable.name || `${t('restaurant.tables.table', 'Table')} ${selectedTable.tableNumber}`})`
                            )
                          }
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                          title={t('restaurant.tables.deleteCancelOrder', 'Delete / Cancel Order')}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {!tableOrder || !tableOrder.items || tableOrder.items.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 space-y-2 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                      <ShoppingBag size={24} className="mx-auto text-slate-300" />
                      <p className="text-xs font-bold text-slate-700">{t('restaurant.tables.noActiveOrder', 'No active dining order')}</p>
                      <p className="text-[11px] text-slate-400">
                        {selectedTable.status === 'RESERVED'
                          ? t('restaurant.tables.tableReservedHint', 'Table is reserved. Click below when guest arrives.')
                          : t('restaurant.tables.takeOrderHint', 'Click below to take food order and send KOT to kitchen.')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {tableOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{item.itemName}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span>
                                {t('restaurant.tables.qtyPrice', 'Qty: {{qty}} × {{price}}', {
                                  qty: item.quantity,
                                  price: formatCurrency(item.unitPrice, currency),
                                })}
                              </span>
                              {item.notes && <span className="text-amber-600 font-medium">({item.notes})</span>}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-black text-slate-900 block">
                              {formatCurrency(item.totalPrice || item.quantity * item.unitPrice, currency)}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                item.kotStatus === 'READY'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : item.kotStatus === 'PREPARING'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {t('restaurant.tables.kotStatus', 'KOT: {{status}}', { status: item.kotStatus || 'PENDING' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bill Summary & Settle Actions */}
              {tableOrder && tableOrder.items && tableOrder.items.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-600">{t('restaurant.tables.totalFoodBill', 'Total Food Bill:')}</span>
                    <span className="text-xl font-black text-slate-950">
                      {formatCurrency(tableOrder.totalAmount, currency)}
                    </span>
                  </div>

                  <button
                    onClick={handleOpenDineInSettlement}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Receipt size={15} />
                    <span>{t('restaurant.tables.generateBillSettle', 'Generate Bill & Settle Payment')}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: PARCEL / TAKEAWAY ORDERS (Independent of Tables)
         ========================================================================= */}
      {viewMode === 'PARCELS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('restaurant.tables.activeParcelsTitle', 'Active Parcels & Takeaway Orders')}</h3>
              <p className="text-xs text-slate-500">{t('restaurant.tables.activeParcelsSubtitle', 'Orders being prepared or waiting for customer pickup and billing.')}</p>
            </div>

            <button
              onClick={() => {
                setParcelCart([]);
                setShowParcelModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>{t('restaurant.tables.newParcelOrderBtn', '+ New Parcel Order')}</span>
            </button>
          </div>

          {takeawayOrders.length === 0 ? (
            <div className="clay-card p-12 text-center text-slate-400 space-y-3">
              <ShoppingBag size={36} className="mx-auto text-slate-300" />
              <div>
                <p className="font-bold text-slate-800 text-sm">{t('restaurant.tables.noParcelsFound', 'No active parcel orders right now')}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('restaurant.tables.noParcelsHint', 'Customers ordering food for takeaway or parcel can be created without booking a table.')}
                </p>
              </div>
              <button
                onClick={() => {
                  setParcelCart([]);
                  setShowParcelModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                {t('restaurant.tables.createTakeawayBtn', '+ Create Takeaway Order')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {takeawayOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="clay-card p-4 space-y-3 border border-slate-200 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {ord.orderNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {ord.status}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteOrderPrompt(
                              ord.id,
                              `Takeaway #${ord.orderNumber} (${ord.customerName || 'Guest'})`
                            )
                          }
                          className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                          title={t('common.delete', 'Delete Order')}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {ord.customerName || t('restaurant.tables.takeawayCustomer', 'Takeaway Customer')}
                      </h4>
                      {ord.customerPhone && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone size={11} className="text-slate-400" />
                          <span>{ord.customerPhone}</span>
                        </p>
                      )}
                    </div>

                    {/* Items List */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                      {ord.items?.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-slate-700">
                          <span>
                            {item.quantity} × {item.itemName}
                          </span>
                          <span className="font-semibold font-mono">
                            {formatCurrency(item.totalPrice || item.quantity * item.unitPrice, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('restaurant.tables.billTotal', 'Bill Total')}</span>
                      <span className="text-base font-black text-slate-900">
                        {formatCurrency(ord.totalAmount, currency)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenParcelSettlement(ord)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Receipt size={13} />
                      <span>{t('restaurant.tables.billAndPay', 'Bill & Pay')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ADD ITEMS TO DINE-IN TABLE ORDER
         ========================================================================= */}
      {showAddItemModal && selectedTable && (
        <div className="fixed inset-0 w-full h-full min-h-screen z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col justify-between my-auto">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {t('restaurant.tables.addItemsToTable', 'Add Items to {{name}}', {
                      name: selectedTable.name || `${t('restaurant.tables.table', 'Table')} ${selectedTable.tableNumber}`,
                    })}
                  </h3>
                  <p className="text-xs text-slate-400">{t('restaurant.tables.selectDishesHint', 'Select dishes to dispatch KOT ticket to kitchen')}</p>
                </div>
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Menu Search & Category Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('restaurant.tables.searchMenu', 'Search menu items...')}
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none"
                >
                  <option value="ALL">{t('restaurant.tables.allCategories', 'All Categories')}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Products Grid / List */}
              <div className="mt-3 max-h-52 overflow-y-auto space-y-1.5 pr-1">
                {products
                  .filter((p) => {
                    const matchesSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase());
                    const matchesCat = selectedCategory === 'ALL' || p.category?.id === Number(selectedCategory);
                    return matchesSearch && matchesCat;
                  })
                  .map((prod) => {
                    const inCart = orderItemsCart.find((i) => i.productId === prod.id);
                    return (
                      <div
                        key={prod.id}
                        className="p-2.5 rounded-xl border border-slate-100 hover:border-amber-200 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{prod.name}</p>
                          <span className="text-slate-400 text-[10px] font-mono">
                            {formatCurrency(prod.price, currency)}
                          </span>
                        </div>

                        {inCart ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateDineInQty(prod.id, -1)}
                              className="w-6 h-6 rounded-md bg-slate-100 font-bold flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-bold text-sm w-4 text-center">{inCart.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateDineInQty(prod.id, 1)}
                              className="w-6 h-6 rounded-md bg-amber-600 text-white font-bold flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddItemToDineInCart(prod)}
                            className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs cursor-pointer border border-amber-200"
                          >
                            {t('common.add', '+ Add')}
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Cart Items To Add */}
              {orderItemsCart.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                  <h4 className="text-[11px] font-bold text-amber-900 uppercase">{t('restaurant.tables.itemsReadyKot', 'Items Ready to Send to Kitchen:')}</h4>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {orderItemsCart.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">
                          {item.quantity}x {item.itemName} ({formatCurrency(item.quantity * item.unitPrice, currency)})
                        </span>
                        <input
                          type="text"
                          placeholder={t('restaurant.tables.kitchenNotesPlaceholder', 'Kitchen notes (e.g. less spicy)...')}
                          value={item.notes}
                          onChange={(e) => handleUpdateDineInNotes(item.productId, e.target.value)}
                          className="px-2 py-0.5 text-[11px] rounded border border-slate-200 bg-white max-w-[180px]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">{t('restaurant.tables.newItemsTotal', 'New Items Total')}</span>
                <span className="text-sm font-black text-slate-900">
                  {formatCurrency(
                    orderItemsCart.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
                    currency
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  disabled={orderItemsCart.length === 0 || orderLoading}
                  onClick={handleSubmitDineInToKot}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <ChefHat size={14} />
                  <span>{orderLoading ? t('common.processing', 'Sending...') : t('restaurant.tables.sendKotToKitchen', 'Send KOT to Kitchen')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: TABLE BOOKING & RESERVATION (Full Viewport Overlay)
         ========================================================================= */}
      {showReserveModal && reserveTableTarget && (
        <div className="fixed inset-0 w-full h-full min-h-screen z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Calendar size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {t('restaurant.tables.bookTableTitle', 'Book {{name}}', {
                      name: reserveTableTarget.name || `${t('restaurant.tables.table', 'Table')} ${reserveTableTarget.tableNumber}`,
                    })}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('restaurant.tables.capacitySection', 'Capacity: {{capacity}} guests • {{section}}', {
                      capacity: reserveTableTarget.capacity,
                      section: reserveTableTarget.sectionFloor,
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReserveModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReservation} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800 flex items-center gap-1">
                  <UserIcon size={12} className="text-purple-600" />
                  <span>{t('restaurant.tables.customerNameReq', 'Customer Name *')}</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={reserveCustomerName}
                  onChange={(e) => setReserveCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" />
                    <span>{t('restaurant.tables.mobileOpt', 'Mobile (Optional)')}</span>
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={reserveCustomerPhone}
                    onChange={(e) => setReserveCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" />
                    <span>{t('restaurant.tables.timeSlotOpt', 'Time / Slot (Optional)')}</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7:30 PM Tonight"
                    value={reserveTime}
                    onChange={(e) => setReserveTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  <FileText size={12} className="text-slate-400" />
                  <span>{t('restaurant.tables.customerDetailsReqOpt', 'Customer Details / Special Requests (Optional)')}</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Window side preference, birthday celebration, high chair needed..."
                  value={reserveNotes}
                  onChange={(e) => setReserveNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReserveModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!reserveCustomerName.trim() || reserving}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {reserving && <Loader2 size={13} className="animate-spin" />}
                  <span>{reserving ? t('common.saving', 'Saving...') : t('restaurant.tables.confirmTableBooking', 'Confirm Table Booking')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: CREATE PARCEL / TAKEAWAY ORDER (No table assignment needed)
         ========================================================================= */}
      {showParcelModal && (
        <div className="fixed inset-0 w-full h-full min-h-screen z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[92vh] flex flex-col justify-between my-auto">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <ShoppingBag size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{t('restaurant.tables.newParcelModalTitle', 'New Parcel / Takeaway Order')}</h3>
                    <p className="text-xs text-slate-400">{t('restaurant.tables.newParcelModalSubtitle', 'Order & bill directly without table assignment')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowParcelModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Customer Details Inputs */}
              <div className="space-y-2.5 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <UserIcon size={13} className="text-emerald-600" />
                    <span>{t('restaurant.tables.customerInformation', 'Customer Information')}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">{t('common.optional', 'Optional')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                      <UserIcon size={11} className="text-slate-400" />
                      <span>{t('restaurant.tables.customerNameOpt', 'Customer Name (Optional)')}</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={parcelCustomerName}
                      onChange={(e) => setParcelCustomerName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                      <Phone size={11} className="text-slate-400" />
                      <span>{t('restaurant.tables.contactMobileOpt', 'Contact Mobile (Optional)')}</span>
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={parcelCustomerPhone}
                      onChange={(e) => setParcelCustomerPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                      <Mail size={11} className="text-slate-400" />
                      <span>{t('restaurant.tables.emailOpt', 'Email (Optional)')}</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. customer@example.com"
                      value={parcelCustomerEmail}
                      onChange={(e) => setParcelCustomerEmail(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                      <MapPin size={11} className="text-slate-400" />
                      <span>{t('restaurant.tables.addressOpt', 'Delivery / Pickup Address (Optional)')}</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 102, City Center"
                      value={parcelCustomerAddress}
                      onChange={(e) => setParcelCustomerAddress(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Menu Search & Category Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('restaurant.tables.searchMenu', 'Search menu items...')}
                    value={parcelProductSearch}
                    onChange={(e) => setParcelProductSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <select
                  value={parcelCategory}
                  onChange={(e) => setParcelCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none"
                >
                  <option value="ALL">{t('restaurant.tables.allCategories', 'All Categories')}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Products Grid */}
              <div className="mt-3 max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {products
                  .filter((p) => {
                    const matchesSearch = !parcelProductSearch || p.name.toLowerCase().includes(parcelProductSearch.toLowerCase());
                    const matchesCat = parcelCategory === 'ALL' || p.category?.id === Number(parcelCategory);
                    return matchesSearch && matchesCat;
                  })
                  .map((prod) => {
                    const inCart = parcelCart.find((i) => i.productId === prod.id);
                    return (
                      <div
                        key={prod.id}
                        className="p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{prod.name}</p>
                          <span className="text-slate-400 text-[10px] font-mono">
                            {formatCurrency(prod.price, currency)}
                          </span>
                        </div>

                        {inCart ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateParcelQty(prod.id, -1)}
                              className="w-6 h-6 rounded-md bg-slate-100 font-bold flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-bold text-sm w-4 text-center">{inCart.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateParcelQty(prod.id, 1)}
                              className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddParcelItem(prod)}
                            className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs cursor-pointer border border-emerald-200"
                          >
                            {t('common.add', '+ Add')}
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Parcel Cart Summary */}
              {parcelCart.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <h4 className="text-[11px] font-bold text-emerald-900 uppercase">{t('restaurant.tables.selectedParcelItems', 'Selected Parcel Items:')}</h4>
                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                    {parcelCart.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">
                          {item.quantity}x {item.itemName} ({formatCurrency(item.quantity * item.unitPrice, currency)})
                        </span>
                        <input
                          type="text"
                          placeholder={t('restaurant.tables.parcelInstructions', 'Parcel instructions (e.g. pack separately)...')}
                          value={item.notes}
                          onChange={(e) => handleUpdateParcelNotes(item.productId, e.target.value)}
                          className="px-2 py-0.5 text-[11px] rounded border border-slate-200 bg-white max-w-[200px]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">{t('restaurant.tables.totalParcelBill', 'Total Parcel Bill')}</span>
                <span className="text-base font-black text-slate-900">
                  {formatCurrency(
                    parcelCart.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
                    currency
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={parcelCart.length === 0 || orderLoading}
                  onClick={() => handleCreateParcelOrder(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer disabled:opacity-50"
                  title="Send order to kitchen and collect payment later"
                >
                  {t('restaurant.tables.sendKotPayLater', 'Send to KOT (Pay Later)')}
                </button>

                <button
                  type="button"
                  disabled={parcelCart.length === 0 || orderLoading}
                  onClick={() => handleCreateParcelOrder(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  <Receipt size={14} />
                  <span>{t('restaurant.tables.billAndPayNow', 'Bill & Pay Now')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: PAYMENT & SETTLEMENT MODAL (Dine-In & Parcel Billing)
         ========================================================================= */}
      {showPaymentModal && settlementTarget && (
        <div className="fixed inset-0 w-full h-full min-h-screen z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Receipt size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {t('restaurant.tables.settleTitle', 'Bill Settlement & Checkout')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {settlementTarget.type === 'DINE_IN'
                      ? `Dine-In • ${settlementTarget.tableName}`
                      : `Parcel / Takeaway • ${settlementTarget.customerName || 'Guest'}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Bill Summary Table */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
                {settlementTarget.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between pt-1 text-slate-700">
                    <span>
                      {item.quantity} × {item.itemName}
                    </span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(item.totalPrice || item.quantity * item.unitPrice, currency)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span>{t('common.subtotal', 'Subtotal')}</span>
                  <span>{formatCurrency(settlementTarget.subtotal, currency)}</span>
                </div>
                {settlementTarget.taxRate > 0 && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span>
                      {business?.taxName || 'GST'} ({settlementTarget.taxRate}%)
                    </span>
                    <span>+{formatCurrency(settlementTarget.taxAmount, currency)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>{t('restaurant.tables.totalPayable', 'Total Amount Payable')}</span>
                  <span className="text-emerald-700 text-lg">
                    {formatCurrency(settlementTarget.grandTotal, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information (Optional) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <UserIcon size={13} className="text-emerald-600" />
                  <span>{t('restaurant.tables.customerInformation', 'Customer Information')}</span>
                  <span className="text-[10px] font-normal text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded-full">{t('common.optional', 'Optional')}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSettleCustomerForm(!showSettleCustomerForm)}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                >
                  {showSettleCustomerForm
                    ? t('restaurant.tables.hideDetails', 'Hide Details')
                    : settleCustomerName || settleCustomerPhone
                    ? t('restaurant.tables.editDetails', 'Edit Details')
                    : t('restaurant.tables.addCustomerInfo', '+ Add Customer Info')}
                </button>
              </div>

              {showSettleCustomerForm && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-slate-600">{t('restaurant.tables.nameOpt', 'Name (Optional)')}</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={settleCustomerName}
                      onChange={(e) => setSettleCustomerName(e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-slate-600">{t('restaurant.tables.phoneOpt', 'Phone (Optional)')}</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={settleCustomerPhone}
                      onChange={(e) => setSettleCustomerPhone(e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-slate-600">{t('restaurant.tables.emailOpt', 'Email (Optional)')}</label>
                    <input
                      type="email"
                      placeholder="customer@example.com"
                      value={settleCustomerEmail}
                      onChange={(e) => setSettleCustomerEmail(e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-slate-600">{t('restaurant.tables.addressOpt', 'Address (Optional)')}</label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 102, City"
                      value={settleCustomerAddress}
                      onChange={(e) => setSettleCustomerAddress(e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">{t('restaurant.tables.selectPaymentMethod', 'Select Payment Method')}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CASH', label: t('restaurant.tables.pmCash', 'Cash'), icon: Banknote },
                  { id: 'UPI', label: t('restaurant.tables.pmUpi', 'UPI / QR'), icon: QrCode },
                  { id: 'CARD', label: t('restaurant.tables.pmCard', 'Card / POS'), icon: CreditCard },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-2xs ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-xs">{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Tendered & Change Return Calculator */}
            {paymentMethod === 'CASH' && (
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-amber-900">{t('restaurant.tables.cashReceived', 'Cash Received from Guest:')}</span>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-32 px-2.5 py-1 rounded-lg border border-amber-300 bg-white font-black text-right text-xs"
                  />
                </div>

                {parseFloat(cashTendered) > settlementTarget.grandTotal && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-200 font-bold text-amber-950">
                    <span>{t('restaurant.tables.changeDue', 'Change Due to Return:')}</span>
                    <span className="text-emerald-700 text-sm font-black">
                      {formatCurrency(parseFloat(cashTendered) - settlementTarget.grandTotal, currency)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                disabled={settlingPayment}
                onClick={handleCompletePayment}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {settlingPayment ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                <span>{settlingPayment ? t('common.processing', 'Processing...') : t('restaurant.tables.completePaymentSettle', 'Complete Payment & Settle')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: INSTANT PRINTABLE RESTAURANT RECEIPT
         ========================================================================= */}
      {showReceiptModal && receiptData && (
        <div className="fixed inset-0 w-full h-full min-h-screen z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto receipt-modal-backdrop">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 my-auto receipt-modal-container">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 print:hidden">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-800">{t('restaurant.tables.billSettledPaid', 'Bill Settled & Paid')}</span>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Printable Receipt Card */}
            <div id="printable-receipt-content" className="p-4 rounded-xl border border-slate-200 bg-white font-mono text-xs space-y-3 receipt-format-thermal">
              <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                {business?.logo && (
                  <div className="flex justify-center pb-1">
                    <img
                      src={business.logo}
                      alt={business?.name || t('restaurant.tables.defaultRestName', 'Restaurant & Dining')}
                      className="max-h-12 max-w-[120px] object-contain mx-auto"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">
                  {business?.name || t('restaurant.tables.defaultRestName', 'Restaurant & Dining')}
                </h3>
                {business?.address && <p className="text-[10px] text-slate-500">{business.address}</p>}
                {business?.phone && <p className="text-[10px] text-slate-500">Ph: {business.phone}</p>}
                {business?.taxNumber && (
                  <p className="text-[10px] text-slate-500 font-bold">GSTIN: {business.taxNumber}</p>
                )}
              </div>

              <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2 text-slate-600">
                <div className="flex justify-between">
                  <span>{t('restaurant.tables.receiptOrder', 'Order: {{num}}', { num: receiptData.orderNumber })}</span>
                  <span>{receiptData.paidAt}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{receiptData.orderType}</span>
                  <span className="text-emerald-700">PAID</span>
                </div>
                {receiptData.customerName && <div>{t('restaurant.tables.receiptCustomer', 'Customer: {{name}}', { name: receiptData.customerName })}</div>}
                {receiptData.customerPhone && <div>{t('restaurant.tables.receiptPhone', 'Phone: {{phone}}', { phone: receiptData.customerPhone })}</div>}
                {receiptData.customerEmail && <div>{t('restaurant.tables.receiptEmail', 'Email: {{email}}', { email: receiptData.customerEmail })}</div>}
                {receiptData.customerAddress && <div>{t('restaurant.tables.receiptAddress', 'Address: {{address}}', { address: receiptData.customerAddress })}</div>}
              </div>

              {/* Items */}
              <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 text-slate-800">
                {receiptData.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span>
                      {it.quantity}x {it.itemName}
                    </span>
                    <span className="font-semibold">{formatCurrency(it.totalPrice || it.quantity * it.unitPrice, currency)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-0.5 text-xs pt-1">
                <div className="flex justify-between text-slate-500">
                  <span>{t('common.subtotal', 'Subtotal')}</span>
                  <span>{formatCurrency(receiptData.subtotal, currency)}</span>
                </div>
                {receiptData.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>{t('restaurant.tables.taxGst', 'Tax / GST')}</span>
                    <span>+{formatCurrency(receiptData.taxAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-slate-950 pt-1 border-t border-slate-300">
                  <span>{t('restaurant.tables.totalPaid', 'TOTAL PAID')}</span>
                  <span>{formatCurrency(receiptData.grandTotal, currency)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>{t('restaurant.tables.receiptMethod', 'Method: {{method}}', { method: receiptData.paymentMethod })}</span>
                  {receiptData.changeDue !== undefined && receiptData.changeDue > 0 && (
                    <span>{t('restaurant.tables.receiptChange', 'Change: {{change}}', { change: formatCurrency(receiptData.changeDue, currency) })}</span>
                  )}
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-dashed border-slate-300">
                {t('restaurant.tables.thankYouMeal', 'Thank you for visiting! Have a wonderful meal.')}
              </div>
            </div>

            {/* Print & Close actions */}
            <div className="flex items-center gap-2 pt-1 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>{t('common.printReceipt', 'Print Receipt')}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: ADD NEW TABLE
         ========================================================================= */}
      {showAddTableModal && (
        <div className="fixed inset-0 w-full h-full min-h-screen z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">{t('restaurant.tables.addTableModalTitle', 'Add Dining Table')}</h3>
              <button
                onClick={() => setShowAddTableModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t('restaurant.tables.tableNumberReq', 'Table Number / Identifier *')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T-1, 101, Bar-2"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t('restaurant.tables.tableNameOpt', 'Table Display Name')}</label>
                <input
                  type="text"
                  placeholder="e.g. Window Corner Booth"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('restaurant.tables.seatingCapacity', 'Seating Capacity')}</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t('restaurant.tables.floorSection', 'Floor / Section')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Rooftop, AC Hall, Patio"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTableModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {t('restaurant.tables.saveTableBtn', 'Save Table')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRMATION DIALOG MODAL (Generic for Deletions & Cancellations)
         ========================================================================= */}
      {confirmModal && (
        <div className="fixed inset-0 w-full h-full min-h-screen z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 my-auto">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">{confirmModal.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                disabled={confirmLoading}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {t('common.cancel', 'Keep')}
              </button>
              <button
                type="button"
                disabled={confirmLoading}
                onClick={async () => {
                  setConfirmLoading(true);
                  try {
                    await confirmModal.onConfirm();
                    setConfirmModal(null);
                  } catch (err) {
                    console.error('Confirmation action failed', err);
                  } finally {
                    setConfirmLoading(false);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${
                  confirmModal.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'
                }`}
              >
                {confirmLoading && <Loader2 size={13} className="animate-spin" />}
                <span>{confirmModal.confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
