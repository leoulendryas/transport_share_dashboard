'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  AlertTriangle, 
  Check, 
  Eye, 
  ShieldAlert, 
  MessageSquare,
  User as UserIcon,
  Calendar
} from 'lucide-react';
import { getReports, resolveReport } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Report } from '@/types/user';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';

export default function ReportsPage() {
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [token, filter]);

  const fetchReports = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getReports(token, 1, 50, filter === 'all' ? undefined : filter);
      setReports(data.results || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (reportId: number) => {
    if (!token) return;
    const notes = window.prompt('Resolution notes:');
    if (notes === null) return;

    setIsActionLoading(true);
    try {
      await resolveReport(token, reportId, 'resolved', notes);
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
      header: 'Case',
      accessor: (r: Report) => (
        <div className="flex flex-col">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">#{r.id}</span>
          <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" /> {new Date(r.created_at).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      header: 'Reason',
      accessor: (r: Report) => (
        <span className="text-zinc-600 dark:text-zinc-400 font-medium truncate max-w-[200px] block">
          {r.reason}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (r: Report) => (
        <Badge variant={r.status === 'resolved' ? 'success' : r.status === 'pending' ? 'error' : 'zinc'}>
          {r.status}
        </Badge>
      )
    },
    {
      header: '',
      accessor: (r: Report) => (
        <div className="flex justify-end gap-2">
          {r.status === 'pending' && (
            <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); handleResolve(r.id); }}>
              Resolve
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSelectedReport(r)}>
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="p-8 space-y-6 bg-white dark:bg-zinc-950 min-h-full">
      <div className="flex justify-between items-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-zinc-500 transition-all dark:text-zinc-200"
        >
          <option value="all">All Incidents</option>
          <option value="pending">Pending Only</option>
          <option value="resolved">Resolved Only</option>
        </select>
        <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-zinc-200 dark:border-zinc-800">
          {reports.length} Reports
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={reports} 
        loading={isLoading}
        onRowClick={(r) => setSelectedReport(r)}
        emptyMessage="No reports found"
      />

      <Drawer
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Report Details"
      >
        {selectedReport && (
          <div className="space-y-8">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start gap-4">
              <div className="p-2 bg-rose-500 text-white rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Issue Reported</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed">{selectedReport.reason}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Reporter</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{selectedReport.reporter_name || 'Anonymous'}</p>
                <p className="text-[10px] text-zinc-500 mt-1">{selectedReport.reporter_email || 'No email'}</p>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Reported User</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{selectedReport.reported_name || 'Unknown'}</p>
                <p className="text-[10px] text-zinc-500 mt-1">{selectedReport.reported_email || 'No email'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" /> Description
              </p>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                  {selectedReport.description || "No description provided."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Case ID</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">#{selectedReport.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Created At</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">{new Date(selectedReport.created_at).toLocaleString()}</p>
              </div>
            </div>

            {selectedReport.admin_notes && (
              <div className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-900">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Admin Resolution Notes</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl">
                  {selectedReport.admin_notes}
                </p>
              </div>
            )}

            {selectedReport.status === 'pending' && (
              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900">
                <Button 
                  onClick={() => handleResolve(selectedReport.id)}
                  disabled={isActionLoading}
                  className="w-full"
                >
                  Mark as Resolved
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
