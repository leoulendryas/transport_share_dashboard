import { useState, useEffect } from 'react';
import { Ride, Company } from '@/types/user';
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
  Smartphone,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  DollarSign,
  AlertCircle,
  History,
  Briefcase,
  Filter,
  ChevronDown
} from 'lucide-react';
import { getRides, adminCancelRide, getRideById, getRideMessages, updateRideStatus, forceFinalizeRide, toggleRideChat, getRideHistory, getCompanies } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const ITEMS_PER_PAGE = 10;

const RIDE_STATUSES = ['active', 'full', 'ongoing', 'pending_completion', 'completed', 'cancelled', 'disputed'];

export default function RidesPage() {
  const { admin } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
  const [detailedRide, setDetailedRide] = useState<Ride | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'chat' | 'history'>('info');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    company_id: '',
    start_date: '',
    end_date: '',
    min_price: '',
    max_price: ''
  });

  const fetchRides = async () => {
    if (!admin) return;
    setLoading(true);
    try {
      const activeFilters: any = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) activeFilters[key] = key.includes('price') || key === 'company_id' ? Number(value) : value;
      });

      const data = await getRides(currentPage, ITEMS_PER_PAGE, activeFilters);
      setRides(data.results || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch rides', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const fetchInitialData = async () => {
    try {
      const comps = await getCompanies();
      setCompanies(comps || []);
    } catch (error) {
      console.error('Failed to fetch companies');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [admin]);

  useEffect(() => {
    fetchRides();
  }, [admin, currentPage, filters]);

  useEffect(() => {
    if (selectedRideId !== null && admin) {
      fetchRideDetails(selectedRideId);
    } else {
      setDetailedRide(null);
      setMessages([]);
      setHistory([]);
      setActiveDetailTab('info');
    }
  }, [selectedRideId, admin]);

  const fetchRideDetails = async (rideId: number) => {
    setLoadingDetails(true);
    try {
      const [rideData, msgData, historyData] = await Promise.all([
        getRideById(rideId),
        getRideMessages(rideId),
        getRideHistory(rideId)
      ]);
      setDetailedRide(rideData);
      setMessages(msgData || []);
      setHistory(historyData || []);
    } catch (error) {
      console.error('Failed to fetch ride details', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateStatus = async (rideId: number, status: string) => {
    if (!admin) return;
    setIsUpdatingStatus(true);
    try {
      await updateRideStatus(rideId, status);
      fetchRideDetails(rideId);
      fetchRides();
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCancel = async (rideId: number) => {
    if (!admin || !window.confirm('Are you sure you want to cancel this ride? This will notify all participants.')) return;
    try {
      await adminCancelRide(rideId);
      fetchRideDetails(rideId);
      fetchRides();
    } catch (error) {
      alert('Failed to cancel ride');
    }
  };

  const handleToggleChat = async (rideId: number, lock: boolean) => {
    if (!admin) return;
    try {
      await toggleRideChat(rideId, lock);
      fetchRideDetails(rideId);
    } catch (error) {
      alert('Failed to toggle chat lock');
    }
  };

  const handleForceFinalize = async (rideId: number) => {
    if (!admin || !window.confirm('Force finalize this ride? This will trigger payouts if applicable.')) return;
    try {
      await forceFinalizeRide(rideId);
      fetchRideDetails(rideId);
      fetchRides();
    } catch (error) {
      alert('Failed to finalize ride');
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Flexible Schedule';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    
    let relative = '';
    if (Math.abs(diffHours) < 24) {
      if (diffHours > 0) relative = ` (in ${diffHours}h)`;
      else if (diffHours < 0) relative = ` (${Math.abs(diffHours)}h ago)`;
      else relative = ' (now)';
    }

    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + relative;
  };

  const isChatLocked = (ride: Ride) => {
    if (!ride.chat_locked_at) return false;
    if (!ride.chat_unlocked_at) return true;
    return new Date(ride.chat_locked_at) > new Date(ride.chat_unlocked_at);
  };

  const columns = [
    {
      header: 'Operation',
      accessor: (ride: Ride) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-black text-zinc-950 dark:text-white uppercase tracking-tighter">RIDE_{ride.id}</span>
            {ride.ladies_only && <Badge variant="zinc" className="bg-pink-100 text-pink-600 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800 text-[8px] px-1.5 h-4">LADIES</Badge>}
          </div>
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
            <span className="text-[10px] text-zinc-400 font-medium tabular-nums">{ride.driver_email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Trajectory',
      accessor: (ride: Ride) => (
        <div className="flex flex-col gap-0.5 max-w-[240px]">
          <div className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
            <span className="truncate font-medium">{ride.from_address}</span>
            <ArrowRight className="w-3 h-3 flex-shrink-0 text-zinc-400" />
            <span className="truncate font-black text-zinc-900 dark:text-zinc-100">{ride.to_address}</span>
          </div>
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
            {(ride.distance / 1000).toFixed(1)} KM • {Math.round(ride.duration / 60)} MIN
          </span>
        </div>
      )
    },
    {
      header: 'Capacity',
      accessor: (ride: Ride) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
             <div className="flex -space-x-1.5">
                {[...Array(ride.total_seats)].map((_, i) => (
                   <div key={i} className={`w-2 h-2 rounded-full border border-white dark:border-zinc-950 ${i < (ride.total_seats - ride.seats_available) ? 'bg-zinc-950 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                ))}
             </div>
             <span className="text-[10px] font-black text-zinc-400 uppercase">{ride.total_seats - ride.seats_available}/{ride.total_seats}</span>
          </div>
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
            {ride.price_per_seat} ETB / SEAT
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (ride: Ride) => (
        <div className="flex flex-col items-start gap-1">
          <Badge variant={
            ride.status === 'active' ? 'success' : 
            ride.status === 'full' ? 'blue' :
            ride.status === 'ongoing' ? 'warning' :
            ride.status === 'pending_completion' ? 'warning' :
            ride.status === 'completed' ? 'zinc' : 
            ride.status === 'cancelled' || ride.status === 'disputed' ? 'error' : 'error'
          } className={
            ride.status === 'pending_completion' ? 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' : ''
          }>
            {ride.status.replace('_', ' ')}
          </Badge>
          {ride.payment_released && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">PAID OUT</span>}
          {isChatLocked(ride) && <Lock className="w-2.5 h-2.5 text-zinc-400" />}
        </div>
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

  const PricingInspector = ({ audit }: { audit: NonNullable<Ride['pricing_audit']> }) => (
    <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Receipt className="w-3.5 h-3.5" /> Pricing Inspector
        </h4>
        {audit.is_near_ceiling && (
          <Badge variant="warning" className="animate-pulse h-5 text-[8px] font-black px-2">PRICE NEAR CEILING</Badge>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative pt-6 pb-2">
          <div className="absolute top-0 left-0 text-[8px] font-bold text-zinc-400 uppercase">Floor: {Math.round(audit.floor_limit)} ETB</div>
          <div className="absolute top-0 right-0 text-[8px] font-bold text-zinc-400 uppercase">Ceiling: {Math.round(audit.ceiling_limit)} ETB</div>
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-zinc-950 dark:bg-white rounded-full transition-all duration-1000"
              style={{ width: `${((audit.price_per_seat - audit.floor_limit) / (audit.ceiling_limit - audit.floor_limit)) * 100}%` }}
            />
          </div>
          <div 
            className="absolute top-4 flex flex-col items-center -ml-4 transition-all duration-1000"
            style={{ left: `${((audit.price_per_seat - audit.floor_limit) / (audit.ceiling_limit - audit.floor_limit)) * 100}%` }}
          >
            <div className="w-1 h-3 bg-zinc-950 dark:bg-white" />
            <span className="text-[10px] font-black text-zinc-950 dark:text-white mt-1">{audit.price_per_seat} ETB</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Passenger Pays</p>
            <p className="text-sm font-black text-zinc-950 dark:text-white tabular-nums">{audit.booking_summary.total_passenger_payable.toFixed(2)} ETB</p>
            <p className="text-[8px] text-zinc-500 font-medium italic">Includes all fees</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Platform Fee</p>
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">+{audit.platform_fee_breakdown.total_platform_fee.toFixed(2)} ETB</p>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-[8px] font-bold text-zinc-500">VAT: {audit.platform_fee_breakdown.vat.toFixed(2)}</span>
              <span className="text-[8px] font-bold text-zinc-500">Svc: {audit.platform_fee_breakdown.base_service_fee.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-6 bg-white dark:bg-zinc-950 min-h-full">
      <div className="flex justify-between items-center mb-2">
        <div>
           <h2 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">Active Logistics</h2>
           <p className="text-xs text-zinc-500 font-medium mt-0.5">Monitoring {total} transport sequences across the grid.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant={showFilters ? 'primary' : 'secondary'} 
            size="md" 
            onClick={() => setShowFilters(!showFilters)} 
            className="rounded-xl h-11 px-4 gap-2"
          >
            <Filter className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{showFilters ? 'Hide Filters' : 'Filters'}</span>
          </Button>
          <Button variant="secondary" size="md" onClick={fetchRides} className="rounded-xl h-11 px-4">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Status</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full h-10 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
            >
              <option value="">All Statuses</option>
              {RIDE_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Fleet / Company</label>
            <select 
              value={filters.company_id}
              onChange={(e) => setFilters({...filters, company_id: e.target.value})}
              className="w-full h-10 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
            >
              <option value="">All Fleets</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Start Date</label>
            <input 
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({...filters, start_date: e.target.value})}
              className="w-full h-10 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">End Date</label>
            <input 
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({...filters, end_date: e.target.value})}
              className="w-full h-10 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Min Price</label>
            <input 
              type="number"
              placeholder="ETB"
              value={filters.min_price}
              onChange={(e) => setFilters({...filters, min_price: e.target.value})}
              className="w-full h-10 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
            />
          </div>
          <div className="flex flex-col justify-end">
            <Button 
              variant="secondary" 
              onClick={() => setFilters({status: '', company_id: '', start_date: '', end_date: '', min_price: '', max_price: ''})}
              className="h-10 text-[9px] font-black uppercase tracking-widest rounded-xl"
            >
              Reset
            </Button>
          </div>
        </div>
      )}

      <DataTable 
        columns={columns} 
        data={rides} 
        loading={loading}
        onRowClick={(ride) => setSelectedRideId(ride.id)}
        emptyMessage="Grid is clear. No trajectories match these parameters."
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
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
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
              <button 
                onClick={() => setActiveDetailTab('history')}
                className={`flex-1 pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeDetailTab === 'history' ? 'text-zinc-950 dark:text-white' : 'text-zinc-400'}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <History className="w-3.5 h-3.5" /> Status History
                </div>
                {activeDetailTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 dark:bg-white" />}
              </button>
            </div>

            {activeDetailTab === 'info' ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                {/* Compliance Banners */}
                {detailedRide.compliance_audit && (
                  <div className="space-y-2">
                    {detailedRide.compliance_audit.ladies_only_violation && (
                      <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Ladies-only violation — Driver gender mismatch detected</p>
                      </div>
                    )}
                    {!detailedRide.compliance_audit.driver_verified && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-2xl flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Unverified driver — Profile credentials pending approval</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase">RIDE_{detailedRide.id}</h3>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{formatDateTime(detailedRide.departure_time)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="relative group">
                        <select 
                          value={detailedRide.status}
                          disabled={isUpdatingStatus}
                          onChange={(e) => handleUpdateStatus(detailedRide.id, e.target.value)}
                          className={`appearance-none h-8 pl-3 pr-8 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-zinc-950 ${
                            detailedRide.status === 'active' ? 'bg-zinc-950 text-white border-zinc-950' : 
                            'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                          }`}
                        >
                          {RIDE_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                      </div>
                      {detailedRide.payment_released && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Payout Confirmed</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Occupancy</p>
                        <p className="text-lg font-black text-zinc-950 dark:text-white tabular-nums">{detailedRide.total_seats - detailedRide.seats_available} / {detailedRide.total_seats}</p>
                     </div>
                     <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Financials</p>
                        <p className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-tighter">{detailedRide.price_per_seat} ETB / seat</p>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tabular-nums mt-0.5">Total: {detailedRide.total_trip_cost} ETB</p>
                     </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {detailedRide.ladies_only && <Badge variant="zinc" className="bg-pink-100 text-pink-600 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800 text-[9px] font-black uppercase">Ladies Only</Badge>}
                    {detailedRide.pets_allowed && <Badge variant="zinc" className="bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 text-[9px] font-black uppercase">Pets OK</Badge>}
                    {detailedRide.smoking_allowed && <Badge variant="zinc" className="bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 text-[9px] font-black uppercase">Smoking OK</Badge>}
                    {detailedRide.max_back_seats && <Badge variant="zinc" className="bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 text-[9px] font-black uppercase">Max 2 in Back</Badge>}
                    {detailedRide.approval_mode && <Badge variant="zinc" className="bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 text-[9px] font-black uppercase">Manual Approval</Badge>}
                    <Badge variant="zinc" className="bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 text-[9px] font-black uppercase">{detailedRide.luggage_size} Luggage</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {['active', 'full', 'ongoing'].includes(detailedRide.status) && (
                      <Button 
                        variant="destructive" 
                        onClick={() => handleCancel(detailedRide.id)}
                        className="h-11 gap-2 text-[9px] font-black uppercase tracking-widest"
                      >
                        <Cancel className="w-3.5 h-3.5" /> Terminate Ride
                      </Button>
                    )}
                    {detailedRide.status === 'pending_completion' && (
                      <Button 
                        variant="primary" 
                        onClick={() => handleForceFinalize(detailedRide.id)}
                        className="h-11 gap-2 text-[9px] font-black uppercase tracking-widest"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Force Finalize
                      </Button>
                    )}
                    <Button 
                      variant="secondary" 
                      onClick={() => handleToggleChat(detailedRide.id, !isChatLocked(detailedRide))}
                      className={`h-11 gap-2 text-[9px] font-black uppercase tracking-widest ${['active', 'full', 'ongoing'].includes(detailedRide.status) || detailedRide.status === 'pending_completion' ? 'col-span-1' : 'col-span-2'}`}
                    >
                      {isChatLocked(detailedRide) ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      {isChatLocked(detailedRide) ? 'Unlock Comms' : 'Lock Comms'}
                    </Button>
                  </div>
                </div>

                {detailedRide.pricing_audit && <PricingInspector audit={detailedRide.pricing_audit} />}

                <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                         <ShieldCheck className={`w-4 h-4 ${detailedRide.compliance_audit?.driver_verified ? 'text-emerald-500' : 'text-zinc-400'}`} />
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Commander (Driver)</p>
                            {detailedRide.company_id && (
                               <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-950 dark:bg-white rounded-full">
                                  <Briefcase className="w-2.5 h-2.5 text-white dark:text-zinc-950" />
                                  <span className="text-[8px] font-black text-white dark:text-zinc-950 uppercase">
                                     {companies.find(c => c.id === detailedRide.company_id)?.name || 'Fleet Driver'}
                                  </span>
                               </div>
                            )}
                         </div>
                         <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{detailedRide.driver_name}</p>
                         <div className="flex items-center gap-3 mt-1.5">
                            <a href={`tel:${detailedRide.driver_phone}`} className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"><Smartphone className="w-3 h-3" /> {detailedRide.driver_phone || 'N/A'}</a>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500"><Mail className="w-3 h-3" /> {detailedRide.driver_email}</span>
                         </div>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-start gap-4">
                      <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                         <Car className="w-4 h-4 text-zinc-600" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tactical Vehicle</p>
                         <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase">{detailedRide.brand_name}</p>
                         <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] font-black bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-2 py-0.5 rounded-md tabular-nums">{detailedRide.plate_number}</span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">{detailedRide.color}</span>
                         </div>
                      </div>
                   </div>

                   {detailedRide.meeting_point_details && (
                     <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <MapPin className="w-3 h-3" /> Rendezvous Instructions
                        </p>
                        <div className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                           <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed italic">"{detailedRide.meeting_point_details}"</p>
                        </div>
                     </div>
                   )}
                </div>

                {detailedRide.payment_released && (
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Payout released</p>
                        <p className="text-[9px] font-bold text-emerald-500/80 uppercase mt-0.5">Sequence completed at {detailedRide.payment_released_at ? new Date(detailedRide.payment_released_at).toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Route Visualization Placeholder */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5" /> Route Visualization
                  </h4>
                  <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-950 via-transparent to-transparent dark:from-white" />
                    <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 z-10 group-hover:scale-105 transition-transform duration-500">
                      <MapPin className="w-8 h-8 text-zinc-950 dark:text-white" />
                    </div>
                    <div className="text-center z-10">
                      <p className="text-[10px] font-black text-zinc-950 dark:text-white uppercase tracking-widest">GeoJSON Engine Ready</p>
                      <p className="text-[8px] font-bold text-zinc-500 uppercase mt-1">
                        {detailedRide.route_geometry ? `${detailedRide.route_geometry.coordinates.length} Vector Points Loaded` : 'No Route Geometry Available'}
                      </p>
                    </div>
                    {detailedRide.route_geometry && (
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                         <Badge variant="zinc" className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-[8px]">LineString Mode</Badge>
                         <Badge variant="zinc" className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-[8px]">WGS84 Projection</Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <History className="w-3.5 h-3.5" /> Vector Path Detail
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
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-[8px] font-black text-zinc-400 uppercase mb-1">Total Distance</p>
                      <p className="text-xs font-black text-zinc-950 dark:text-white">{(detailedRide.distance / 1000).toFixed(1)} KM</p>
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-[8px] font-black text-zinc-400 uppercase mb-1">Est. Duration</p>
                      <p className="text-xs font-black text-zinc-950 dark:text-white">{Math.round(detailedRide.duration / 60)} MINUTES</p>
                    </div>
                    {detailedRide.estimated_arrival && (
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 col-span-2">
                        <p className="text-[8px] font-black text-zinc-400 uppercase mb-1">Estimated Arrival</p>
                        <p className="text-xs font-black text-zinc-950 dark:text-white uppercase tracking-tight">{new Date(detailedRide.estimated_arrival).toLocaleString()}</p>
                      </div>
                    )}
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
            ) : activeDetailTab === 'chat' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Encrypted Comms Channel</p>
                  {isChatLocked(detailedRide) ? (
                    <Badge variant="error" className="h-5 text-[8px] font-black">LOCKED</Badge>
                  ) : (
                    <Badge variant="success" className="h-5 text-[8px] font-black">ACTIVE</Badge>
                  )}
                </div>
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
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                {history.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-32 opacity-20">
                      <History className="w-12 h-12 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No history recorded</p>
                   </div>
                ) : (
                  <div className="relative pl-5 space-y-8 before:absolute before:left-[4px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-100 dark:before:bg-zinc-800">
                    {history.map((h, i) => (
                      <div key={i} className="relative">
                        <div className={`absolute -left-[24px] top-1 w-3 h-3 rounded-full border-2 ${i === 0 ? 'bg-zinc-950 dark:bg-white border-zinc-950 dark:border-white' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700'}`} />
                        <div className="flex items-center justify-between">
                           <p className="text-[10px] font-black text-zinc-950 dark:text-white uppercase tracking-widest">{h.status.replace('_', ' ')}</p>
                           <p className="text-[8px] font-bold text-zinc-400 tabular-nums">{new Date(h.created_at).toLocaleString()}</p>
                        </div>
                        {h.notes && <p className="text-[10px] text-zinc-500 font-medium mt-1 italic">"{h.notes}"</p>}
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
