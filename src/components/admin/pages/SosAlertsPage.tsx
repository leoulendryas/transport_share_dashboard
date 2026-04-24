'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Bell, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertTriangle,
  X,
  MessageSquare,
  ArrowRight,
  Eye,
  Calendar
} from 'lucide-react';
import { getSosAlerts, resolveSos } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { SOSAlert } from '@/types/user';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function SosAlertsPage() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    fetchAlerts();
  }, [token]);

  const handleResolve = async () => {
    if (!token || !selectedAlert) return;
    setIsSubmitting(true);
    try {
      await resolveSos(token, selectedAlert.id, adminNotes);
      setIsResolving(false);
      setSelectedAlert(null);
      setAdminNotes('');
      fetchAlerts();
    } catch (error) {
      alert('Failed to resolve alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Alert',
      accessor: (a: SOSAlert) => (
        <div className="flex flex-col">
          <span className="font-black text-zinc-950 dark:text-white uppercase tracking-tight">#{a.id}</span>
          <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" /> {new Date(a.created_at).toLocaleString()}
          </span>
        </div>
      )
    },
    {
      header: 'User',
      accessor: (a: SOSAlert) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            {a.first_name?.[0] || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{a.first_name} {a.last_name}</span>
            <span className="text-[10px] text-red-500 font-black tracking-tight">{a.phone_number}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Route',
      accessor: (a: SOSAlert) => (
        <div className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 max-w-[200px]">
          <span className="truncate">{a.from_address}</span>
          <ArrowRight className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{a.to_address}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (a: SOSAlert) => (
        <Badge variant={a.status === 'active' ? 'error' : 'zinc'}>
          {a.status}
        </Badge>
      )
    },
    {
      header: '',
      accessor: (a: SOSAlert) => (
        <div className="flex justify-end gap-2">
          {a.status === 'active' && (
            <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedAlert(a); setIsResolving(true); }}>
              Resolve
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSelectedAlert(a)}>
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  const activeAlerts = alerts.filter(a => a.status === 'active');

  return (
    <div className="p-8 space-y-8 bg-white dark:bg-zinc-950 min-h-full">
      {activeAlerts.length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Active Emergency</h2>
              <p className="text-xs font-bold text-rose-500">{activeAlerts.length} users currently require immediate assistance</p>
            </div>
          </div>
        </div>
      )}

      <DataTable 
        columns={columns} 
        data={alerts} 
        loading={loading}
        onRowClick={(a) => setSelectedAlert(a)}
        emptyMessage="No SOS alerts reported"
      />

      <Drawer
        isOpen={!!selectedAlert && !isResolving}
        onClose={() => setSelectedAlert(null)}
        title="SOS Alert Details"
      >
        {selectedAlert && (
          <div className="space-y-8">
            <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${
              selectedAlert.status === 'active' ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                selectedAlert.status === 'active' ? 'bg-rose-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
              }`}>
                <AlertTriangle className="w-7 h-7" />
              </div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Status</p>
              <Badge variant={selectedAlert.status === 'active' ? 'error' : 'zinc'}>
                {selectedAlert.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">User</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{selectedAlert.first_name} {selectedAlert.last_name}</p>
                <p className="text-[10px] text-red-500 font-black mt-1 tracking-tight">{selectedAlert.phone_number}</p>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Location</p>
                <p className="text-[10px] font-mono font-bold text-zinc-900 dark:text-zinc-100">LAT: {selectedAlert.latitude.toFixed(6)}</p>
                <p className="text-[10px] font-mono font-bold text-zinc-900 dark:text-zinc-100">LNG: {selectedAlert.longitude.toFixed(6)}</p>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Active Ride Route
              </h4>
              <div className="relative pl-4 space-y-4 before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-200 dark:before:bg-zinc-800">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">From</p>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{selectedAlert.from_address || 'Unknown address'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">To</p>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{selectedAlert.to_address || 'Unknown address'}</p>
                </div>
              </div>
            </div>

            {selectedAlert.status === 'active' && (
              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900">
                <Button 
                  onClick={() => setIsResolving(true)}
                  className="w-full"
                >
                  Mark as Resolved
                </Button>
              </div>
            )}

            {selectedAlert.admin_notes && (
              <div className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-900">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Admin Resolution Notes</p>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                    "{selectedAlert.admin_notes}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Modal
        isOpen={isResolving}
        onClose={() => setIsResolving(false)}
        title="Resolve SOS Alert"
      >
        <div className="space-y-6">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Emergency Case</p>
             <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">SOS Alert #{selectedAlert?.id}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Resolution Notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Provide details on how the emergency was handled..."
              className="w-full h-32 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-zinc-500 transition-all dark:text-zinc-200"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsResolving(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              disabled={isSubmitting}
              onClick={handleResolve}
              className="flex-1"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Confirm Resolution'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
