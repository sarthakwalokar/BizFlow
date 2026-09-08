import apiClient from './axios';
import { ApiResponse } from './health';

export type Role = 'OWNER' | 'STAFF' | 'ADMIN';
export type BusinessType = 'RETAIL' | 'RESTAURANT' | 'CAFE' | 'BAKERY' | 'SALON' | 'SERVICE' | 'OTHER';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  permissions?: string;
  businessId?: number;
  enabled: boolean;
  createdAt: string;
}

export interface Business {
  id: number;
  name: string;
  businessType: BusinessType;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  currency: string;
  timezone: string;
  taxRate?: number;
  taxName?: string;
  taxNumber?: string;
  taxInclusive?: boolean;
  businessSize?: 'SMALL' | 'LARGE';
  inventoryEnabled?: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseData {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  business?: Business;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  businessName: string;
  businessType: BusinessType;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export const authApi = {
  signup: async (data: SignupRequest): Promise<AuthResponseData> => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/signup', data);
    return res.data.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponseData> => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', data);
    return res.data.data;
  },

  getMe: async (): Promise<AuthResponseData> => {
    const res = await apiClient.get<ApiResponse<AuthResponseData>>('/auth/me');
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<void>>('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
  },
};
