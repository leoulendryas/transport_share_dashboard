'use client';

import { useState, useEffect } from 'react';
import { Ride } from '@/types/user';
import { 
  Car, 
  MapPin, 
  Users, 
  X as Cancel, 
  ArrowRight,
  Eye,
  Calendar,
  RefreshCw,
  MessageSquare,
  Info,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  Navigation,
  Smartphone
} from 'lucide-react';
import { getRides, adminCancelRide, getRideById, getRideMessages } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const ITEMS_PER_PAGE = 10;

export default function RidesPage() {
  const { token } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
  const [detailedRide, setDetailedRide] = useState<Ride | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'chat'>('info');

  const fetchRides = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getRides(token, currentPage, ITEMS_PER_PAGE);
      setRides(data.results || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch rides', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [token, currentPage]);

  useEffect(() => {
    if (selectedRideId !== null && token) {
      fetchRideDetails(selectedRideId);
    } else {
      setDetailedRide(null);
      setMessages([]);
      setActiveDetailTab('info');
    }
  }, [selectedRideId, token]);

  const fetchRideDetails = async (rideId: number) => {
    setLoadingDetails(true);
    try {
      const [rideData, msgData] = await Promise.all([
        getRideById(token!, rideId),
        getRideMessages(token!, rideId)
      ]);
      setDetailedRide(rideData);
      setMessages(msgData || []);
    } catch (error) {
      console.error('Failed to fetch ride details', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleCancel = async (rideId: number) => {
    if (!token || !window.confirm('Are you sure you want to cancel this ride? This will notify all participants.')) return;
    try {
      await adminCancelRide(token, rideId);
      setSelectedRideId(null);
      fetchRides();
    } catch (error) {
      alert('Failed to cancel ride');
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Flexible Schedule';
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      header: 'Operation',
      accessor: (ride: Ride) => (
        <div className="flex flex-col">
          <span className="font-black text-zinc-950 dark:text-white uppercase tracking-tighter">RIDE_{ride.id}</span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
            <Clock className="w-2.5 h-2.5" /> {formatDateTime(ride.departure_time)}
          </span>
        </div>
      )
    },
    {
      header: 'Commander',
      accessor: (ride: Ride) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-500 border border-zinc-200 dark:border-zinc-800">
            {ride.driver_name?.[0] || 'D'}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{ride.driver_name}</span>
            <span className="text-[10px] text-zinc-400 font-medium tabular-nums">{ride.driver_phone || 'NO_COMMS'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Trajectory',
      accessor: (ride: Ride) => (
        <div className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 max-w-[240px]">
          <span className="truncate font-medium">{ride.from_address}</span>
          <ArrowRight className="w-3 h-3 flex-shrink-0 text-zinc-400" />
          <span className="truncate font-black text-zinc-900 dark:text-zinc-100">{ride.to_address}</span>
        </div>
      )
    },
    {
      header: 'Capacity',
      accessor: (ride: Ride) => (
        <div className="flex items-center gap-1.5">
           <div className="flex -space-x-1.5">
              {[...Array(ride.total_seats)].map((_, i) => (
                 <div key={i} className={`w-2 h-2 rounded-full border border-white dark:border-zinc-950 ${i < (ride.total_seats - ride.seats_available) ? 'bg-zinc-950 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
              ))}
           </div>
           <span className="text-[10px] font-black text-zinc-400 uppercase">{ride.total_seats - ride.seats_available}/{ride.total_seats}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (ride: Ride) => (
        <Badge variant={
          ride.status === 'active' || ride.status === 'full' ? 'success' : 
          ride.status === 'completed' ? 'zinc' : 
          ride.status === 'cancelled' ? 'error' : 'blue'
        }>
          {ride.status}
        </Badge>
      )
    },
    {
      header: '',
      accessor: (ride: Ride) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setSelectedRideId(ride.id)} className="h-8 w-8 p-0 rounded-lg">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="p-8 space-y-6 bg-white dark:bg-zinc-950 min-h-full">
      <div className="flex justify-between items-center mb-2">
        <div>
           <h2 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">Active Logistics</h2>
           <p className="text-xs text-zinc-500 font-medium mt-0.5">Monitoring {total} transport sequences across the grid.</p>
        </div>
        <Button variant="secondary" size="md" onClick={fetchRides} className="rounded-xl h-11 px-4">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={rides} 
        loading={loading}
        onRowClick={(ride) => setSelectedRideId(ride.id)}
        emptyMessage="Grid is clear. No active trajectories."
      />

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
        isOpen={selectedRideId !== null}
        onClose={() => setSelectedRideId(null)}
        title="Tactical Overview"
      >
        {loadingDetails ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <LoadingSpinner size="lg" />
            <div className="text-center space-y-1">
               <p className="text-zinc-950 dark:text-white text-xs font-black uppercase tracking-[0.2em]">Interrogating Database</p>
               <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Reconstructing ride parameters</p>
            </div>
          </div>
        ) : detailedRide ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex border-b border-zinc-100 dark:border-zinc-900">
              <button 
                onClick={() => setActiveDetailTab('info')}
                className={`flex-1 pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeDetailTab === 'info' ? 'text-zinc-950 dark:text-white' : 'text-zinc-400'}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Info className="w-3.5 h-3.5" /> Intelligence
                </div>
                {activeDetailTab === 'info' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 dark:bg-white" />}
              </button>
              <button 
                onClick={() => setActiveDetailTab('chat')}
                className={`flex-1 pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeDetailTab === 'chat' ? 'text-zinc-950 dark:text-white' : 'text-zinc-400'}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Comms Log ({messages.length})
                </div>
                {activeDetailTab === 'chat' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 dark:bg-white" />}
              </button>
            </div>

            {activeDetailTab === 'info' ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase">RIDE_{detailedRide.id}</h3>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">{formatDateTime(detailedRide.departure_time)}</p>
                    </div>
                    <Badge variant={detailedRide.status === 'active' || detailedRide.status === 'full' ? 'success' : 'zinc'}>
                      {detailedRide.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Seats Used</p>
                        <p className="text-lg font-black text-zinc-950 dark:text-white tabular-nums">{detailedRide.total_seats - detailedRide.seats_available} / {detailedRide.total_seats}</p>
                     </div>
                     <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Created</p>
                        <p className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-tighter">{new Date(detailedRide.created_at).toLocaleDateString()}</p>
                     </div>
                  </div>

                  {(detailedRide.status === 'active' || detailedRide.status === 'full') && (
                    <Button 
                      variant="destructive" 
                      onClick={() => handleCancel(detailedRide.id)}
                      className="w-full h-12 gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Cancel className="w-4 h-4" /> Terminate Trajectory
                    </Button>
                  )}
                </div>

                <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                         <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Commander (Driver)</p>
                         <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{detailedRide.driver_name}</p>
                         <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500"><Smartphone className="w-3 h-3" /> {detailedRide.driver_phone || 'N/A'}</span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500"><Mail className="w-3 h-3" /> {detailedRide.driver_email}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5" /> Vector Path
                  </h4>
                  <div className="relative pl-5 space-y-8 before:absolute before:left-[4px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-100 dark:before:bg-zinc-800">
                    <div className="relative">
                      <div className="absolute -left-[24px] top-1 w-3 h-3 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700" />
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Origin</p>
                      <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{detailedRide.from_address}</p>
                    </div>
                    
                    {detailedRide.stopovers?.map((s, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[24px] top-1 w-3 h-3 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700" />
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Waypoint {i + 1}</p>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500">{s.address}</p>
                      </div>
                    ))}

                    <div className="relative">
                      <div className="absolute -left-[24px] top-1 w-3 h-3 rounded-full bg-zinc-950 dark:bg-white ring-4 ring-zinc-950/10 dark:ring-white/10" />
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Destination</p>
                      <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{detailedRide.to_address}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Personnel ({detailedRide.participants?.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {detailedRide.participants?.length === 0 ? (
                       <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest py-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">No active participants</p>
                    ) : detailedRide.participants?.map((p, i) => (
                      <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400 border border-zinc-100 dark:border-zinc-700">
                          {p.first_name?.[0] || 'P'}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{p.first_name} {p.last_name}</p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{p.email}</p>
                        </div>
                        <Badge variant="zinc" className="bg-zinc-950 text-white border-none h-6 px-2 text-[9px] font-black">
                          {p.seats_booked} SEATS
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 opacity-40">
                    <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                       <MessageSquare className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No communications recorded on this frequency</p>
                  </div>
                ) : (
                  <div className="space-y-4 pb-10">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex flex-col ${m.user_id === detailedRide.driver_id ? 'items-start' : 'items-start'}`}>
                        <div className={`max-w-[90%] p-4 rounded-2xl border ${m.user_id === detailedRide.driver_id ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm'}`}>
                          <div className="flex justify-between items-center gap-6 mb-2">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${m.user_id === detailedRide.driver_id ? 'text-zinc-400' : 'text-zinc-500'}`}>
                               {m.first_name} {m.last_name} {m.user_id === detailedRide.driver_id && '(COMMANDER)'}
                            </span>
                            <span className={`text-[8px] font-bold tabular-nums ${m.user_id === detailedRide.driver_id ? 'text-zinc-500' : 'text-zinc-400'}`}>
                               {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className={`text-xs leading-relaxed font-medium ${m.user_id === detailedRide.driver_id ? 'text-zinc-100' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            {m.message || m.message_text || m.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center py-32 opacity-20">
              <Info className="w-12 h-12 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Intelligence offline</p>
           </div>
        )}
      </Drawer>
    </div>
  );
}
