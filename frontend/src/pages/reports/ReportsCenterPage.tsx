import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reportsApi, ReportType, ReportDataResponse } from '../../api/reports';
import { inventoryApi, Location } from '../../api/inventory';
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
} from 'lucide-react';

export const ReportsCenterPage: React.FC = () => {
  const { business } = useAuth();

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
        'Failed to generate report preview.'
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
      setError('Failed to download PDF report. Please try again.');
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
      setError('Failed to download Excel report. Please try again.');
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

  const reportTabs: { type: ReportType; label: string; icon: LucideIcon }[] = [
    { type: 'SALES', label: 'Sales & Invoices', icon: Receipt },
    { type: 'EXPENSES', label: 'Operating Expenses', icon: TrendingDown },
    { type: 'CUSTOMERS', label: 'Customer Ledger', icon: Users },
    { type: 'PRODUCTS', label: 'Product & Service Performance', icon: Package },
    { type: 'REVIEWS', label: 'Review & Feedback Audit', icon: Star },
  ];

  // Paginated Rows Slice
  const allRows = reportData?.rows || [];
  const totalPages = Math.ceil(allRows.length / pageSize) || 1;
  const paginatedRows = allRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports Center</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
              Export Ready
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Generate audit-ready financial, sales, inventory, and customer statements with instantaneous PDF and Excel exports.
          </p>
        </div>

        {/* Global Export Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || loading}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <FileText size={16} className={exportingPdf ? 'animate-pulse' : ''} />
            <span>{exportingPdf ? 'Generating PDF...' : 'Export PDF'}</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={exportingExcel || loading}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-700/30 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <FileSpreadsheet size={16} className={exportingExcel ? 'animate-pulse' : ''} />
            <span>{exportingExcel ? 'Generating Excel...' : 'Export Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Type Selector Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-xs flex flex-wrap gap-1.5">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveReport(tab.type)}
              className={`flex-1 min-w-[160px] inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Date range controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
              <Calendar size={15} className="text-indigo-600" />
              <span>Period:</span>
            </div>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <span className="text-xs text-slate-400 font-semibold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            {/* Quick Presets */}
            <div className="hidden sm:flex items-center space-x-1 pl-2">
              <button
                type="button"
                onClick={() => applyDatePreset(7)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-600 cursor-pointer"
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => applyDatePreset(30)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-600 cursor-pointer"
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => applyDatePreset(90)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-600 cursor-pointer"
              >
                90 Days
              </button>
            </div>
          </div>

          {/* Location selector if Large */}
          {business?.businessSize === 'LARGE' && locations.length > 0 && (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Building2 size={14} className="text-slate-400" />
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Branches</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search bar & Refresh */}
          <div className="flex items-center space-x-2 w-full md:w-auto ml-auto">
            <div className="relative flex-1 md:w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadReportPreview()}
                placeholder="Filter keywords..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              onClick={loadReportPreview}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Update Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Row */}
      {reportData?.summaryCards && reportData.summaryCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportData.summaryCards.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-1.5"
            >
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {card.title}
              </span>
              <div className="text-xl font-black text-slate-900 tracking-tight">{card.value}</div>
              {card.subtitle && (
                <div className="text-xs text-indigo-600 font-bold">{card.subtitle}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tabular Preview Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Table size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">{reportData?.title || 'Report Records'}</h3>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {allRows.length} total {allRows.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                {reportData?.columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-5 py-3.5 ${
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
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={reportData?.columns.length || 7}
                    className="px-6 py-12 text-center text-slate-400 font-medium"
                  >
                    Generating report data preview...
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={reportData?.columns.length || 7}
                    className="px-6 py-12 text-center text-slate-400 space-y-1"
                  >
                    <FileText size={32} className="mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-700">No data found matching the selected timeframe</p>
                    <p className="text-[11px] text-slate-400">Try widening your date filters or switching branches.</p>
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                    {reportData?.columns.map((col) => {
                      const val = row[col.key];
                      const isBadge = col.type === 'BADGE';
                      const isCurrency = col.type === 'CURRENCY';

                      return (
                        <td
                          key={col.key}
                          className={`px-5 py-3.5 ${
                            col.align === 'RIGHT'
                              ? 'text-right'
                              : col.align === 'CENTER'
                              ? 'text-center'
                              : 'text-left'
                          }`}
                        >
                          {isBadge ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {val != null ? String(val) : '-'}
                            </span>
                          ) : isCurrency ? (
                            <span className="font-extrabold text-slate-900 font-mono">
                              {typeof val === 'number'
                                ? val.toFixed(2)
                                : val != null
                                ? Number(val).toFixed(2)
                                : '0.00'}
                            </span>
                          ) : (
                            <span className="font-medium text-slate-700">
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

        {/* Pagination Bar */}
        {allRows.length > pageSize && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, allRows.length)} of {allRows.length} entries
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-3 py-1 font-bold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
