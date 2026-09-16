import React, { useState, useEffect } from 'react';
import { fetchHealthStatus, fetchDiagnosticsStatus, HealthData } from '../api/health';
import { Activity, Database, Server, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Clock, Loader2 } from 'lucide-react';

export const HealthStatus: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState<boolean>(false);
  const [isColdStarting, setIsColdStarting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkHealth = async () => {
    setLoading(true);
    setIsColdStarting(false);
    setError(null);
    const startTime = performance.now();

    try {
      // 1. Fast lightweight basic health check (instant UP)
      const response = await fetchHealthStatus(15000);
      const endTime = performance.now();
      setLatencyMs(Math.round(endTime - startTime));
      setHealth(response.data);
      setIsColdStarting(false);
      setLastChecked(new Date());

      // 2. Asynchronously check deep database diagnostics without blocking the API card
      setDiagnosticsLoading(true);
      fetchDiagnosticsStatus(20000)
        .then((diagRes) => {
          if (diagRes?.data?.database) {
            setHealth((prev) => prev ? { ...prev, database: diagRes.data.database } : diagRes.data);
          }
        })
        .catch(() => {
          // If DB diagnostics times out or fails, mark as DEGRADED / UNKNOWN without marking whole API down
          setHealth((prev) => prev ? { ...prev, database: 'DISCONNECTED' } : prev);
        })
        .finally(() => {
          setDiagnosticsLoading(false);
        });

    } catch (err: any) {
      const endTime = performance.now();
      setLatencyMs(Math.round(endTime - startTime));

      const errMsg = String(err.response?.data?.message || err.message || '');
      const isTimeout =
        err.code === 'ECONNABORTED' ||
        errMsg.toLowerCase().includes('timeout') ||
        errMsg.toLowerCase().includes('network error') ||
        err.response?.status === 502 ||
        err.response?.status === 503;

      if (isTimeout) {
        setIsColdStarting(true);
        setError('Render free-tier backend is waking up from idle state (~20–45s). Please allow a moment for the instance to initialize and refresh.');
      } else {
        setIsColdStarting(false);
        setError(errMsg || 'Unable to connect to backend service. Please check backend connectivity.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const isUp = health?.status === 'UP';

  return (
    <div className="w-full bg-white rounded-2xl p-6 sm:p-7 border border-zinc-200 shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-700">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              System Health & Diagnostics
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                loading ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                isColdStarting ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                isUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  loading ? 'bg-amber-500 animate-ping' :
                  isColdStarting ? 'bg-amber-500 animate-pulse' :
                  isUp ? 'bg-emerald-500' :
                  'bg-red-500'
                }`} />
                {loading ? 'Checking...' : isColdStarting ? 'Waking Up (Cold Start)' : isUp ? 'Operational' : 'Degraded'}
              </span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Real-time status of Spring Boot REST backend and PostgreSQL database</p>
          </div>
        </div>

        <button
          onClick={checkHealth}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-zinc-500'}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Content Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Backend Status */}
        <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-zinc-600" />
              API Service
            </span>
            {isUp ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : isColdStarting ? (
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="text-sm font-bold text-zinc-900">
            {isUp ? 'Spring Boot 3.3.4 (UP)' : isColdStarting ? 'Starting Up / Waking' : 'Service Offline'}
          </div>
          <div className="text-[11px] text-zinc-400">
            {isColdStarting ? 'Render instance booting...' : latencyMs !== null ? `Latency: ${latencyMs}ms` : 'Latency: —'}
          </div>
        </div>

        {/* Database Status */}
        <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-zinc-600" />
              Database Engine
            </span>
            {diagnosticsLoading ? (
              <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
            ) : health?.database === 'CONNECTED' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : isColdStarting ? (
              <Clock className="w-4 h-4 text-amber-600" />
            ) : isUp ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className="text-sm font-bold text-zinc-900">
            PostgreSQL DB
          </div>
          <div className="text-[11px] text-zinc-400">
            {diagnosticsLoading ? 'Inspecting connectivity...' :
             health?.database === 'CONNECTED' ? 'Connection: CONNECTED' :
             health?.database === 'DISCONNECTED' ? 'Connection: DISCONNECTED' :
             isColdStarting ? 'Waking with backend' :
             isUp ? 'Connection: READY' :
             'Connection: DISCONNECTED'}
          </div>
        </div>

        {/* Telemetry Clock */}
        <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-600" />
              Last Inspected
            </span>
          </div>
          <div className="text-sm font-bold text-zinc-900">
            {lastChecked.toLocaleTimeString()}
          </div>
          <div className="text-[11px] text-zinc-400">
            Auto-validated on load
          </div>
        </div>
      </div>

      {error && (
        <div className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 ${
          isColdStarting
            ? 'bg-amber-50/90 border-amber-200 text-amber-800'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {isColdStarting ? (
            <Clock className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <p className="font-semibold">{isColdStarting ? 'Instance Cold Start in Progress' : 'Diagnostics Notice'}</p>
            <p className="leading-relaxed opacity-90">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
