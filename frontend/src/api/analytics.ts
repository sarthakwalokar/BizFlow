import apiClient from './axios';

export type TimeRange = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM';

export interface DailySalesPoint {
  date: string;
  label: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface DailyExpensePoint {
  date: string;
  label: string;
  amount: number;
  expenseCount: number;
}

export interface TopProductPoint {
  productId?: number;
  productName: string;
  productType: string;
  quantitySold: number;
  totalRevenue: number;
  revenuePercentage: number;
}

export interface PaymentDistributionPoint {
  paymentMethod: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface CustomerFrequencyMetrics {
  totalCustomers: number;
  newCustomersInPeriod: number;
  activeCustomersInPeriod: number;
  repeatCustomers: number;
  repeatCustomerRate: number;
  averageOrdersPerCustomer: number;
  averageCustomerLifetimeValue: number;
}

export interface BranchPerformancePoint {
  locationId: number;
  locationName: string;
  locationCode?: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
  expenseTotal: number;
  netRevenue: number;
  revenueSharePercentage: number;
}

export interface AnalyticsOverview {
  timeRange: TimeRange;
  startDate: string;
  endDate: string;
  currency: string;
  locationId?: number;
  locationName?: string;
  largeBusiness: boolean;

  // KPIs
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
  expenseTotal: number;
  netRevenue: number;
  profitMarginPercentage: number;

  // Series
  salesTrend: DailySalesPoint[];
  expenseTrend: DailyExpensePoint[];
  topProducts: TopProductPoint[];
  paymentDistribution: PaymentDistributionPoint[];
  customerFrequency: CustomerFrequencyMetrics;
  branchPerformance: BranchPerformancePoint[];
}

export interface AnalyticsFilterParams {
  timeRange?: TimeRange;
  startDate?: string;
  endDate?: string;
  locationId?: number;
}

export const analyticsApi = {
  getOverview: async (params?: AnalyticsFilterParams): Promise<AnalyticsOverview> => {
    const res = await apiClient.get('/analytics/overview', { params });
    return res.data.data;
  },
};
