import apiClient from './axios';

export type ReportType = 'SALES' | 'EXPENSES' | 'CUSTOMERS' | 'PRODUCTS' | 'REVIEWS';

export interface ReportColumn {
  key: string;
  label: string;
  type: 'STRING' | 'NUMBER' | 'CURRENCY' | 'DATE' | 'BADGE';
  align: 'LEFT' | 'RIGHT' | 'CENTER';
}

export interface ReportSummaryCard {
  title: string;
  value: string;
  subtitle?: string;
}

export interface ReportDataResponse {
  reportType: ReportType;
  title: string;
  businessName: string;
  currency: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  summaryCards: ReportSummaryCard[];
  columns: ReportColumn[];
  rows: Record<string, any>[];
  totalRows: number;
}

export interface ReportFilterRequest {
  reportType: ReportType;
  startDate?: string;
  endDate?: string;
  locationId?: number;
  categoryId?: number;
  paymentMethod?: string;
  search?: string;
}

export const reportsApi = {
  previewReport: async (filter: ReportFilterRequest): Promise<ReportDataResponse> => {
    const res = await apiClient.post('/reports/preview', filter);
    return res.data.data;
  },

  exportPdf: async (filter: ReportFilterRequest): Promise<void> => {
    const res = await apiClient.get('/reports/export/pdf', {
      params: filter,
      responseType: 'blob',
    });

    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bizflow-${filter.reportType.toLowerCase()}-report-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportExcel: async (filter: ReportFilterRequest): Promise<void> => {
    const res = await apiClient.get('/reports/export/excel', {
      params: filter,
      responseType: 'blob',
    });

    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bizflow-${filter.reportType.toLowerCase()}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
