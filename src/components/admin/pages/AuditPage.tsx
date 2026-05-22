// src/components/admin/pages/AuditPage.tsx
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Activity, Search, Filter, Calendar, User, Shield, Terminal } from 'lucide-react';
import { auditApi } from '@/lib/api/audit';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';

export default function AuditPage() {
  const { admin } = useAuth();
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [targetType, setTargetType] = useState('');

  const { data, isLoading } = useSWR(
    admin ? ['audit-logs', page, action, targetType] : null,
    () => auditApi.list({ 
      page, 
      action: action || undefined, 
      target_type: targetType || undefined 
    })
  );

  const logs = data?.results || [];

  const columns = [
    {
      header: 'Action / Protocol',
      accessor: (log: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
            <Terminal className="w-4 h-4 text-zinc-500" />
          </div>
          <div>
            <p className="font-black text-zinc-900 dark:text-white text-[10px] uppercase tracking-widest leading-tight">
              {log.action.replace(/_/g, ' ')}
            </p>
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter mt-0.5">
              TARGET: {log.target_type} (ID: {log.target_id})
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Administrator',
      accessor: (log: any) => (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center">
            <User className="w-3 h-3 text-white dark:text-zinc-950" />
          </div>
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
            {log.admin_name || log.admin_email || 'SYSTEM'}
          </span>
        </div>
      )
    },
    {
      header: 'Metadata / Intelligence',
      accessor: (log: any) => (
        <div className="max-w-xs overflow-hidden">
          <pre className="text-[9px] font-mono text-zinc-400 truncate">
            {JSON.stringify(log.details || log.metadata)}
          </pre>
        </div>
      )
    },
    {
      header: 'Timestamp',
      accessor: (log: any) => (
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-black tabular-nums uppercase tracking-widest">
          <Calendar className="w-3 h-3" />
          {new Date(log.created_at).toLocaleString()}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Filter by action..."
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all"
          />
        </div>

        <select
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
          className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none cursor-pointer"
        >
          <option value="">All Target Types</option>
          <option value="user">User</option>
          <option value="ride">Ride</option>
          <option value="payment">Payment</option>
          <option value="company">Company</option>
          <option value="system">System</option>
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex items-center gap-3">
          <div className="p-2 bg-zinc-950 text-white rounded-lg">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Global Audit Trail</h3>
            <p className="text-xs text-zinc-500">Immutable record of all administrative actions performed on the platform.</p>
          </div>
        </div>

        <DataTable 
          data={logs} 
          columns={columns} 
          loading={isLoading}
          emptyMessage="No audit logs recorded."
        />
      </div>
    </div>
  );
}
