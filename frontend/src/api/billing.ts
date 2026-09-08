import apiClient from './axios';
import { ApiResponse, PageResponse } from './health';
import { Customer } from './customers';
import { ProductType } from './products';

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'CREDIT' | 'OTHER';
export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'PARTIALLY_PAID' | 'CANCELLED' | 'FAILED';
export type OrderStatus = 'COMPLETED' | 'CANCELLED' | 'PENDING';

export interface OrderItemRequest {
  productId?: number;
  productName: string;
  productType?: ProductType;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderRequest {
  customerId?: number;
  items: OrderItemRequest[];
  discount?: number;
  isPercentageDiscount?: boolean;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  notes?: string;
  markAsPaid?: boolean;
}

export interface OrderItem {
  id: number;
  productId?: number;
  productName: string;
  productType: ProductType;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference?: string;
  notes?: string;
  createdAt: string;
}

export interface Order {
  id: number;
  businessId: number;
  businessName?: string;
  currency: string;
  customer?: Customer;
  invoiceNumber: string;
  subtotal: number;
  discount: number;
  tax: number;
  taxRate?: number;
  taxName?: string;
  taxInclusive?: boolean;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  createdBy: string;
  notes?: string;
  items: OrderItem[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface BillingSummary {
  todaySales: number;
  monthSales: number;
  todayExpenses: number;
  monthExpenses: number;
  todayNetRevenue: number;
  monthNetRevenue: number;
  todayOrdersCount: number;
  pendingDueAmount: number;
  totalCustomersCount: number;
  currency: string;
  recentOrders: Order[];
}

export interface OrderFilterParams {
  search?: string;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const billingApi = {
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>('/billing/orders', data);
    return res.data.data;
  },

  getOrders: async (params?: OrderFilterParams): Promise<PageResponse<Order>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Order>>>('/billing/orders', {
      params,
    });
    return res.data.data;
  },

  getOrderById: async (id: number): Promise<Order> => {
    const res = await apiClient.get<ApiResponse<Order>>(`/billing/orders/${id}`);
    return res.data.data;
  },

  cancelOrder: async (id: number, reason?: string): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>(`/billing/orders/${id}/cancel`, {
      reason,
    });
    return res.data.data;
  },

  getDashboardSummary: async (): Promise<BillingSummary> => {
    const res = await apiClient.get<ApiResponse<BillingSummary>>('/billing/dashboard/summary');
    return res.data.data;
  },
};
