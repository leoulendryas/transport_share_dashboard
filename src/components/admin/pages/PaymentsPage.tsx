'use client';

import { Payment } from '@/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DollarSign, Check, Clock, Download, AlertCircle, ArrowRight } from 'lucide-react';

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

  // Derived stats based on the data passed in
  const totalVolume = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const completedVolume = payments
    .filter(p => p.status === 'completed' || p.status === 'released_to_driver')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24">
        <LoadingSpinner size="lg" />
        <span className="mt-4 text-gray-600 font-medium">Updating transaction records...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments Management</h2>
          <p className="text-gray-600">Track and authorize driver payouts</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          >
            <option value="all">All Transactions</option>
            <option value="pending">Pending (Escrow)</option>
            <option value="completed">Completed (Paid)</option>
            <option value="released_to_driver">Released to Driver</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-shadow">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg"><DollarSign className="h-6 w-6 text-blue-600" /></div>
            <div className="ml-4">
              <p className="text-xs font-bold text-gray-500 uppercase">Filtered Volume</p>
              <p className="text-2xl font-bold text-gray-900">ETB {totalVolume.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg"><Check className="h-6 w-6 text-green-600" /></div>
            <div className="ml-4">
              <p className="text-xs font-bold text-gray-500 uppercase">Settled</p>
              <p className="text-2xl font-bold text-gray-900">ETB {completedVolume.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-50 rounded-lg"><Clock className="h-6 w-6 text-yellow-600" /></div>
            <div className="ml-4">
              <p className="text-xs font-bold text-gray-500 uppercase">In Escrow</p>
              <p className="text-2xl font-bold text-gray-900">ETB {(totalVolume - completedVolume).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {payments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No payment records found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Ride ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Created At</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 uppercase">
                      #{payment.payment_reference || payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Ride #{payment.ride_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      ETB {Number(payment.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                        payment.status === 'released_to_driver' ? 'bg-blue-100 text-blue-700' :
                        payment.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {payment.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {payment.status === 'completed' ? (
                        <button
                          onClick={() => onRelease(payment.ride_id)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Release Payout
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No Action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="text-sm font-medium text-gray-600 disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500 font-bold uppercase">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="text-sm font-medium text-gray-600 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
