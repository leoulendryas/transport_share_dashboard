'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Settings, Save, Percent, MapPin, Shield, Zap, Globe, Bell } from 'lucide-react';
import { getConfig, updateConfig } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function ConfigPage() {
  const { token } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    getConfig(token)
      .then(setConfig)
      .catch(err => console.error('Failed to load config', err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setIsSaving(true);
    try {
      await updateConfig(token, config);
      alert('System configuration updated successfully.');
    } catch (error) {
      alert('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <LoadingSpinner />
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Loading System Variables</span>
      </div>
    );
  }

  const sections = [
    {
      title: 'Financial Settings',
      icon: Percent,
      description: 'Configure commission rates and payment thresholds.',
      fields: [
        { label: 'Platform Commission (%)', key: 'commissionRate', type: 'number', icon: Percent },
        { label: 'Minimum Payout (ETB)', key: 'minPayout', type: 'number', icon: Zap },
      ]
    },
    {
      title: 'Ride Logistics',
      icon: MapPin,
      description: 'Control radius and distance constraints for rides.',
      fields: [
        { label: 'Max Ride Distance (KM)', key: 'maxRideDistance', type: 'number', icon: Globe },
        { label: 'Driver Search Radius (KM)', key: 'searchRadius', type: 'number', icon: MapPin },
      ]
    },
    {
      title: 'Security & Trust',
      icon: Shield,
      description: 'Global safety and verification parameters.',
      fields: [
        { label: 'Auto-Ban Threshold (Reports)', key: 'autoBanThreshold', type: 'number', icon: Shield },
        { label: 'SOS Response Window (Mins)', key: 'sosWindow', type: 'number', icon: Bell },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <form onSubmit={handleSave} className="space-y-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">System Configuration</h2>
            <p className="text-sm text-zinc-500">Fine-tune platform behavior and global variables.</p>
          </div>
          <Button type="submit" loading={isSaving} className="shadow-lg shadow-zinc-200 dark:shadow-none">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <section.icon className="w-4 h-4 text-zinc-900 dark:text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{section.title}</h3>
                    <p className="text-xs text-zinc-500">{section.description}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields.map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                      {field.label}
                    </label>
                    <div className="relative group">
                      <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors" />
                      <input 
                        type={field.type} 
                        value={config?.[field.key] || ''} 
                        onChange={e => setConfig({
                          ...config, 
                          [field.key]: field.type === 'number' ? parseFloat(e.target.value) : e.target.value
                        })} 
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
