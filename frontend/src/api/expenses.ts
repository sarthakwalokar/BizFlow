import apiClient from './axios';
import { ApiResponse, PageResponse } from './health';
import { PaymentMethod } from './billing';

export type ExpenseCategory =
  | 'RENT'
  | 'SALARY'
  | 'ELECTRICITY'
  | 'PURCHASE'
  | 'TRANSPORT'
  | 'MARKETING'
  | 'MAINTENANCE'
  | 'OTHER';

export interface Expense {
  id: number;
  businessId: number;
  category: ExpenseCategory;
  description?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  expenseDate: string;
  createdById?: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseRequest {
  category: ExpenseCategory;
  description?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  expenseDate: string;
}

export interface ExpenseCategorySummary {
  category: ExpenseCategory;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface ExpenseSummaryResponse {
  todayExpenses: number;
  monthExpenses: number;
  totalExpenses: number;
  categoryBreakdown: ExpenseCategorySummary[];
  recentExpenses: Expense[];
}

export interface ExpenseFilterParams {
  startDate?: string;
  endDate?: string;
  category?: ExpenseCategory;
  paymentMethod?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const expensesApi = {
  getExpenses: async (params?: ExpenseFilterParams): Promise<PageResponse<Expense>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Expense>>>('/expenses', {
      params,
    });
    return res.data.data;
  },

  getExpenseById: async (id: number): Promise<Expense> => {
    const res = await apiClient.get<ApiResponse<Expense>>(`/expenses/${id}`);
    return res.data.data;
  },

  createExpense: async (data: ExpenseRequest): Promise<Expense> => {
    const res = await apiClient.post<ApiResponse<Expense>>('/expenses', data);
    return res.data.data;
  },

  updateExpense: async (id: number, data: ExpenseRequest): Promise<Expense> => {
    const res = await apiClient.put<ApiResponse<Expense>>(`/expenses/${id}`, data);
    return res.data.data;
  },

  deleteExpense: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/expenses/${id}`);
  },

  getSummary: async (): Promise<ExpenseSummaryResponse> => {
    const res = await apiClient.get<ApiResponse<ExpenseSummaryResponse>>('/expenses/summary');
    return res.data.data;
  },
};
