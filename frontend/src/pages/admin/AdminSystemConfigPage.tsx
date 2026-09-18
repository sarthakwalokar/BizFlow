import React, { useState, useEffect } from 'react';
import { adminApi, AdminSystemConfig } from '../../api/admin';
import { ButtonSpinner } from '../../components/common/LoadingStates';
import {
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Globe,
  Sliders,
} from 'lucide-react';

export const AdminSystemConfigPage: React.FC = () => {
  const [config, setConfig] = useState<AdminSystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form editable states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowSelfRegistration, setAllowSelfRegistration] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [defaultTimezone, setDefaultTimezone] = useState('Asia/Kolkata');
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(1440);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getSystemConfig();
      setConfig(data);
      setMaintenanceMode(data.maintenanceMode);
      setAllowSelfRegistration(data.allowSelfRegistration);
      setDefaultCurrency(data.defaultCurrency);
      setDefaultTimezone(data.defaultTimezone);
      setSessionTimeoutMinutes(data.sessionTimeoutMinutes);
    } catch (err) {
      console.error('Failed to load system config', err);
      setError('Failed to fetch platform configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const updated = await adminApi.updateSystemConfig({
        maintenanceMode,
        allowSelfRegistration,
        defaultCurrency,
        defaultTimezone,
        sessionTimeoutMinutes,
      });
      setConfig(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update system parameters.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">System Configuration</h1>
            <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-200">
              Platform Controls
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Global environment parameters, self-registration controls, and AI gateway runtime telemetry.
          </p>
        </div>

        <button
          onClick={loadConfig}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-medium shadow-xs transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-brand-600' : 'text-zinc-400'} />
          <span>Reload Config</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Platform configuration updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Operational Toggles Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
            <Sliders size={16} className="text-brand-600" />
            <h3 className="text-sm font-semibold text-zinc-900">Platform Operation Switches</h3>
          </div>

          <div className="space-y-3">
            {/* Self Registration Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
              <div>
                <span className="text-xs font-semibold text-zinc-900 block">Tenant Self-Registration</span>
                <p className="text-[11px] text-zinc-500">
                  Allow new business owners to register accounts directly via the public website
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={allowSelfRegistration}
                  onChange={(e) => setAllowSelfRegistration(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600" />
              </label>
            </div>

            {/* Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
              <div>
                <span className="text-xs font-semibold text-zinc-900 block">Platform Maintenance Mode</span>
                <p className="text-[11px] text-zinc-500">
                  Pause non-admin transactions and restrict access during backend updates
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Global Defaults Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
            <Globe size={16} className="text-zinc-600" />
            <h3 className="text-sm font-semibold text-zinc-900">Default Regional & Security Presets</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700">Default Currency</label>
              <input
                type="text"
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                placeholder="USD"
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700">Default Timezone</label>
              <input
                type="text"
                value={defaultTimezone}
                onChange={(e) => setDefaultTimezone(e.target.value)}
                placeholder="Asia/Kolkata"
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700">Session Expiry (Minutes)</label>
              <input
                type="number"
                value={sessionTimeoutMinutes}
                onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
                min={15}
                max={10080}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* AI Gateway & Runtime Health */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
            <Zap size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-zinc-900">Platform Runtime & AI Providers</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="text-zinc-400 text-[10px] block">Active AI Provider</span>
              <span className="font-semibold text-brand-700">
                {config?.activeAiProvider || 'BizFlow Intelligent Advisor'}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="text-zinc-400 text-[10px] block">Runtime Environment</span>
              <span className="font-semibold text-zinc-900">{config?.environment || 'Spring Boot 3.3.4 (Dev)'}</span>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="text-zinc-400 text-[10px] block">Available Fallback Chains</span>
              <span className="text-zinc-700">
                {config?.availableAiProviders?.join(' → ') || 'BizFlow AI Engine (Primary) → Rule Engine'}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="text-zinc-400 text-[10px] block">Server Synchronized Time</span>
              <span className="font-mono text-zinc-700">
                {config?.serverTime ? new Date(config.serverTime).toUTCString() : 'Syncing...'}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? <ButtonSpinner size="xs" /> : <Save size={14} />}
            <span>{saving ? 'Applying...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

