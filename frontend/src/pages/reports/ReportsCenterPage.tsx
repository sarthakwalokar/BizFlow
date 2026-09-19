import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { reportsApi, ReportType, ReportDataResponse } from '../../api/reports';
import { inventoryApi, Location } from '../../api/inventory';
import { formatCurrency } from '../../utils/currency';
import { ButtonSpinner, TableSkeleton, MetricCardsSkeleton } from '../../components/common/LoadingStates';
import {
  LucideIcon,
  FileText,
  Calendar,
  Search,
  RefreshCw,
  Building2,
  Receipt,
  TrendingDown,
  Users,
  Package,
  Star,
  AlertCircle,
  Table,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';

export const ReportsCenterPage: React.FC = () => {
  const { t } = useTranslation();
  const { business } = useAuth();
  const currency = business?.currency || 'USD';

  const [activeReport, setActiveReport] = useState<ReportType>('SALES');
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const [locations, setLocations] = useState<Location[]>([]);
  const [reportData, setReportData] = useState<ReportDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);
  const [exportingExcel, setExportingExcel] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination for in-browser table preview
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  useEffect(() => {
    const fetchLocations = async () => {
      if (business?.businessSize === 'LARGE') {
        try {
          const locs = await inventoryApi.getLocations();
          setLocations(locs);
        } catch {
          // ignore
        }
      }
    };
    fetchLocations();
  }, [business]);

  const loadReportPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentPage(1);

      const data = await reportsApi.previewReport({
        reportType: activeReport,
        startDate,
        endDate,
        locationId: selectedLocationId !== 'ALL' ? Number(selectedLocationId) : undefined,
        search: search || undefined,
      });

      setReportData(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t('reports.previewFailed', 'Failed to generate report preview.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportPreview();
  }, [activeReport, selectedLocationId]);

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      await reportsApi.exportPdf({
        reportType: activeReport,
        startDate,
        endDate,
        locationId: selectedLocationId !== 'ALL' ? Number(selectedLocationId) : undefined,
        search: search || undefined,
      });
    } catch (err: any) {
      setError(t('reports.pdfExportFailed', 'Failed to download PDF report. Please try again.'));
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      await reportsApi.exportExcel({
        reportType: activeReport,
        startDate,
        endDate,
        locationId: selectedLocationId !== 'ALL' ? Number(selectedLocationId) : undefined,
        search: search || undefined,
      });
    } catch (err: any) {
      setError(t('reports.csvExportFailed', 'Failed to download CSV/Excel report. Please try again.'));
    } finally {
      setExportingExcel(false);
    }
  };

  // Date Presets
  const applyDatePreset = (days: number) => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(new Date().setDate(new Date().getDate() - days)).toISOString().split('T')[0];
    setStartDate(start);
    setEndDate(end);
  };

  const reportTabs: { type: ReportType; labelKey: string; defaultLabel: string; icon: LucideIcon }[] = [
    { type: 'SALES', labelKey: 'reports.salesReport', defaultLabel: 'Sales & Invoices', icon: Receipt },
    { type: 'EXPENSES', labelKey: 'reports.expenseReport', defaultLabel: 'Operating Expenses', icon: TrendingDown },
    { type: 'CUSTOMERS', labelKey: 'customers.title', defaultLabel: 'Customer Ledger', icon: Users },
    { type: 'PRODUCTS', labelKey: 'products.title', defaultLabel: 'Product & Service Performance', icon: Package },
    { type: 'REVIEWS', labelKey: 'reviews.title', defaultLabel: 'Review & Feedback Audit', icon: Star },
  ];

  // Paginated Rows Slice
  const allRows = reportData?.rows || [];
  const totalPages = Math.ceil(allRows.length / pageSize) || 1;
  const paginatedRows = allRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{t('reports.title')}</h1>
            <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-200">
              {t('common.active')}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t('reports.subtitle')}
          </p>
        </div>

        {/* Global Export Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {exportingPdf ? (
              <ButtonSpinner text={t('common.loading')} spinnerColor="text-zinc-600" />
            ) : (
              <>
                <Download size={14} className="text-zinc-500" />
                <span>{t('reports.exportPdf')}</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportExcel}
            disabled={exportingExcel || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {exportingExcel ? (
              <ButtonSpinner text={t('common.loading')} spinnerColor="text-white" />
            ) : (
              <>
                <FileSpreadsheet size={14} />
                <span>{t('reports.exportCsv')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle size={15} className="text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Type Selector Tabs */}
      <div className="bg-white rounded-xl border border-zinc-200 p-1.5 shadow-xs flex flex-wrap gap-1">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveReport(tab.type)}
              className={`flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <Icon size={14} />
              <span>{t(tab.labelKey, tab.defaultLabel)}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date range controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-600 font-medium">
              <Calendar size={14} className="text-zinc-400" />
              <span>{t('reports.dateRange')}:</span>
            </div>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs text-zinc-800 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <span className="text-zinc-400">{t('reports.to')}</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs text-zinc-800 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />

            {/* Quick Presets */}
            <div className="hidden sm:flex items-center gap-1 pl-1">
              <button
                type="button"
                onClick={() => applyDatePreset(7)}
                className="px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-[11px] font-medium text-zinc-600 transition-colors cursor-pointer"
              >
                7 {t('reports.days', 'Days')}
              </button>
              <button
                type="button"
                onClick={() => applyDatePreset(30)}
                className="px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-[11px] font-medium text-zinc-600 transition-colors cursor-pointer"
              >
                30 {t('reports.days', 'Days')}
              </button>
              <button
                type="button"
                onClick={() => applyDatePreset(90)}
                className="px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-[11px] font-medium text-zinc-600 transition-colors cursor-pointer"
              >
                90 {t('reports.days', 'Days')}
              </button>
            </div>
          </div>

          {/* Location selector if Large */}
          {business?.businessSize === 'LARGE' && locations.length > 0 && (
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5">
              <Building2 size={13} className="text-zinc-400" />
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="text-xs font-medium text-zinc-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="ALL">{t('common.all')} {t('inventory.locationsTab', 'Branches')}</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search bar & Refresh */}
          <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
            <div className="relative flex-1 md:w-48">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadReportPreview()}
                placeholder={t('common.search')}
                className="w-full pl-7 pr-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <button
              onClick={loadReportPreview}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>{t('common.refresh')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Row */}
      {loading ? (
        <MetricCardsSkeleton count={4} />
      ) : reportData?.summaryCards && reportData.summaryCards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {reportData.summaryCards.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs"
            >
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
                {card.title}
              </span>
              <div className="text-lg font-bold text-zinc-900 mt-1">{card.value}</div>
              {card.subtitle && (
                <div className="text-xs text-brand-600 font-medium mt-0.5">{card.subtitle}</div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* Tabular Preview Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table size={15} className="text-zinc-500" />
            <h3 className="font-semibold text-zinc-900 text-xs">{reportData?.title || t('reports.reportPreview')}</h3>
          </div>
          <span className="text-xs text-zinc-400">
            {t('reports.totalRecords', { count: allRows.length })}
          </span>
        </div>

        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={7} cols={reportData?.columns.length || 6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium uppercase tracking-wider text-[10px]">
                  {reportData?.columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 ${
                        col.align === 'RIGHT'
                          ? 'text-right'
                          : col.align === 'CENTER'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={reportData?.columns.length || 7}
                      className="px-4 py-12 text-center text-zinc-400 space-y-1"
                    >
                      <FileText size={28} className="mx-auto text-zinc-300 mb-2" />
                      <p className="font-medium text-zinc-700">{t('common.noDataFound')}</p>
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-zinc-50/70 transition-colors">
                      {reportData?.columns.map((col) => {
                        const val = row[col.key];
                        const isBadge = col.type === 'BADGE';
                        const isCurrency = col.type === 'CURRENCY';

                        return (
                          <td
                            key={col.key}
                            className={`px-4 py-3 ${
                              col.align === 'RIGHT'
                                ? 'text-right'
                                : col.align === 'CENTER'
                                ? 'text-center'
                                : 'text-left'
                            }`}
                          >
                            {isBadge ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                                {val != null ? String(val) : '-'}
                              </span>
                            ) : isCurrency ? (
                              <span className="font-semibold text-zinc-900 font-mono">
                                {formatCurrency(Number(val) || 0, currency)}
                              </span>
                            ) : (
                              <span className="text-zinc-700">
                                {val != null ? String(val) : '-'}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && allRows.length > pageSize && (
          <div className="px-4 py-3 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500">
              {t('common.showingOf', { from: (currentPage - 1) * pageSize + 1, to: Math.min(currentPage * pageSize, allRows.length), total: allRows.length })}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-zinc-200 text-zinc-600 text-xs font-medium hover:bg-zinc-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={13} />
                <span>{t('common.previous')}</span>
              </button>
              <span className="px-2 py-1 text-xs font-medium text-zinc-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-zinc-200 text-zinc-600 text-xs font-medium hover:bg-zinc-50 disabled:opacity-40 cursor-pointer"
              >
                <span>{t('common.next')}</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
