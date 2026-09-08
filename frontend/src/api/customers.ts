import apiClient from './axios';
import { ApiResponse, PageResponse } from './health';
import { Order } from './billing';

export interface Customer {
  id: number;
  businessId: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  totalSpending?: number;
  orderCount?: number;
  lastPurchaseDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile {
  id: number;
  businessId: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  totalSpending: number;
  orderCount: number;
  averageOrderValue: number;
  firstPurchaseDate?: string | null;
  lastPurchaseDate?: string | null;
  createdAt: string;
  updatedAt: string;
  purchaseHistory: Order[];
}

export interface CustomerRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export const customersApi = {
  getCustomers: async (search?: string, page = 0, size = 20): Promise<PageResponse<Customer>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Customer>>>('/customers', {
      params: { search, page, size },
    });
    return res.data.data;
  },

  quickSearch: async (query?: string): Promise<Customer[]> => {
    const res = await apiClient.get<ApiResponse<Customer[]>>('/customers/search', {
      params: { query },
    });
    return res.data.data;
  },

  getCustomerById: async (id: number): Promise<Customer> => {
    const res = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return res.data.data;
  },

  getCustomerProfile: async (id: number): Promise<CustomerProfile> => {
    const res = await apiClient.get<ApiResponse<CustomerProfile>>(`/customers/${id}/profile`);
    return res.data.data;
  },

  getCustomerOrders: async (id: number, page = 0, size = 10): Promise<PageResponse<Order>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Order>>>(`/customers/${id}/orders`, {
      params: { page, size },
    });
    return res.data.data;
  },

  createCustomer: async (data: CustomerRequest): Promise<Customer> => {
    const res = await apiClient.post<ApiResponse<Customer>>('/customers', data);
    return res.data.data;
  },

  updateCustomer: async (id: number, data: CustomerRequest): Promise<Customer> => {
    const res = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return res.data.data;
  },

  deleteCustomer: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/customers/${id}`);
  },
};
