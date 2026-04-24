'use client';

import { useState, useEffect } from 'react';
import { Payment } from '@/types/user';
import { 
  Wallet, 
  Check, 
  Clock, 
  Download, 
  CreditCard,
  ExternalLink,
  RefreshCw,
  Navigation,
  Mail,
  Calendar,
  ShieldCheck,
  Zap,
  DollarSign,
  Hash
} from 'lucide-react';
import { getPayments, updatePaymentStatus } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const ITEMS_PER_PAGE = 10;

export default function PaymentsPage() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getPayments(
        token, 
        currentPage, 
        ITEMS_PER_PAGE, 
        filter === 'all' ? undefined : filter
      );
      setPayments(data.results || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [token, currentPage, filter]);

  const handleRelease = async (paymentId: number) => {
    if (!token || !window.confirm('Release funds to driver? This action initiates a financial transfer sequence.')) return;
    try {
      await updatePaymentStatus(token, paymentId, undefined, true);
      fetchPayments();
      setSelectedPayment(null);
    } catch (error) {
      alert('Failed to release payment');
    }
  };
  
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const totalVolume = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const completedVolume = payments
    .filter(p => p.status === 'success' || p.released_to_driver)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const columns = [
    {
      header: 'Protocol Ref',
      accessor: (p: Payment) => (
        <div className="flex flex-col">
           <span className="font-black uppercase tracking-tighter text-zinc-950 dark:text-white">#{p.payment_reference || `ID_${p.id}`}</span>
           <span className="text-[10px] text-zinc-400 font-mono font-black tabular-nums">{new Date(p.created_at).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      header: 'Target Ride',
      accessor: (p: Payment) => (
        <span className="text-zinc-500 font-black tabular-nums uppercase tracking-widest text-[10px]">RIDE_{p.ride_id}</span>
      )
    },
    {
      header: 'Asset Value',
      accessor: (p: Payment) => (
        <div className="flex items-center gap-1.5">
           <span className="font-black text-zinc-950 dark:text-white tabular-nums tracking-tighter">
             {Number(p.amount).toLocaleString()}
           </span>
           <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">ETB</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (p: Payment) => (
        <Badge variant={p.status === 'success' || p.released_to_driver ? 'success' : 'warning'}>
          {p.status.toUpperCase()}
        </Badge>
      )
    },
    {
      header: '',
      accessor: (p: Payment) => (
        <div className="flex justify-end gap-2">
          {p.status === 'success' && !p.released_to_driver && (
            <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); handleRelease(p.id); }} className="h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest">
              Authorize Release
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(p)} className="h-8 w-8 p-0 rounded-lg">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="p-8 space-y-8 bg-white dark:bg-zinc-950 min-h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Node Volume', value: totalVolume, icon: DollarSign },
          { label: 'Settled Capital', value: completedVolume, icon: ShieldCheck },
          { label: 'In Escrow Protocol', value: totalVolume - completedVolume, icon: Zap }
        ].map((item, i) => (
          <div key={i} className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm">
            <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white w-fit border border-zinc-200 dark:border-zinc-700 mb-6 shadow-sm">
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1.5">{item.label}</p>
              <h3 className="text-3xl font-black text-zinc-950 dark:text-white tracking-tighter tabular-nums">
                {item.value.toLocaleString()} <span className="text-xs font-black text-zinc-400 tracking-normal ml-1">ETB</span>
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value as any); setCurrentPage(1); }}
              className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all cursor-pointer dark:text-zinc-200"
            >
              <option value="all">Full Ledger</option>
              <option value="pending">Pending Auth</option>
              <option value="completed">Authorized Payouts</option>
            </select>
            <Button variant="secondary" size="md" onClick={fetchPayments} className="h-11 rounded-xl">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <Button variant="secondary" size="md" className="gap-2 h-11 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest w-full md:w-auto">
            <Download className="w-4 h-4" /> Export Ledger
          </Button>
        </div>

        <DataTable 
          columns={columns} 
          data={payments} 
          loading={loading}
          onRowClick={(p) => setSelectedPayment(p)}
          emptyMessage="Financial ledgers are empty."
        />
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 pt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title="Ledger Forensics"
      >
        {selectedPayment && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-8 bg-zinc-950 dark:bg-white rounded-[2rem] flex flex-col items-center justify-center text-center shadow-2xl">
              <p className="text-[10px] font-black text-white/40 dark:text-zinc-400 uppercase tracking-[0.3em] mb-3">Asset Value</p>
              <h3 className="text-4xl font-black text-white dark:text-zinc-950 tracking-tighter tabular-nums">
                {Number(selectedPayment.amount).toLocaleString()} <span className="text-sm font-black opacity-40 ml-1">ETB</span>
              </h3>
              <div className="mt-6">
                <Badge variant={selectedPayment.status === 'success' || selectedPayment.released_to_driver ? 'success' : 'warning'} className="h-6 px-3 text-[10px] font-black">
                  {selectedPayment.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="space-y-6">
               <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4 text-zinc-400" />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Protocol Ref</p>
                     </div>
                     <p className="text-xs font-black text-zinc-950 dark:text-white uppercase tabular-nums">#{selectedPayment.payment_reference || selectedPayment.id}</p>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Navigation className="w-4 h-4 text-zinc-400" />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Linked Ride</p>
                     </div>
                     <p className="text-xs font-black text-zinc-950 dark:text-white uppercase">RIDE_{selectedPayment.ride_id}</p>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Origin Date</p>
                     </div>
                     <p className="text-xs font-black text-zinc-950 dark:text-white uppercase tabular-nums">{new Date(selectedPayment.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-zinc-400" />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Node Comms</p>
                     </div>
                     <p className="text-xs font-bold text-zinc-950 dark:text-white">{selectedPayment.user_email || 'VOID'}</p>
                  </div>
               </div>

               {selectedPayment.from_address && (
                  <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 space-y-4">
                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Trajectory Data</p>
                     <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                        <p className="text-[11px] font-medium text-zinc-500 truncate">{selectedPayment.from_address}</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 dark:bg-white" />
                        <p className="text-[11px] font-black text-zinc-950 dark:text-white truncate">{selectedPayment.to_address}</p>
                     </div>
                  </div>
               )}

               {selectedPayment.released_at ? (
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-[2rem] flex items-center gap-4">
                     <div className="p-2 bg-emerald-500 rounded-xl">
                        <ShieldCheck className="w-5 h-5 text-white" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Capital Released</p>
                        <p className="text-xs font-black text-emerald-700 dark:text-emerald-300 tabular-nums uppercase">{new Date(selectedPayment.released_at).toLocaleString()}</p>
                     </div>
                  </div>
               ) : selectedPayment.status === 'success' && (
                  <div className="pt-4 pb-10">
                    <Button 
                      onClick={() => handleRelease(selectedPayment.id)}
                      className="w-full h-14 rounded-2xl shadow-2xl shadow-zinc-200 dark:shadow-none text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                      Authorize Final Transfer
                    </Button>
                    <p className="text-[10px] text-zinc-400 text-center mt-4 font-bold uppercase tracking-widest px-10 leading-relaxed">
                      Final authorization initiates immutable capital release to commander.
                    </p>
                  </div>
               )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
