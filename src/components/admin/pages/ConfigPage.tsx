'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Settings, 
  Save, 
  Shield, 
  Globe, 
  Mail, 
  DollarSign, 
  Map, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { getConfig, updateConfig, handleApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Config } from '@/types/user';

export default function ConfigPage() {
  const { token } = useAuth();
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!token) return;
      try {
        const data = await getConfig(token);
        setConfig(data);
      } catch (error) {
        console.error(handleApiError(error));
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [token]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !config) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateConfig(token, config);
      setMessage({ type: 'success', text: 'System configuration updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: handleApiError(error) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 font-medium animate-pulse">Loading system configuration...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto transition-colors">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          System Configuration
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Global parameters for platform operation and financial rules.</p>
      </div>

      {message && (
        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Financial Settings */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Financial Rules
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2">Platform Commission (%)</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                  <input
                    type="number"
                    value={config?.commissionRate || 0}
                    onChange={(e) => setConfig(prev => prev ? {...prev, commissionRate: parseFloat(e.target.value)} : null)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-blue-600 rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Service Settings */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Map className="w-4 h-4" /> Service Limits
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2">Max Ride Distance (KM)</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">KM</span>
                  <input
                    type="number"
                    value={config?.maxRideDistance || 0}
                    onChange={(e) => setConfig(prev => prev ? {...prev, maxRideDistance: parseFloat(e.target.value)} : null)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-blue-600 rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Support Settings */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 md:col-span-2 transition-colors">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Mail className="w-4 h-4" /> Support & Communication
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2">Support Email Address</label>
                <div className="relative group">
                  <Mail className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="email"
                    value={config?.supportEmail || ''}
                    onChange={(e) => setConfig(prev => prev ? {...prev, supportEmail: e.target.value} : null)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-blue-600 rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white"
                    placeholder="support@georide.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2">System Status</label>
                <div className="flex items-center gap-4 h-[60px] px-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Platform Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {saving ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            Save System Changes
          </button>
        </div>
      </form>
    </div>
  );
}
