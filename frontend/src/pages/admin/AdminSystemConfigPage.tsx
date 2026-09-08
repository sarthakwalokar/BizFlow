import React, { useState, useEffect } from 'react';
import { adminApi, AdminSystemConfig } from '../../api/admin';
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
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white tracking-tight">System Configuration</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              Platform Controls
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Global environment parameters, self-registration controls, and AI gateway runtime monitoring.
          </p>
        </div>

        <button
          onClick={loadConfig}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-purple-400' : ''} />
          <span>Reload Config</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>Platform configuration updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold flex items-center space-x-2">
          <AlertTriangle size={16} className="text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Operational Toggles Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
            <Sliders size={18} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">Platform Operation Switches</h3>
          </div>

          <div className="space-y-4">
            {/* Self Registration Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">Tenant Self-Registration</span>
                <p className="text-[11px] text-slate-400">
                  Allow new business owners to register accounts directly via the landing page
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowSelfRegistration}
                  onChange={(e) => setAllowSelfRegistration(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
              </label>
            </div>

            {/* Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">Platform Maintenance Mode</span>
                <p className="text-[11px] text-slate-400">
                  Pause customer transactions and restrict non-admin access during database maintenance
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Global Defaults Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
            <Globe size={18} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Default Regional & Security Presets</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Default Currency</label>
              <input
                type="text"
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                placeholder="INR"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-purple-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Default Timezone</label>
              <input
                type="text"
                value={defaultTimezone}
                onChange={(e) => setDefaultTimezone(e.target.value)}
                placeholder="UTC"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Session Expiry (Minutes)</label>
              <input
                type="number"
                value={sessionTimeoutMinutes}
                onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
                min={15}
                max={10080}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* AI Gateway & Runtime Health (Read-Only Telemetry) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
            <Zap size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white">Platform Runtime & AI Providers</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] block">Active AI Provider</span>
              <span className="font-extrabold text-purple-300">
                {config?.activeAiProvider || 'BizFlow Intelligent Advisor'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] block">Runtime Environment</span>
              <span className="font-extrabold text-white">{config?.environment || 'Spring Boot 3.3.4 (Dev)'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] block">Available Fallback Chains</span>
              <span className="font-semibold text-slate-300">
                {config?.availableAiProviders?.join(' → ') || 'Gemini → Groq → OpenRouter → Rule Engine'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] block">Server Synchronized Time</span>
              <span className="font-mono text-slate-300">
                {config?.serverTime ? new Date(config.serverTime).toUTCString() : 'Syncing...'}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Save size={16} />
            <span>{saving ? 'Applying System Config...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
