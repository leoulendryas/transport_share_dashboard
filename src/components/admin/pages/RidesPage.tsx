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
  RefreshCw
} from 'lucide-react';
import { getRides, adminCancelRide } from '@/lib/api';
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
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

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

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleCancel = async (rideId: number) => {
    if (!token || !window.confirm('Are you sure you want to cancel this ride?')) return;
    try {
      await adminCancelRide(token, rideId);
      setSelectedRide(null);
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
          <Button variant="ghost" size="sm" onClick={() => setSelectedRide(ride)}>
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
        onRowClick={(ride) => setSelectedRide(ride)}
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
        isOpen={!!selectedRide}
        onClose={() => setSelectedRide(null)}
        title="Ride Details"
      >
        {selectedRide && (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">Ride #{selectedRide.id}</h3>
                  <p className="text-zinc-500 text-xs font-medium">{formatDateTime(selectedRide.departure_time)}</p>
                </div>
                <Badge variant={selectedRide.status === 'active' ? 'success' : 'zinc'}>
                  {selectedRide.status}
                </Badge>
              </div>

              {selectedRide.status === 'active' && (
                <Button 
                  variant="destructive" 
                  onClick={() => handleCancel(selectedRide.id)}
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
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{selectedRide.from_address}</p>
                </div>
                
                {selectedRide.stopovers?.map((s, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[16px] top-1.5 w-1.5 h-1.5 rounded-full bg-zinc-300" />
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Stopover {i + 1}</p>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{s.address}</p>
                  </div>
                ))}

                <div className="relative">
                  <div className="absolute -left-[16px] top-1.5 w-1.5 h-1.5 rounded-full bg-zinc-950 dark:bg-white" />
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">To</p>
                  <p className="text-sm font-black text-zinc-950 dark:text-white">{selectedRide.to_address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> Participants ({selectedRide.participants?.length || 0})
              </h4>
              <div className="space-y-2">
                {selectedRide.participants?.map((p, i) => (
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

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Available Seats</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">{selectedRide.seats_available} / {selectedRide.total_seats}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Created At</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">{new Date(selectedRide.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
