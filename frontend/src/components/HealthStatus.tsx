import React, { useState, useEffect } from 'react';
import { fetchHealthStatus, HealthData } from '../api/health';
import { Activity, Database, Server, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

export const HealthStatus: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();
    try {
      const response = await fetchHealthStatus();
      const endTime = performance.now();
      setLatencyMs(Math.round(endTime - startTime));
      setHealth(response.data);
      setLastChecked(new Date());
    } catch (err: any) {
      const endTime = performance.now();
      setLatencyMs(Math.round(endTime - startTime));
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to connect to backend service. Please check backend connectivity.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

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
                health?.status === 'UP' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  loading ? 'bg-amber-500' : health?.status === 'UP' ? 'bg-emerald-500' : 'bg-red-500'
                }`} />
                {loading ? 'Checking...' : health?.status === 'UP' ? 'Operational' : 'Degraded'}
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
            {health?.status === 'UP' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="text-sm font-bold text-zinc-900">
            {health?.status === 'UP' ? 'Spring Boot 3.3.4 (UP)' : 'Service Offline'}
          </div>
          <div className="text-[11px] text-zinc-400">
            Latency: {latencyMs !== null ? `${latencyMs}ms` : '—'}
          </div>
        </div>

        {/* Database Status */}
        <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-zinc-600" />
              Database Engine
            </span>
            {health?.database === 'CONNECTED' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className="text-sm font-bold text-zinc-900">
            PostgreSQL DB
          </div>
          <div className="text-[11px] text-zinc-400">
            Connection: {health?.database || 'CONNECTED'}
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
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
