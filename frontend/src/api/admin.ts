import apiClient from './axios';
import { ApiResponse } from './health';
import { Business, User, BusinessType } from './auth';

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AdminActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  businessName: string;
  timestamp: string;
}

export interface AdminDashboardStats {
  totalBusinesses: number;
  activeBusinesses: number;
  inactiveBusinesses: number;
  totalUsers: number;
  totalOwners: number;
  totalStaff: number;
  totalProducts: number;
  totalOrders: number;
  businessTypeDistribution: Record<string, number>;
  businessSizeDistribution: Record<string, number>;
  recentActivity: AdminActivityItem[];
}

export interface OwnerSummary {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  enabled: boolean;
  createdAt: string;
}

export interface AdminBusinessDetail {
  id: number;
  name: string;
  businessType: BusinessType;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  currency: string;
  timezone: string;
  taxRate: number;
  taxName: string;
  taxNumber?: string;
  taxInclusive: boolean;
  reviewSlug?: string;
  publicReviewUrl?: string;
  reviewEnabled: boolean;
  businessSize: 'SMALL' | 'LARGE';
  inventoryEnabled: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: OwnerSummary;
  staffCount: number;
  productCount: number;
  orderCount: number;
  customerCount: number;
}

export interface MonthlyRegistrationPoint {
  monthLabel: string;
  registrations: number;
}

export interface AdminPlatformReport {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  activeTenantPercentage: number;
  smallBusinessesCount: number;
  largeBusinessesCount: number;
  businessTypeDistribution: Record<string, number>;
  registrationTrend: MonthlyRegistrationPoint[];
}

export interface AdminSystemConfig {
  platformName: string;
  platformVersion: string;
  environment: string;
  maintenanceMode: boolean;
  allowSelfRegistration: boolean;
  defaultCurrency: string;
  defaultTimezone: string;
  sessionTimeoutMinutes: number;
  serverTime: string;
  activeAiProvider: string;
  availableAiProviders: string[];
}

export interface AdminSystemConfigUpdate {
  maintenanceMode?: boolean;
  allowSelfRegistration?: boolean;
  defaultCurrency?: string;
  defaultTimezone?: string;
  sessionTimeoutMinutes?: number;
}

export const adminApi = {
  getStats: async (): Promise<AdminDashboardStats> => {
    const res = await apiClient.get<ApiResponse<AdminDashboardStats>>('/admin/stats');
    return res.data.data;
  },

  searchBusinesses: async (params?: {
    search?: string;
    businessType?: string;
    active?: boolean;
    page?: number;
    size?: number;
  }): Promise<PageResponse<Business>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.businessType) searchParams.append('businessType', params.businessType);
    if (params?.active !== undefined) searchParams.append('active', String(params.active));
    searchParams.append('page', String(params?.page ?? 0));
    searchParams.append('size', String(params?.size ?? 20));

    const res = await apiClient.get<ApiResponse<PageResponse<Business>>>(`/admin/businesses?${searchParams.toString()}`);
    return res.data.data;
  },

  getAllBusinesses: async (page = 0, size = 20): Promise<PageResponse<Business>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Business>>>(`/admin/businesses?page=${page}&size=${size}`);
    return res.data.data;
  },

  getBusinessDetails: async (id: number): Promise<AdminBusinessDetail> => {
    const res = await apiClient.get<ApiResponse<AdminBusinessDetail>>(`/admin/businesses/${id}`);
    return res.data.data;
  },

  updateBusinessStatus: async (id: number, active: boolean): Promise<Business> => {
    const res = await apiClient.patch<ApiResponse<Business>>(`/admin/businesses/${id}/status`, { active });
    return res.data.data;
  },

  searchUsers: async (params?: {
    search?: string;
    role?: string;
    enabled?: boolean;
    page?: number;
    size?: number;
  }): Promise<PageResponse<User>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.enabled !== undefined) searchParams.append('enabled', String(params.enabled));
    searchParams.append('page', String(params?.page ?? 0));
    searchParams.append('size', String(params?.size ?? 20));

    const res = await apiClient.get<ApiResponse<PageResponse<User>>>(`/admin/users?${searchParams.toString()}`);
    return res.data.data;
  },

  getAllUsers: async (page = 0, size = 20): Promise<PageResponse<User>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<User>>>(`/admin/users?page=${page}&size=${size}`);
    return res.data.data;
  },

  updateUserStatus: async (id: number, enabled: boolean): Promise<User> => {
    const res = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/status`, { enabled });
    return res.data.data;
  },

  getPlatformReports: async (): Promise<AdminPlatformReport> => {
    const res = await apiClient.get<ApiResponse<AdminPlatformReport>>('/admin/reports');
    return res.data.data;
  },

  getSystemConfig: async (): Promise<AdminSystemConfig> => {
    const res = await apiClient.get<ApiResponse<AdminSystemConfig>>('/admin/system/config');
    return res.data.data;
  },

  updateSystemConfig: async (data: AdminSystemConfigUpdate): Promise<AdminSystemConfig> => {
    const res = await apiClient.put<ApiResponse<AdminSystemConfig>>('/admin/system/config', data);
    return res.data.data;
  },
};
