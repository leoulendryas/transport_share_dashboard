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
  RefreshCw
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
      setPayments(data.results);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [token, currentPage, filter]);

  const handleRelease = async (paymentId: number) => {
    if (!token || !window.confirm('Release funds to driver?')) return;
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
    .filter(p => p.status === 'completed' || p.status === 'released_to_driver')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const columns = [
    {
      header: 'Reference',
      accessor: (p: Payment) => (
        <span className="font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
          #{p.payment_reference || p.id}
        </span>
      )
    },
    {
      header: 'Ride',
      accessor: (p: Payment) => (
        <span className="text-zinc-500 font-medium">#{p.ride_id}</span>
      )
    },
    {
      header: 'Amount',
      accessor: (p: Payment) => (
        <span className="font-black text-zinc-900 dark:text-zinc-100">
          {Number(p.amount).toLocaleString()} <span className="text-[10px] text-zinc-400">ETB</span>
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (p: Payment) => (
        <Badge variant={p.status === 'completed' || p.status === 'released_to_driver' ? 'success' : 'warning'}>
          {p.status.replace(/_/g, ' ')}
        </Badge>
      )
    },
    {
      header: '',
      accessor: (p: Payment) => (
        <div className="flex justify-end gap-2">
          {p.status === 'completed' && !p.released_to_driver && (
            <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); handleRelease(p.id); }}>
              Release
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(p)}>
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
          { label: 'Total Volume', value: totalVolume, icon: Wallet },
          { label: 'Settled Payouts', value: completedVolume, icon: Check },
          { label: 'In Escrow', value: totalVolume - completedVolume, icon: Clock }
        ].map((item, i) => (
          <div key={i} className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 w-fit border border-zinc-200 dark:border-zinc-700 mb-4">
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{item.label}</p>
              <h3 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                {item.value.toLocaleString()} <span className="text-xs font-bold text-zinc-400">ETB</span>
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value as any); setCurrentPage(1); }}
              className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-zinc-500 transition-all dark:text-zinc-200"
            >
              <option value="all">All Transactions</option>
              <option value="pending">Pending Escrow</option>
              <option value="completed">Completed Paid</option>
            </select>
            <Button variant="secondary" size="sm" onClick={fetchPayments}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <Button variant="secondary" size="sm" className="gap-2">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>

        <DataTable 
          columns={columns} 
          data={payments} 
          loading={loading}
          onRowClick={(p) => setSelectedPayment(p)}
          emptyMessage="No payments found"
        />
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                page === currentPage
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'
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
        title="Transaction Details"
      >
        {selectedPayment && (
          <div className="space-y-8">
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Amount</p>
              <h3 className="text-3xl font-black text-zinc-950 dark:text-white tracking-tight">
                {Number(selectedPayment.amount).toLocaleString()} <span className="text-sm font-bold text-zinc-400">ETB</span>
              </h3>
              <div className="mt-4">
                <Badge variant={selectedPayment.status === 'completed' || selectedPayment.status === 'released_to_driver' ? 'success' : 'warning'}>
                  {selectedPayment.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reference</p>
                <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase">#{selectedPayment.payment_reference || selectedPayment.id}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ride ID</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">#{selectedPayment.ride_id}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{new Date(selectedPayment.created_at).toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">User Email</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{selectedPayment.user_email || 'N/A'}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Payout released</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{selectedPayment.released_to_driver ? 'YES' : 'NO'}</p>
              </div>
            </div>

            {selectedPayment.status === 'completed' && !selectedPayment.released_to_driver && (
              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900">
                <Button 
                  onClick={() => handleRelease(selectedPayment.id)}
                  className="w-full"
                >
                  Release Funds to Driver
                </Button>
                <p className="text-[10px] text-zinc-400 text-center mt-3 font-medium px-4">
                  Once released, funds will be transferred to the driver's linked bank account. This action cannot be undone.
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
