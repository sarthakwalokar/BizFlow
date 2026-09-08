import apiClient from './axios';
import { ApiResponse } from './health';
import { Business, User, BusinessType } from './auth';

export interface BusinessUpdateRequest {
  name: string;
  businessType?: BusinessType;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  currency?: string;
  timezone?: string;
  taxRate?: number;
  taxName?: string;
  taxNumber?: string;
  taxInclusive?: boolean;
  businessSize?: 'SMALL' | 'LARGE';
  inventoryEnabled?: boolean;
}

export interface StaffCreateRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  permissions?: string;
}

export interface StaffUpdateRequest {
  fullName: string;
  phone?: string;
  permissions?: string;
  enabled?: boolean;
}

export interface StaffPasswordResetRequest {
  newPassword: string;
}

export const businessApi = {
  getMyBusiness: async (): Promise<Business> => {
    const res = await apiClient.get<ApiResponse<Business>>('/business/me');
    return res.data.data;
  },

  updateMyBusiness: async (data: BusinessUpdateRequest): Promise<Business> => {
    const res = await apiClient.put<ApiResponse<Business>>('/business/me', data);
    return res.data.data;
  },

  getStaff: async (): Promise<User[]> => {
    const res = await apiClient.get<ApiResponse<User[]>>('/business/staff');
    return res.data.data;
  },

  createStaff: async (data: StaffCreateRequest): Promise<User> => {
    const res = await apiClient.post<ApiResponse<User>>('/business/staff', data);
    return res.data.data;
  },

  updateStaff: async (id: number, data: StaffUpdateRequest): Promise<User> => {
    const res = await apiClient.put<ApiResponse<User>>(`/business/staff/${id}`, data);
    return res.data.data;
  },

  updateStaffStatus: async (id: number, enabled: boolean): Promise<User> => {
    const res = await apiClient.patch<ApiResponse<User>>(`/business/staff/${id}/status`, { enabled });
    return res.data.data;
  },

  resetStaffPassword: async (id: number, data: StaffPasswordResetRequest): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/business/staff/${id}/reset-password`, data);
  },
};
