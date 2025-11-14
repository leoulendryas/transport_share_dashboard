'use client';

import { useState } from 'react';
import { PendingVerification } from '@/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Check, X, Eye, User, Calendar, IdCard, Building, Mail, Phone } from 'lucide-react';

interface VerificationsPageProps {
  verifications: PendingVerification[];
  onVerify: (userId: number) => Promise<void>; // Removed reason parameter
  onReject: (userId: number) => Promise<void>; // Removed reason parameter
  loading?: boolean;
}

export default function VerificationsPage({ 
  verifications, 
  onVerify, 
  onReject, 
  loading = false 
}: VerificationsPageProps) {
  const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const handleVerify = (userId: number) => {
    if (window.confirm('Are you sure you want to approve this verification?')) {
      onVerify(userId);
    }
  };

  const handleReject = (userId: number) => {
    if (window.confirm('Are you sure you want to reject this verification?')) {
      onReject(userId);
      setSelectedVerification(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-black">Loading verifications...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black">ID Verifications</h2>
          <p className="text-black">Review and verify user identification documents</p>
        </div>
        <div className="text-sm text-black">
          {verifications.length} pending verification{verifications.length !== 1 ? 's' : ''}
        </div>
      </div>

      {verifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Check className="mx-auto h-12 w-12 text-green-400" />
          <h3 className="mt-2 text-sm font-medium text-black">All caught up!</h3>
          <p className="mt-1 text-sm text-black">No pending verifications at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {verifications.map((verification) => (
            <div key={verification.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black">
                        {verification.first_name} {verification.last_name}
                      </h3>
                      <p className="text-sm text-black">User ID: {verification.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-black" />
                      <span>Age: {verification.age}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-black" />
                      <span>Gender: {verification.gender}</span>
                    </div>
                    {verification.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-black" />
                        <span>Email: {verification.email}</span>
                      </div>
                    )}
                    {verification.phone_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-black" />
                        <span>Phone: {verification.phone_number}</span>
                      </div>
                    )}
                    {verification.preferred_bank && (
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-black" />
                          <span>Bank: {verification.preferred_bank}</span>
                        </div>
                        {verification.bank_account_number && (
                          <div className="flex items-center gap-2">
                            <span className="text-black text-xs">Account: {verification.bank_account_number}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <IdCard className="h-4 w-4 text-black" />
                      <span>Joined: {new Date(verification.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* ID Document */}
                <div className="flex flex-col items-center">
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Review
                    </span>
                  </div>
                  
                  {verification.id_image_url && (
                    <div className="relative group">
                      <img
                        src={verification.id_image_url}
                        alt="ID Document"
                        className="h-32 w-48 object-contain rounded-lg border border-gray-200 cursor-pointer bg-gray-100"
                        onClick={() => setPreviewImageUrl(verification.id_image_url)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                        <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-black mt-2">Click to view full size</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleVerify(verification.id)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                  
                  <button
                    onClick={() => handleReject(verification.id)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ID Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4">
          <img
            src={previewImageUrl}
            alt="Full ID"
            className="max-h-[80vh] max-w-[80vw] object-contain rounded-lg shadow-lg"
          />
          <button
            onClick={() => setPreviewImageUrl(null)}
            className="absolute top-4 right-4 text-white text-2xl font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}