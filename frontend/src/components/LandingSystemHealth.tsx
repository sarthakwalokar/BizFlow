import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchDiagnosticsStatus, HealthData } from '../api/health';
import {
  Activity,
  Server,
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Zap,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

/**
 * Typical cold-start duration for Render free-tier Dockerized Java/Spring Boot instances.
 */
const RENDER_COLD_START_SECONDS = 30;

export type BackendStatus = 'OPERATIONAL' | 'STARTING' | 'UNAVAILABLE';
export type DbStatus = 'CONNECTED' | 'DISCONNECTED' | 'PENDING' | 'UNAVAILABLE';
export type OverallStatus = 'OPERATIONAL' | 'STARTING' | 'DEGRADED' | 'UNAVAILABLE';

export const LandingSystemHealth: React.FC = () => {
  const { t, i18n } = useTranslation();

  const [backendStatus, setBackendStatus] = useState<BackendStatus>('STARTING');
  const [databaseStatus, setDatabaseStatus] = useState<DbStatus>('PENDING');
  const [overallStatus, setOverallStatus] = useState<OverallStatus>('STARTING');

  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isColdStarting, setIsColdStarting] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(RENDER_COLD_START_SECONDS);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Clear countdown timer safely
  const stopCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  // Start countdown ticking from current or specified seconds
  const startCountdown = useCallback((initialSeconds = RENDER_COLD_START_SECONDS) => {
    stopCountdown();
    setCountdownSeconds(initialSeconds);
    countdownTimerRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          stopCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopCountdown]);

  // Main Health Verification Function
  const checkHealth = useCallback(async (isManualTrigger = false) => {
    if (!isMountedRef.current) return;
    setIsChecking(true);

    const startTime = performance.now();
    try {
      // 8s timeout for rapid cold-start polling
      const res = await fetchDiagnosticsStatus(8000);
      const measuredLatency = Math.round(performance.now() - startTime);

      if (!isMountedRef.current) return;

      const data = res?.data;
      setHealthData(data || null);
      setLatencyMs(measuredLatency);
      setLastChecked(new Date());

      // Backend answered successfully -> stop cold start immediately!
      setIsColdStarting(false);
      stopCountdown();

      const isDbConnected = data?.database === 'CONNECTED';
      const isBackendUp = data?.status === 'UP' || data?.status === 'DEGRADED';

      if (isBackendUp) {
        setBackendStatus('OPERATIONAL');
        if (isDbConnected) {
          setDatabaseStatus('CONNECTED');
          setOverallStatus('OPERATIONAL');
        } else {
          setDatabaseStatus('DISCONNECTED');
          setOverallStatus('DEGRADED');
        }
      } else {
        setBackendStatus('UNAVAILABLE');
        setDatabaseStatus('UNAVAILABLE');
        setOverallStatus('UNAVAILABLE');
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setLatencyMs(null);
      setLastChecked(new Date());

      const status = err?.response?.status;
      const isTimeoutOrNetwork =
        err?.code === 'ECONNABORTED' ||
        err?.message?.toLowerCase().includes('timeout') ||
        err?.message?.toLowerCase().includes('network error') ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        !err?.response;

      if (isTimeoutOrNetwork) {
        // Backend is waking up from sleep on Render
        setBackendStatus('STARTING');
        setDatabaseStatus('PENDING');
        setOverallStatus('STARTING');

        // Only initialize countdown if not already running
        setIsColdStarting((alreadyCold) => {
          if (!alreadyCold || isManualTrigger) {
            startCountdown(RENDER_COLD_START_SECONDS);
          }
          return true;
        });
      } else {
        // Concrete non-recoverable error
        setIsColdStarting(false);
        stopCountdown();
        setBackendStatus('UNAVAILABLE');
        setDatabaseStatus('UNAVAILABLE');
        setOverallStatus('UNAVAILABLE');
      }
    } finally {
      if (isMountedRef.current) {
        setIsChecking(false);
      }
    }
  }, [startCountdown, stopCountdown]);

  // Initial check and lifecycle
  useEffect(() => {
    isMountedRef.current = true;
    checkHealth();

    return () => {
      isMountedRef.current = false;
      stopCountdown();
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, [checkHealth, stopCountdown]);

  // Adaptive Polling Scheduler
  useEffect(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
    }

    // Fast polling (4s) during cold start / starting
    // Moderate polling (15s) during unavailable
    // Relaxed polling (45s) when healthy / operational
    const pollDelayMs =
      isColdStarting || overallStatus === 'STARTING'
        ? 4000
        : overallStatus === 'OPERATIONAL'
        ? 45000
        : 15000;

    pollTimerRef.current = setTimeout(() => {
      checkHealth();
    }, pollDelayMs);

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, [isColdStarting, overallStatus, checkHealth, lastChecked]);

  // Handle countdown expiry transition if backend takes longer than 30s
  useEffect(() => {
    if (isColdStarting && countdownSeconds === 0) {
      // Countdown reached 0 without response
      // Keep trying in the background, but update wording gracefully
    }
  }, [isColdStarting, countdownSeconds]);

  // Helper formatting for uptime
  const formatUptime = (seconds?: number) => {
    if (!seconds && seconds !== 0) return '—';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ${seconds % 60}s`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

  // Helper to format last inspected time in active locale
  const formattedTime = lastChecked
    ? lastChecked.toLocaleTimeString(i18n.language || undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—';

  return (
    <section
      id="system-health"
      aria-label={t('health.landingSectionTitle', 'System Health & Live Availability')}
      className="py-12 sm:py-16 bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-50 border-t border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 md:p-8 space-y-6">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-950 tracking-tight">
                    {t('health.landingSectionTitle', 'System Health & Live Availability')}
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Live Diagnostics
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t(
                    'health.landingSectionSubtitle',
                    'Real-time verification of BizFlow backend services and PostgreSQL database connectivity.'
                  )}
                </p>
              </div>
            </div>

            {/* Actions & Last Checked */}
            <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto">
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('health.lastChecked', 'Last checked')}: <strong className="text-slate-700">{formattedTime}</strong></span>
              </span>

              <button
                type="button"
                id="refresh-system-health-btn"
                onClick={() => checkHealth(true)}
                disabled={isChecking}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 text-slate-700 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                title={t('health.refresh', 'Refresh')}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
                <span className="hidden xs:inline">{t('health.refresh', 'Refresh')}</span>
              </button>
            </div>
          </div>

          {/* Prominent Overall Status Banner */}
          <div>
            {overallStatus === 'OPERATIONAL' && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-200/90 text-emerald-900 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                      <span>{t('health.allOperational', 'All Systems Operational')}</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-emerald-700 mt-0.5">
                      {t('health.subtitle', 'Backend microservices and PostgreSQL database are fully operational.')}
                    </p>
                  </div>
                </div>

                {latencyMs !== null && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-800 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{latencyMs}ms</span>
                  </span>
                )}
              </div>
            )}

            {overallStatus === 'STARTING' && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50 border border-amber-300 text-amber-950 space-y-3 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs animate-pulse">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                        <span>{t('health.backendStarting', 'Backend is starting...')}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold border border-amber-300">
                          {countdownSeconds > 0 ? `~${countdownSeconds}s remaining` : 'Initializing instance...'}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-amber-800 mt-1 leading-relaxed">
                        {t(
                          'health.renderColdStartNote',
                          'BizFlow cloud instance on Render is waking up from sleep. The status will update automatically once online.'
                        )}
                      </p>
                    </div>
                  </div>

                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-700" />
                    <span>{t('health.checkingStatus', 'Checking...')}</span>
                  </span>
                </div>

                {/* Smooth Progress Indicator */}
                <div className="w-full bg-amber-200/60 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-1000 ease-linear rounded-full"
                    style={{
                      width: `${Math.max(5, Math.min(100, ((RENDER_COLD_START_SECONDS - countdownSeconds) / RENDER_COLD_START_SECONDS) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {overallStatus === 'DEGRADED' && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50/60 to-rose-50 border border-rose-200 text-rose-950 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-rose-900">
                      {t('health.dbIssue', 'System Issue: Database Disconnected')}
                    </div>
                    <p className="text-[11px] sm:text-xs text-rose-700 mt-0.5">
                      {t('health.connectError', 'API is responsive but PostgreSQL connection is disconnected. Retrying check...')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {overallStatus === 'UNAVAILABLE' && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-slate-50 to-rose-50 border border-rose-200 text-rose-950 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-rose-900">
                      {t('health.systemUnavailable', 'Backend Service Unavailable')}
                    </div>
                    <p className="text-[11px] sm:text-xs text-rose-700 mt-0.5">
                      {t('health.connectError', 'Unable to reach backend API. Automatically retrying in the background...')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3-Column Detailed Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            
            {/* 1. Backend API Status */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span>{t('health.backendApi', 'Backend API')}</span>
                </span>
                
                {backendStatus === 'OPERATIONAL' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{t('health.operational', 'Operational')}</span>
                  </span>
                )}
                {backendStatus === 'STARTING' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                    <span>{t('health.starting', 'Starting...')}</span>
                  </span>
                )}
                {backendStatus === 'UNAVAILABLE' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>{t('health.unavailable', 'Unavailable')}</span>
                  </span>
                )}
              </div>

              <div className="text-sm font-extrabold text-slate-900">
                {backendStatus === 'OPERATIONAL'
                  ? 'Spring Boot 3.3.4 (REST API)'
                  : backendStatus === 'STARTING'
                  ? t('health.startingUp', 'Starting up cold instance...')
                  : t('health.offline', 'Service Offline')}
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60 font-mono">
                <span>
                  {latencyMs !== null
                    ? `${t('health.latency', 'Latency')}: ${latencyMs}ms`
                    : backendStatus === 'STARTING'
                    ? t('health.booting', 'Booting Service...')
                    : 'HTTP Status: —'}
                </span>
                <span className="text-slate-400">
                  {healthData?.version ? `v${healthData.version}` : 'v1.0.0'}
                </span>
              </div>
            </div>

            {/* 2. Database Status */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Database className="w-4 h-4 text-cyan-600" />
                  <span>{t('health.database', 'PostgreSQL Database')}</span>
                </span>

                {databaseStatus === 'CONNECTED' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{t('health.connected', 'Connected')}</span>
                  </span>
                )}
                {databaseStatus === 'DISCONNECTED' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>{t('health.disconnected', 'Disconnected')}</span>
                  </span>
                )}
                {databaseStatus === 'PENDING' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>{t('health.pendingBackend', 'Waiting for API')}</span>
                  </span>
                )}
                {databaseStatus === 'UNAVAILABLE' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
                    <XCircle className="w-3 h-3 text-slate-500" />
                    <span>{t('health.unavailable', 'Unavailable')}</span>
                  </span>
                )}
              </div>

              <div className="text-sm font-extrabold text-slate-900">
                PostgreSQL Engine
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span>
                  {databaseStatus === 'CONNECTED'
                    ? t('health.verifiedLive', 'Live DB Ping (SELECT 1)')
                    : databaseStatus === 'DISCONNECTED'
                    ? t('health.disconnected', 'Disconnected')
                    : databaseStatus === 'PENDING'
                    ? t('health.wakingWithBackend', 'Waking with backend...')
                    : t('health.unavailable', 'Unavailable')}
                </span>
                <span className="text-slate-400 font-mono">HikariCP</span>
              </div>
            </div>

            {/* 3. Overall System & Telemetry */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t('health.overallStatus', 'Overall System Status')}</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    overallStatus === 'OPERATIONAL'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : overallStatus === 'STARTING'
                      ? 'text-amber-700 bg-amber-50 border-amber-200'
                      : overallStatus === 'DEGRADED'
                      ? 'text-rose-700 bg-rose-50 border-rose-200'
                      : 'text-rose-700 bg-rose-50 border-rose-200'
                  }`}
                >
                  {overallStatus === 'OPERATIONAL' && t('health.operational', 'Operational')}
                  {overallStatus === 'STARTING' && t('health.starting', 'Starting...')}
                  {overallStatus === 'DEGRADED' && t('health.degraded', 'Degraded')}
                  {overallStatus === 'UNAVAILABLE' && t('health.unavailable', 'Unavailable')}
                </span>
              </div>

              <div className="text-sm font-extrabold text-slate-900">
                {overallStatus === 'OPERATIONAL'
                  ? 'All Services Healthy'
                  : overallStatus === 'STARTING'
                  ? t('health.starting', 'Starting...')
                  : overallStatus === 'DEGRADED'
                  ? t('health.degraded', 'Degraded Connectivity')
                  : t('health.unavailable', 'Unavailable')}
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60 font-mono">
                <span>
                  {healthData?.uptimeSeconds !== undefined
                    ? `${t('health.uptime', 'Uptime')}: ${formatUptime(healthData.uptimeSeconds)}`
                    : overallStatus === 'STARTING'
                    ? `Countdown: ${countdownSeconds}s`
                    : 'Uptime: —'}
                </span>
                <span className="text-slate-400 capitalize">
                  {healthData?.environment || 'Cloud'}
                </span>
              </div>
            </div>

          </div>

          {/* Micro Footer Notice */}
          <div className="pt-2 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>
              {t(
                'health.diagnosticsNotice',
                'This status updates in real-time as backend health checks complete.'
              )}
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              BizFlow Cloud Health Diagnostics • Port 8080 / TLS 1.3
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
