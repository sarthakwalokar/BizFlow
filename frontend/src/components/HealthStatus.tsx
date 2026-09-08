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
    <div className="w-full glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-brand-400 shadow-inner">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Live System Diagnostics
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  loading ? 'bg-amber-400 opacity-75' : health?.status === 'UP' ? 'bg-emerald-400 opacity-75' : 'bg-rose-400 opacity-75'
                }`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  loading ? 'bg-amber-500' : health?.status === 'UP' ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
              </span>
            </h2>
            <p className="text-xs text-slate-400">Endpoint: <code className="text-brand-300 font-mono">GET /api/v1/health</code></p>
          </div>
        </div>

        <button
          onClick={checkHealth}
          disabled={loading}
          id="refresh-health-btn"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white shadow-lg shadow-brand-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Diagnosing...' : 'Test Connection'}</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Metric 1: Backend Service */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">Backend API</span>
            <Server className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-center space-x-2">
            {loading ? (
              <span className="text-sm font-semibold text-slate-400 animate-pulse">Checking...</span>
            ) : health?.status === 'UP' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="text-sm font-bold text-white">UP & RUNNING</span>
                  <p className="text-[11px] text-emerald-400">Spring Boot 3.3.4</p>
                </div>
              </>
            ) : health?.status === 'DEGRADED' ? (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <span className="text-sm font-bold text-amber-300">DEGRADED</span>
                  <p className="text-[11px] text-slate-400">Service responding</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <span className="text-sm font-bold text-rose-300">OFFLINE</span>
                  <p className="text-[11px] text-slate-500">Not reachable</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Metric 2: PostgreSQL Database */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">PostgreSQL Database</span>
            <Database className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-center space-x-2">
            {loading ? (
              <span className="text-sm font-semibold text-slate-400 animate-pulse">Querying...</span>
            ) : health?.database === 'CONNECTED' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="text-sm font-bold text-white">CONNECTED</span>
                  <p className="text-[11px] text-emerald-400">HikariCP Pool Active</p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <span className="text-sm font-bold text-amber-300">DISCONNECTED</span>
                  <p className="text-[11px] text-slate-400">Awaiting credentials in .env</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Metric 3: Round-trip Latency */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">API Latency</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            {loading ? (
              <span className="text-sm font-semibold text-slate-400 animate-pulse">Measuring...</span>
            ) : latencyMs !== null ? (
              <>
                <span className={`text-xl font-bold tracking-tight ${latencyMs < 100 ? 'text-emerald-400' : latencyMs < 300 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {latencyMs}
                </span>
                <span className="text-xs font-semibold text-slate-400">ms</span>
              </>
            ) : (
              <span className="text-sm text-slate-500">N/A</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Direct REST roundtrip</p>
        </div>

        {/* Metric 4: Uptime / Version */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">Environment & Uptime</span>
            <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold rounded bg-brand-500/20 text-brand-300">
              {health?.environment || 'DEV'}
            </span>
          </div>
          <div>
            <span className="text-sm font-bold text-white">
              {health?.uptimeSeconds !== undefined ? `${health.uptimeSeconds}s active` : 'Active'}
            </span>
            <p className="text-[11px] text-slate-400">Last checked: {lastChecked.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Error / Alert notice if any */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start space-x-3 text-xs text-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-300">Backend Communication Notice:</p>
            <p className="text-rose-200/90">{error}</p>
            <p className="text-slate-400 text-[11px]">Start the backend service via <code className="text-slate-300 bg-slate-900 px-1 py-0.5 rounded">cd backend &amp;&amp; mvn spring-boot:run</code></p>
          </div>
        </div>
      )}
    </div>
  );
};
