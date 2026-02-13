'use client';

import { useState } from 'react';
import { PendingVerification } from '@/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Check, X, Eye, User, Calendar, IdCard, Building, Mail, Phone, ExternalLink } from 'lucide-react';

interface VerificationsPageProps {
  verifications: PendingVerification[];
  onVerify: (userId: number) => Promise<void>;
  onReject: (userId: number) => Promise<void>;
  loading?: boolean;
}

export default function VerificationsPage({ 
  verifications, 
  onVerify, 
  onReject, 
  loading = false 
}: VerificationsPageProps) {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const handleVerify = (userId: number) => {
    if (window.confirm('Are you sure you want to approve this verification?')) {
      onVerify(userId);
    }
  };

  const handleReject = (userId: number) => {
    if (window.confirm('Are you sure you want to reject this verification?')) {
      onReject(userId);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 font-medium animate-pulse">Loading verifications...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {verifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-500 mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">All Caught Up!</h3>
          <p className="text-slate-500 font-medium">No pending ID verifications at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {verifications.map((verification) => (
            <div key={verification.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{verification.first_name} {verification.last_name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">ID: #{verification.id}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(verification.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase border border-amber-100">
                    Pending Review
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Information</p>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-slate-700 truncate">{verification.email}</p>
                      <p className="text-sm font-semibold text-slate-700">{verification.phone_number}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personal Details</p>
                    <p className="text-sm font-semibold text-slate-700">{verification.gender}, {verification.age} years old</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Banking Info</p>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-slate-700">{verification.preferred_bank}</p>
                      <p className="text-xs font-medium text-slate-500 font-mono">{verification.bank_account_number}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined On</p>
                    <p className="text-sm font-semibold text-slate-700">{new Date(verification.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="relative group/img rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-8">
                  <img
                    src={verification.id_image_url}
                    alt="ID Document"
                    className="w-full h-48 object-cover group-hover/img:scale-105 transition-transform duration-500"
                    onClick={() => setPreviewImageUrl(verification.id_image_url)}
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setPreviewImageUrl(verification.id_image_url)}>
                    <div className="px-4 py-2 bg-white rounded-xl text-sm font-bold text-slate-900 shadow-xl flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Inspect Document
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleVerify(verification.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                  >
                    <Check className="w-5 h-5" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(verification.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold transition-all border border-rose-100 active:scale-[0.98]"
                  >
                    <X className="w-5 h-5" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ID Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[9999] p-8 animate-in fade-in duration-300">
          <div className="relative max-w-5xl w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
            <img
              src={previewImageUrl}
              alt="Full ID"
              className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold backdrop-blur-md transition-colors border border-white/10"
              >
                Close Preview
              </button>
              <a 
                href={previewImageUrl} 
                target="_blank" 
                rel="noreferrer"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xl shadow-blue-900/40 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Open Original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
