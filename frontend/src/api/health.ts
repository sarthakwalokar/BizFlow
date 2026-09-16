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
  database?: 'CONNECTED' | 'DISCONNECTED' | 'NOT_CHECKED' | null;
  uptimeSeconds: number;
  timestamp: string;
}

/**
 * Fast, lightweight API health check (no DB/AI queries).
 */
export const fetchHealthStatus = async (timeoutMs = 15000): Promise<ApiResponse<HealthData>> => {
  const response = await apiClient.get<ApiResponse<HealthData>>('/health', {
    timeout: timeoutMs,
  });
  return response.data;
};

/**
 * Deep system diagnostics including database connectivity check.
 */
export const fetchDiagnosticsStatus = async (timeoutMs = 20000): Promise<ApiResponse<HealthData>> => {
  const response = await apiClient.get<ApiResponse<HealthData>>('/health/diagnostics', {
    timeout: timeoutMs,
  });
  return response.data;
};
