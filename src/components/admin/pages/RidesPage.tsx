'use client';

import { useState, useEffect } from 'react';
import { Ride } from '@/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Car, MapPin, Calendar, Users, DollarSign, X as Cancel, Eye, MoreHorizontal, ChevronRight, Clock, Shield, MessageSquare, User as UserIcon } from 'lucide-react';
import { getRideMessages } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface RidesPageProps {
  rides: Ride[];
  currentPage: number;
  total: number;
  onCancel: (rideId: number) => void;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function RidesPage({ 
  rides, 
  currentPage, 
  total, 
  onCancel, 
  onPageChange, 
  loading = false 
}: RidesPageProps) {
  const { token } = useAuth();
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (selectedRide && showChat && token) {
      const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
          const data = await getRideMessages(token, selectedRide.id);
          setMessages(data);
        } catch (error) {
          console.error('Failed to fetch messages');
        } finally {
          setLoadingMessages(false);
        }
      };
      fetchMessages();
    }
  }, [selectedRide, showChat, token]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const statusColors = {
    active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    full: 'bg-blue-50 text-blue-600 border-blue-100',
    ongoing: 'bg-amber-50 text-amber-600 border-amber-100',
    completed: 'bg-slate-50 text-slate-600 border-slate-100',
    cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
    disputed: 'bg-orange-50 text-orange-600 border-orange-100'
  };

  const handleCancel = (rideId: number) => {
    if (window.confirm('Are you sure you want to cancel this ride? This action cannot be undone.')) {
      onCancel(rideId);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Flexible';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 font-medium animate-pulse">Loading rides...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="p-8 space-y-8">
        {rides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-[2rem] border border-slate-100">
            <Car className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">No rides found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {rides.map((ride) => (
              <div 
                key={ride.id} 
                className="bg-white rounded-[2rem] border border-slate-100 p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">Ride #{ride.id}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {ride.plate_number}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[ride.status]}`}>
                    {ride.status}
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Route Timeline */}
                  <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 before:border-l before:border-dashed before:border-slate-300">
                    <div className="relative">
                      <div className="absolute -left-[26px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-blue-500 z-10" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pickup</p>
                      <p className="text-sm font-bold text-slate-700 line-clamp-1">{ride.from_address}</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[26px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-emerald-500 z-10" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Destination</p>
                      <p className="text-sm font-bold text-slate-700 line-clamp-1">{ride.to_address}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-50">
                    <div className="space-y-1 text-center">
                      <Clock className="w-4 h-4 text-slate-300 mx-auto mb-1" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Departure</p>
                      <p className="text-xs font-bold text-slate-700">{formatDateTime(ride.departure_time)}</p>
                    </div>
                    <div className="space-y-1 text-center border-x border-slate-50">
                      <Users className="w-4 h-4 text-slate-300 mx-auto mb-1" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Seats</p>
                      <p className="text-xs font-bold text-slate-700">{ride.seats_available}/{ride.total_seats}</p>
                    </div>
                    <div className="space-y-1 text-center">
                      <DollarSign className="w-4 h-4 text-slate-300 mx-auto mb-1" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Price</p>
                      <p className="text-xs font-bold text-emerald-600">{ride.price_per_seat} ETB</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase border border-slate-200">
                        {ride.driver?.first_name?.[0]}{ride.driver?.last_name?.[0]}
                      </div>
                      <span className="text-xs font-bold text-slate-600">{ride.driver?.first_name} {ride.driver?.last_name}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedRide(ride)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {ride.status === 'active' && (
                        <button
                          onClick={() => handleCancel(ride.id)}
                          className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                          title="Cancel Ride"
                        >
                          <Cancel className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Improved Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
            >
              Previous
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${
                    page === currentPage
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modern Ride Modal */}
      {selectedRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <Car className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">Ride Review #{selectedRide.id}</h3>
              </div>
              <button onClick={() => { setSelectedRide(null); setShowChat(false); }} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center transition-colors">✕</button>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Driver Info</p>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {selectedRide.driver?.first_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{selectedRide.driver?.first_name} {selectedRide.driver?.last_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Verified Driver</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Details</p>
                    <p className="text-sm font-bold text-slate-700">{selectedRide.brand_name} • {selectedRide.color}</p>
                    <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block uppercase mt-1">{selectedRide.plate_number}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financials</p>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-2xl font-black text-emerald-700">{selectedRide.price_per_seat} <span className="text-xs font-bold uppercase tracking-widest opacity-70">ETB / Seat</span></p>
                    <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mt-1">Platform fee included</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passengers</p>
                  <div className="flex -space-x-3 mt-2">
                    {selectedRide.participants?.map((_, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                        P{i+1}
                      </div>
                    )) || <p className="text-xs text-slate-400 font-medium italic">No passengers yet</p>}
                    {selectedRide.total_seats - (selectedRide.seats_available || 0) > 0 && (
                      <div className="pl-6 flex items-center text-xs font-bold text-slate-500">
                        {selectedRide.total_seats - selectedRide.seats_available} booked
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <button 
                  onClick={() => setShowChat(!showChat)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-bold text-slate-700">Ride Conversation History</span>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showChat ? 'rotate-90' : ''}`} />
                </button>

                {showChat && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 space-y-3 max-h-60 overflow-y-auto">
                    {loadingMessages ? (
                      <div className="py-8 text-center"><LoadingSpinner size="sm" /></div>
                    ) : messages.length === 0 ? (
                      <div className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No messages exchanged</div>
                    ) : (
                      messages.map((msg, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-blue-600 shadow-sm">
                            {msg.first_name?.[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-slate-900 uppercase">{msg.first_name} {msg.last_name}</span>
                              <span className="text-[8px] font-bold text-slate-400 tracking-tighter">{new Date(msg.created_at).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-sm text-slate-600 font-medium">{msg.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-8 pt-0">
               <button 
                onClick={() => { setSelectedRide(null); setShowChat(false); }}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:scale-[1.01] transition-all"
               >
                Close Review
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
