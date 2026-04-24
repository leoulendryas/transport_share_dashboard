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
  Info
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
      setRides(data.results);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [token, currentPage]);

  useEffect(() => {
    if (selectedRideId && token) {
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
      setMessages(msgData);
    } catch (error) {
      console.error('Failed to fetch ride details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleCancel = async (rideId: number) => {
    if (!token || !window.confirm('Are you sure you want to cancel this ride?')) return;
    try {
      await adminCancelRide(token, rideId);
      setSelectedRideId(null);
      fetchRides();
    } catch (error) {
      alert('Failed to cancel ride');
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

  const columns = [
    {
      header: 'Ride',
      accessor: (ride: Ride) => (
        <div className="flex flex-col">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">#{ride.id}</span>
          <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" /> {formatDateTime(ride.departure_time)}
          </span>
        </div>
      )
    },
    {
      header: 'Driver',
      accessor: (ride: Ride) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            {ride.driver_name?.[0] || 'D'}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{ride.driver_name}</span>
            <span className="text-[10px] text-zinc-500">{ride.driver_email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Route',
      accessor: (ride: Ride) => (
        <div className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 max-w-[200px]">
          <span className="truncate">{ride.from_address}</span>
          <ArrowRight className="w-3 h-3 flex-shrink-0 text-zinc-300" />
          <span className="truncate font-bold text-zinc-900 dark:text-zinc-100">{ride.to_address}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (ride: Ride) => (
        <Badge variant={
          ride.status === 'active' ? 'success' : 
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
          <Button variant="ghost" size="sm" onClick={() => setSelectedRideId(ride.id)}>
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="p-8 space-y-6 bg-white dark:bg-zinc-950 min-h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Management • {total} Rides</h3>
        <Button variant="secondary" size="sm" onClick={fetchRides}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={rides} 
        loading={loading}
        onRowClick={(ride) => setSelectedRideId(ride.id)}
        emptyMessage="No rides found"
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
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
        isOpen={!!selectedRideId}
        onClose={() => setSelectedRideId(null)}
        title="Ride Management"
      >
        {loadingDetails ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <LoadingSpinner />
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">Syncing Ride Data</p>
          </div>
        ) : detailedRide ? (
          <div className="space-y-8">
            <div className="flex border-b border-zinc-100 dark:border-zinc-900">
              <button 
                onClick={() => setActiveDetailTab('info')}
                className={`flex-1 pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeDetailTab === 'info' ? 'text-zinc-950 dark:text-white' : 'text-zinc-400'}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Info className="w-3.5 h-3.5" /> Details
                </div>
                {activeDetailTab === 'info' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 dark:bg-white" />}
              </button>
              <button 
                onClick={() => setActiveDetailTab('chat')}
                className={`flex-1 pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeDetailTab === 'chat' ? 'text-zinc-950 dark:text-white' : 'text-zinc-400'}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Chat Log ({messages.length})
                </div>
                {activeDetailTab === 'chat' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 dark:bg-white" />}
              </button>
            </div>

            {activeDetailTab === 'info' ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">Ride #{detailedRide.id}</h3>
                      <p className="text-zinc-500 text-xs font-medium">{formatDateTime(detailedRide.departure_time)}</p>
                    </div>
                    <Badge variant={detailedRide.status === 'active' ? 'success' : 'zinc'}>
                      {detailedRide.status}
                    </Badge>
                  </div>

                  {detailedRide.status === 'active' && (
                    <Button 
                      variant="destructive" 
                      onClick={() => handleCancel(detailedRide.id)}
                      className="w-full gap-2"
                    >
                      <Cancel className="w-4 h-4" /> Cancel Ride
                    </Button>
                  )}
                </div>

                <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Route
                  </h4>
                  <div className="relative pl-4 space-y-6 before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-200 dark:before:bg-zinc-800">
                    <div className="relative">
                      <div className="absolute -left-[16px] top-1.5 w-1.5 h-1.5 rounded-full bg-zinc-300" />
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">From</p>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{detailedRide.from_address}</p>
                    </div>
                    
                    {detailedRide.stopovers?.map((s, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[16px] top-1.5 w-1.5 h-1.5 rounded-full bg-zinc-300" />
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Stopover {i + 1}</p>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{s.address}</p>
                      </div>
                    ))}

                    <div className="relative">
                      <div className="absolute -left-[16px] top-1.5 w-1.5 h-1.5 rounded-full bg-zinc-950 dark:bg-white" />
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">To</p>
                      <p className="text-sm font-black text-zinc-950 dark:text-white">{detailedRide.to_address}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Participants ({detailedRide.participants?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {detailedRide.participants?.map((p, i) => (
                      <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-zinc-100 dark:border-zinc-700">
                          {p.first_name?.[0] || 'P'}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{p.first_name} {p.last_name}</p>
                          <p className="text-[10px] text-zinc-500 font-medium">{p.email}</p>
                        </div>
                        <div className="text-[10px] font-black text-zinc-950 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                          {p.seats_booked} SEATS
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-2 opacity-40">
                    <MessageSquare className="w-12 h-12" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No communications recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((m, i) => (
                      <div key={i} className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[10px] font-black text-zinc-900 dark:text-white uppercase">{m.first_name} {m.last_name}</p>
                          <p className="text-[9px] text-zinc-400 font-bold">{new Date(m.created_at).toLocaleTimeString()}</p>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                          {m.message_text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
