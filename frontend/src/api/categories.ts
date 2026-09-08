import apiClient from './axios';
import { ApiResponse } from './health';

export interface Category {
  id: number;
  businessId: number;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  active?: boolean;
}

export const categoriesApi = {
  getCategories: async (activeOnly = false): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories', {
      params: activeOnly ? { activeOnly: true } : {},
    });
    return res.data.data;
  },

  getCategory: async (id: number): Promise<Category> => {
    const res = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return res.data.data;
  },

  createCategory: async (data: CategoryRequest): Promise<Category> => {
    const res = await apiClient.post<ApiResponse<Category>>('/categories', data);
    return res.data.data;
  },

  updateCategory: async (id: number, data: CategoryRequest): Promise<Category> => {
    const res = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return res.data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/categories/${id}`);
  },
};
