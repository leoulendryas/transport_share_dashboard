'use client';

import { Payment } from '@/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DollarSign, Check, Clock, Download, AlertCircle, ArrowRight, TrendingUp, CreditCard, ExternalLink, Wallet } from 'lucide-react';

interface PaymentsPageProps {
  payments: Payment[];
  total: number;
  currentPage: number;
  filter: string;
  onFilterChange: (filter: any) => void;
  onRelease: (rideId: number) => void;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function PaymentsPage({
  payments,
  total,
  currentPage,
  filter,
  onFilterChange,
  onRelease,
  onPageChange,
  loading = false
}: PaymentsPageProps) {
  
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const totalVolume = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const completedVolume = payments
    .filter(p => p.status === 'completed' || p.status === 'released_to_driver')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 font-medium animate-pulse">Syncing ledger...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/30 dark:bg-slate-950/30 transition-colors">
      <div className="p-8 space-y-8">
        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Volume</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalVolume.toLocaleString()} <span className="text-xs font-bold text-slate-400">ETB</span></p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Settled Payouts</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{completedVolume.toLocaleString()} <span className="text-xs font-bold text-slate-400">ETB</span></p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">In Escrow</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{(totalVolume - completedVolume).toLocaleString()} <span className="text-xs font-bold text-slate-400">ETB</span></p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-50 dark:bg-amber-900/10 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
               <select
                value={filter}
                onChange={(e) => onFilterChange(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer shadow-sm"
              >
                <option value="all">All Transactions</option>
                <option value="pending">Pending Escrow</option>
                <option value="completed">Completed Paid</option>
                <option value="released_to_driver">Released to Driver</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Download className="w-4 h-4" /> Export Ledger
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <AlertCircle className="w-16 h-16 mb-4 opacity-10" />
              <p className="text-lg font-medium">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Transaction Ref</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Linked Ride</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Payout Amount</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase">#{payment.payment_reference || payment.id}</p>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{new Date(payment.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-600 dark:text-slate-400">
                        Ride <span className="text-blue-600 dark:text-blue-400">#{payment.ride_id}</span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{Number(payment.amount).toLocaleString()} <span className="text-[10px] text-slate-400">ETB</span></p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                          payment.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' :
                          payment.status === 'released_to_driver' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' :
                          payment.status === 'failed' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                        }`}>
                          {payment.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {payment.status === 'completed' ? (
                          <button
                            onClick={() => onRelease(payment.ride_id)}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.05] active:scale-[0.95]"
                          >
                            Release
                          </button>
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest italic">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                Page {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
