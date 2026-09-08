import apiClient from './axios';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface HealthData {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  service: string;
  version: string;
  environment: string;
  database: 'CONNECTED' | 'DISCONNECTED';
  uptimeSeconds: number;
  timestamp: string;
}

export const fetchHealthStatus = async (): Promise<ApiResponse<HealthData>> => {
  const response = await apiClient.get<ApiResponse<HealthData>>('/health');
  return response.data;
};
