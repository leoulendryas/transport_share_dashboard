'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Flag, User, Car, Calendar, Check, X, Eye, Filter, AlertTriangle, ShieldAlert } from 'lucide-react';
import { getReports, resolveReport, handleApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Report } from '@/types/user';

interface ReportsPageProps {
  loading?: boolean;
}

export default function ReportsPage({ loading: externalLoading = false }: ReportsPageProps) {
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const fetchReports = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getReports(token, 1, 50, filter === 'resolved');
      setReports(data.results || []);
    } catch (error) {
      console.error(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token, filter]);

  const handleResolve = async (reportId: number) => {
    if (!token) return;
    setIsResolving(true);
    try {
      await resolveReport(token, reportId);
      await fetchReports();
      setSelectedReport(null);
    } catch (error) {
      alert(handleApiError(error));
    } finally {
      setIsResolving(false);
    }
  };

  if (isLoading || externalLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 font-medium animate-pulse">Scanning reports...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer shadow-sm"
            >
              <option value="all">All Incidents</option>
              <option value="pending">Pending Review</option>
              <option value="resolved">Resolved Cases</option>
            </select>
          </div>
          <div className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-black uppercase tracking-widest border border-rose-100">
            {reports.length} Active Alerts
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-[2rem] border border-dashed border-slate-200">
            <ShieldAlert className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-lg font-medium">Clear Skies!</p>
            <p className="text-sm">No reports matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {reports.map((report) => (
              <div 
                key={report.id} 
                className="bg-white rounded-[2rem] border border-slate-100 p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">Case #{report.id}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(report.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    report.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {report.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reporter</p>
                    <p className="text-sm font-bold text-slate-700">{report.reporter_email || 'System'}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accused</p>
                    <p className="text-sm font-bold text-slate-700">{report.reported_email || 'Unknown'}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reason for Report</p>
                    <p className="text-sm font-bold text-rose-600 italic">"{report.reason}"</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed font-medium line-clamp-2">
                      {report.description || 'No additional details provided by the reporter.'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-slate-50 text-slate-900 rounded-xl font-bold transition-all border border-slate-200"
                  >
                    <Eye className="w-5 h-5" /> View Full Case
                  </button>
                  {report.status === 'pending' && (
                    <button
                      onClick={() => handleResolve(report.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                    >
                      <Check className="w-5 h-5" /> Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Case Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 bg-rose-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
                <h3 className="text-xl font-bold text-slate-900">Case Investigation</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center transition-colors">✕</button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                 <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Incident Report</p>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    {selectedReport.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incident Date</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(selectedReport.created_at).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Status</p>
                    <p className="text-sm font-bold text-rose-600 uppercase">{selectedReport.status}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                {selectedReport.status === 'pending' && (
                  <button
                    disabled={isResolving}
                    onClick={() => handleResolve(selectedReport.id)}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-900/20 hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    {isResolving ? 'Processing...' : 'Close & Resolve Case'}
                  </button>
                )}
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
