'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Bell, ShieldAlert, Clock, MapPin, User, Phone, Eye, Check } from 'lucide-react';
import { getSosAlerts } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function SosAlertsPage() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await getSosAlerts(token);
        setAlerts(data || []);
      } catch (error) {
        console.error('Failed to fetch SOS alerts');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 font-medium animate-pulse">Scanning live alerts...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Active SOS Alerts</h3>
          <p className="text-slate-500 font-medium">Monitoring system is active and clear.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-[2rem] border-2 border-rose-100 shadow-xl shadow-rose-900/5 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <div className="w-3 h-3 bg-rose-600 rounded-full animate-ping" />
              </div>
              
              <div className="flex items-start gap-6 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-900/20">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tighter">Emergency Signal</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-wider">High Priority</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(alert.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distress From</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-300" />
                      <p className="text-sm font-bold text-slate-700 truncate">{alert.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</p>
                    <div className="flex items-center justify-end gap-2 text-rose-600">
                      <Phone className="w-4 h-4" />
                      <p className="text-sm font-black">{alert.phone_number}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                   <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ride Route</p>
                      <p className="text-xs font-bold text-slate-700">{alert.from_address} <span className="mx-2 text-slate-300">→</span> {alert.to_address}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2">
                    <Eye className="w-5 h-5" /> Live Map
                  </button>
                  <button className="flex-1 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50">
                    <Check className="w-5 h-5" /> Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
