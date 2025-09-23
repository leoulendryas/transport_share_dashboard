'use client';

import { useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Flag, User, Car, Calendar, Check, X, Eye, Filter } from 'lucide-react';

interface ReportsPageProps {
  loading?: boolean;
}

// Mock data - replace with actual API calls
const mockReports = [
  {
    id: 1,
    reporter: { name: 'John Doe', email: 'john@example.com' },
    reportedUser: { name: 'Jane Smith', email: 'jane@example.com' },
    ride: { id: 123, from: 'Addis Ababa', to: 'Dire Dawa' },
    reason: 'Inappropriate behavior',
    description: 'User was making other passengers uncomfortable during the ride.',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    reporter: { name: 'Mike Johnson', email: 'mike@example.com' },
    reportedUser: { name: 'Sarah Wilson', email: 'sarah@example.com' },
    ride: { id: 124, from: 'Addis Ababa', to: 'Bahir Dar' },
    reason: 'No-show',
    description: 'Driver did not show up at the meeting point.',
    status: 'resolved',
    createdAt: '2024-01-14T14:20:00Z'
  }
];

export default function ReportsPage({ loading = false }: ReportsPageProps) {
  const [reports] = useState(mockReports);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const filteredReports = reports.filter(report => 
    filter === 'all' || report.status === filter
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports Management</h2>
          <p className="text-gray-600">Review and resolve user reports</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Reports</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
          <div className="text-sm text-gray-500">
            {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Flag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter !== 'all' ? `No ${filter} reports at the moment.` : 'No reports in the system.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Report Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Flag className={`h-6 w-6 ${
                        report.status === 'pending' ? 'text-yellow-600' : 'text-green-600'
                      }`} />
                      <h3 className="text-lg font-semibold text-gray-900">Report #{report.id}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {report.status === 'pending' ? 'PENDING' : 'RESOLVED'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Reporter</div>
                      <div className="text-sm text-gray-900">{report.reporter.name}</div>
                      <div className="text-sm text-gray-500">{report.reporter.email}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Reported User</div>
                      <div className="text-sm text-gray-900">{report.reportedUser.name}</div>
                      <div className="text-sm text-gray-500">{report.reportedUser.email}</div>
                    </div>
                    
                    {report.ride && (
                      <>
                        <div>
                          <div className="text-sm font-medium text-gray-700">Ride</div>
                          <div className="text-sm text-gray-900">#{report.ride.id}</div>
                          <div className="text-sm text-gray-500">
                            {report.ride.from} → {report.ride.to}
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700">Reason</div>
                      <div className="text-sm text-gray-900">{report.reason}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700">Description</div>
                    <div className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded-lg">
                      {report.description}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {report.status === 'pending' && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSelectedReport({ ...report, action: 'resolve' })}
                      className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </button>
                    
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedReport.action === 'resolve' ? 'Resolve Report' : 'Report Details'}
            </h3>
            
            {selectedReport.action === 'resolve' ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to mark this report as resolved?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle resolve action
                      setSelectedReport(null);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark Resolved
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Reporter:</span> {selectedReport.reporter.name}
                  </div>
                  <div>
                    <span className="font-medium">Reported User:</span> {selectedReport.reportedUser.name}
                  </div>
                  <div>
                    <span className="font-medium">Reason:</span> {selectedReport.reason}
                  </div>
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="mt-1 p-2 bg-gray-50 rounded">{selectedReport.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}