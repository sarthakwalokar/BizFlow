import apiClient from './axios';
import { ApiResponse, PageResponse } from './health';
import { Category } from './categories';

export type ProductType = 'PHYSICAL' | 'SERVICE';

export interface Product {
  id: number;
  businessId: number;
  name: string;
  description?: string;
  category?: Category;
  productType: ProductType;
  price: number;
  costPrice?: number;
  sku?: string;
  trackStock?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  categoryId?: number;
  productType: ProductType;
  price: number;
  costPrice?: number;
  sku?: string;
  trackStock?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  active?: boolean;
}

export interface ProductFilterParams {
  categoryId?: number;
  productType?: ProductType;
  active?: boolean;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const productsApi = {
  getProducts: async (params?: ProductFilterParams): Promise<PageResponse<Product>> => {
    const res = await apiClient.get<ApiResponse<any>>('/products', {
      params,
    });
    const rawData = res.data?.data;
    if (Array.isArray(rawData)) {
      return {
        content: rawData,
        totalElements: rawData.length,
        totalPages: 1,
        pageNumber: 0,
        pageSize: rawData.length,
        last: true,
      };
    }
    if (rawData && Array.isArray(rawData.content)) {
      return rawData;
    }
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      pageNumber: 0,
      pageSize: 0,
      last: true,
    };
  },

  getProduct: async (id: number): Promise<Product> => {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },

  createProduct: async (data: ProductRequest): Promise<Product> => {
    const res = await apiClient.post<ApiResponse<Product>>('/products', data);
    return res.data.data;
  },

  updateProduct: async (id: number, data: ProductRequest): Promise<Product> => {
    const res = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data.data;
  },

  updateProductStatus: async (id: number, active: boolean): Promise<Product> => {
    const res = await apiClient.patch<ApiResponse<Product>>(`/products/${id}/status`, { active });
    return res.data.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/products/${id}`);
  },
};
