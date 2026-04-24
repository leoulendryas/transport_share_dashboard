'use client';

import { useState, useEffect } from 'react';
import { Report } from '@/types/user';
import { 
  AlertTriangle, 
  Check, 
  Eye, 
  ShieldAlert, 
  MessageSquare,
  User as UserIcon,
  Calendar,
  RefreshCw,
  Mail,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Activity,
  ArrowRight
} from 'lucide-react';
import { getReports, resolveReport } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ReportsPage() {
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchReports = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getReports(token, currentPage, 10, filter === 'all' ? undefined : filter);
      setReports(data.results);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token, currentPage, filter]);

  const handleResolve = async (id: number, status: 'resolved' | 'dismissed') => {
    if (!token) return;
    const notes = window.prompt(`Provide administrative notes for ${status} status:`) || '';
    if (notes === null) return;

    setIsActionLoading(true);
    try {
      await resolveReport(token, id, status, notes);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      alert('Failed to resolve report');
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Report Node',
      accessor: (r: Report) => (
        <div className="flex flex-col">
          <span className="font-black text-zinc-950 dark:text-white uppercase tracking-tighter">REP_{r.id}</span>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{new Date(r.created_at).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      header: 'Incident Target',
      accessor: (r: Report) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center border border-rose-100 dark:border-rose-900/50">
            <UserIcon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{r.reported_name || `NODE_${r.reported_user_id}`}</span>
            <span className="text-[10px] text-zinc-500 font-medium">{r.reported_email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Breach Protocol',
      accessor: (r: Report) => (
        <div className="flex flex-col max-w-[200px]">
          <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight truncate">{r.reason}</span>
          <span className="text-[10px] text-zinc-500 truncate">{r.description}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (r: Report) => (
        <Badge variant={r.status === 'pending' ? 'warning' : r.status === 'resolved' ? 'success' : 'zinc'}>
          {r.status}
        </Badge>
      )
    },
    {
      header: '',
      accessor: (r: Report) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setSelectedReport(r)} className="h-8 w-8 p-0 rounded-lg">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="p-8 space-y-8 bg-white dark:bg-zinc-950 min-h-full">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div>
           <h2 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">Security Intelligence</h2>
           <p className="text-xs text-zinc-500 font-medium mt-0.5">Processing {total} protocol breach reports across all nodes.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value as any); setCurrentPage(1); }}
            className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all cursor-pointer dark:text-zinc-200"
          >
            <option value="all">Full Log</option>
            <option value="pending">Pending Triage</option>
            <option value="resolved">Neutralized</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <Button variant="secondary" size="md" onClick={fetchReports} className="rounded-xl h-11">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={reports} 
        loading={loading}
        onRowClick={(r) => setSelectedReport(r)}
        emptyMessage="Security perimeter secure. No reports found."
      />

      {Math.ceil(total / 10) > 1 && (
        <div className="flex justify-center gap-1.5 pt-6">
          {Array.from({ length: Math.ceil(total / 10) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`min-w-[36px] h-9 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                page === currentPage
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-lg'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      <Drawer
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Incident Forensics"
      >
        {selectedReport && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase">REP_{selectedReport.id}</h3>
                <div className="flex items-center gap-2">
                   <Badge variant={selectedReport.status === 'pending' ? 'warning' : 'success'}>
                     {selectedReport.status.toUpperCase()}
                   </Badge>
                   <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-tighter tabular-nums">LOG_{new Date(selectedReport.created_at).getTime()}</span>
                </div>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                 <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
            </div>

            <div className="space-y-6">
               <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6">
                  <div className="flex items-start gap-4">
                     <ShieldAlert className="w-4 h-4 text-rose-500 mt-1" />
                     <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Breach Reason</p>
                        <p className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-tight">{selectedReport.reason}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <FileText className="w-4 h-4 text-zinc-400 mt-1" />
                     <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Incident Description</p>
                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed italic">"{selectedReport.description || 'No detailed evidence provided.'}"</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-[11px] font-black text-zinc-400 border border-zinc-100 dark:border-zinc-700">
                        IN
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Reported Node (Target)</p>
                        <p className="text-xs font-bold text-zinc-950 dark:text-white">{selectedReport.reported_name} <span className="text-zinc-400 font-mono ml-2">ID_{selectedReport.reported_user_id}</span></p>
                        <p className="text-[10px] text-zinc-500 font-medium">{selectedReport.reported_email}</p>
                     </div>
                  </div>
                  <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-[11px] font-black text-zinc-400 border border-zinc-100 dark:border-zinc-700">
                        OUT
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Reporter Node (Source)</p>
                        <p className="text-xs font-bold text-zinc-950 dark:text-white">{selectedReport.reporter_name} <span className="text-zinc-400 font-mono ml-2">ID_{selectedReport.reporter_id}</span></p>
                        <p className="text-[10px] text-zinc-500 font-medium">{selectedReport.reporter_email}</p>
                     </div>
                  </div>
               </div>

               {selectedReport.ride_id && (
                  <div className="p-6 bg-zinc-950 dark:bg-white rounded-2xl flex items-center justify-between shadow-2xl">
                     <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/10 dark:bg-zinc-100 rounded-xl">
                           <Activity className="w-5 h-5 text-white dark:text-zinc-950" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-white/40 dark:text-zinc-400 uppercase tracking-widest">Linked Trajectory</p>
                           <p className="text-sm font-black text-white dark:text-zinc-950 uppercase tracking-tighter">RIDE_{selectedReport.ride_id}</p>
                        </div>
                     </div>
                     <ArrowRight className="w-5 h-5 text-white/20 dark:text-zinc-300" />
                  </div>
               )}

               {selectedReport.status !== 'pending' ? (
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl space-y-4">
                     <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <div>
                           <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Resolution Protocol Finished</p>
                           <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Resolved at {new Date(selectedReport.resolved_at || Date.now()).toLocaleString()}</p>
                        </div>
                     </div>
                     {selectedReport.admin_notes && (
                        <div className="pt-4 border-t border-emerald-100 dark:border-emerald-900/50">
                           <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">Administrative Notes</p>
                           <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200 leading-relaxed italic">"{selectedReport.admin_notes}"</p>
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="grid grid-cols-2 gap-3 pt-4">
                     <Button
                        onClick={() => handleResolve(selectedReport.id, 'resolved')}
                        className="h-14 rounded-2xl shadow-xl shadow-zinc-200 dark:shadow-none text-[10px] font-black uppercase tracking-[0.2em]"
                     >
                        <UserCheck className="w-5 h-5 mr-2" /> Sanction Node
                     </Button>
                     <Button
                        variant="secondary"
                        onClick={() => handleResolve(selectedReport.id, 'dismissed')}
                        className="h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-[0.2em]"
                     >
                        <XCircle className="w-5 h-5 mr-2" /> Dismiss
                     </Button>
                  </div>
               )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
