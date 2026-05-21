import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { 
  AdminUser as User, 
  Vehicle, 
  DashboardStats as Stats 
} from '@/types/admin';
import { 
  Check, 
  X, 
  Eye, 
  ExternalLink,
  FileText,
  AlertCircle,
  Hash,
  Calendar,
  User as UserIcon,
  Phone,
  Mail,
  Car,
  ShieldAlert,
  ShieldCheck,
  Building2,
  DollarSign,
  AlertTriangle,
  Clock,
  ChevronRight,
  Fingerprint,
  RefreshCw
} from 'lucide-react';
import { verificationsApi } from '@/lib/api/verifications';
import { licensesApi } from '@/lib/api/licenses';
import { vehiclesApi } from '@/lib/api/vehicles';
import { dashboardApi } from '@/lib/api/dashboard';
import { extractError } from '@/lib/api/errors';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useNotifications } from '@/context/NotificationContext';

type TabType = 'id' | 'license' | 'vehicles';

const QUICK_REASONS = [
  "Image is blurry or unreadable",
  "Document appears expired",
  "Document does not match profile information",
  "Wrong document type uploaded",
  "Image is partially cut off"
];

const getWaitingUrgency = (submittedAt: string | null | undefined): 'zinc' | 'warning' | 'error' => {
  if (!submittedAt) return 'zinc';
  const hoursWaiting = (Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60);
  if (hoursWaiting > 48) return 'error';  // red — waiting > 2 days
  if (hoursWaiting > 24) return 'warning';    // amber — waiting > 1 day
  return 'zinc';                          // grey — recent
};

const formatRelativeTime = (dateString: string | null | undefined) => {
  if (!dateString) return 'VOID';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'JUST NOW';
  if (diffMin < 60) return `${diffMin}M AGO`;
  if (diffHours < 24) return `${diffHours}H AGO`;
  return `${diffDays}D AGO`;
};

const formatWaitingTime = (dateString: string | null | undefined) => {
  if (!dateString) return 'NEW';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'TODAY';
  return `WAITING ${diffDays}D`;
};

export default function VerificationsPage() {
  const { admin } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<TabType | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [rejectionModal, setRejectionModal] = useState<{ open: boolean, type: TabType | null, id: number | null }>({ open: false, type: null, id: null });
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: stats, mutate: mutateStats } = useSWR(
    admin ? 'dashboard-stats' : null,
    () => dashboardApi.getStats()
  );

  const { data: idVerificationsData, mutate: mutateIds, isLoading: loadingIds } = useSWR(
    admin && activeTab === 'id' ? 'verifications-ids' : null,
    () => verificationsApi.list(1, 100)
  );

  const { data: licenseVerificationsData, mutate: mutateLicenses, isLoading: loadingLicenses } = useSWR(
    admin && activeTab === 'license' ? 'verifications-licenses' : null,
    () => licensesApi.list(1, 100)
  );

  const { data: vehiclesData, mutate: mutateVehicles, isLoading: loadingVehicles } = useSWR(
    admin && activeTab === 'vehicles' ? 'verifications-vehicles' : null,
    () => vehiclesApi.listPending(1, 100)
  );

  const idVerifications = (idVerificationsData?.results || []).sort((a, b) => 
    new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
  );

  const licenseVerifications = (licenseVerificationsData?.results || []).sort((a, b) => 
    new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
  );

  const vehicleVerifications = (vehiclesData || []).sort((a, b) => 
    new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
  );

  const loading = activeTab === 'id' ? loadingIds : activeTab === 'license' ? loadingLicenses : loadingVehicles;

  const mutateAll = () => {
    mutateStats();
    if (activeTab === 'id') mutateIds();
    else if (activeTab === 'license') mutateLicenses();
    else if (activeTab === 'vehicles') mutateVehicles();
  };

  const handleAction = async (type: 'approve' | 'reject', itemType: TabType, id: number) => {
    if (type === 'reject') {
      setRejectionModal({ open: true, type: itemType, id });
      return;
    }

    setIsActionLoading(true);
    try {
      if (itemType === 'id') await verificationsApi.approve(id);
      else if (itemType === 'license') await licensesApi.approve(id);
      else if (itemType === 'vehicles') await vehiclesApi.approve(id);
      
      addNotification('success', 'Action Executed', `${itemType} protocol authorized successfully.`);
      setSelectedItem(null);
      mutateAll();
    } catch (error) {
      addNotification('warning', 'Action Failed', extractError(error));
    } finally {
      setIsActionLoading(false);
    }
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      addNotification('warning', 'Missing Feedback', 'Please provide a reason for rejection.');
      return;
    }

    setIsActionLoading(true);
    try {
      const { type, id } = rejectionModal;
      if (!id || !type) return;

      if (type === 'id') await verificationsApi.reject(id, rejectionReason);
      else if (type === 'license') await licensesApi.reject(id, rejectionReason);
      else if (type === 'vehicles') await vehiclesApi.reject(id, rejectionReason);
      
      addNotification('success', 'Protocol Terminated', `${type} protocol has been rejected.`);
      setRejectionModal({ open: false, type: null, id: null });
      setRejectionReason('');
      setSelectedItem(null);
      mutateAll();
    } catch (error) {
      addNotification('warning', 'Action Failed', extractError(error));
    } finally {
      setIsActionLoading(false);
    }
  };

  const idColumns = [
    {
      header: 'Node Identity',
      accessor: (v: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-500 border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
            {v.profile_photo ? (
               <img src={v.profile_photo} alt="P" className="w-full h-full object-cover" />
            ) : (
               `${v.first_name?.[0] || '?'}${v.last_name?.[0] || '?'}`
            )}
            {v.oauth_provider === 'google' && (
               <div className="absolute bottom-0 right-0 w-3 h-3 bg-white border border-zinc-200 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
               </div>
            )}
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{v.first_name || (v.email ? v.email.split('@')[0] : 'USER')} {v.last_name}</p>
            <p className="text-[10px] text-zinc-400 font-mono font-black uppercase">NODE_{v.id}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Context Flags',
      accessor: (v: User) => (
        <div className="flex flex-col gap-1">
           {activeTab === 'id' && v.driving_license_url && !v.license_verified && (
              <span className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1">
                 <ShieldAlert className="w-2.5 h-2.5" /> License Pending
              </span>
           )}
           {activeTab === 'license' && v.id_image_url && !v.id_verified && (
              <span className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1">
                 <ShieldAlert className="w-2.5 h-2.5" /> ID Pending
              </span>
           )}
           {v.rejection_reason && (
              <span className="text-[8px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1">
                 <AlertTriangle className="w-2.5 h-2.5" /> Resubmission
              </span>
           )}
           {!v.driving_license_url && !v.id_image_url && (
              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">No Flags</span>
           )}
        </div>
      )
    },
    {
      header: 'Submitted',
      accessor: (v: User) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-black uppercase tracking-widest tabular-nums">
            <Calendar className="w-3 h-3" />
            {v.verification_submitted_at ? new Date(v.verification_submitted_at).toLocaleDateString() : 'UNKNOWN'}
          </div>
          <Badge variant={getWaitingUrgency(v.verification_submitted_at)} className="h-4 px-1.5 text-[8px] font-black">
             {formatWaitingTime(v.verification_submitted_at)}
          </Badge>
        </div>
      )
    },
    {
      header: '',
      accessor: (v: User) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setSelectedItem(v)} className="h-8 w-8 p-0 rounded-lg">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  const vehicleColumns = [
    {
      header: 'Asset Specifications',
      accessor: (v: Vehicle) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <Car className="w-4 h-4 text-zinc-500" />
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{v.make} {v.model}</p>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{v.license_plate}</span>
               <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
               <span className="text-[10px] text-zinc-400 font-bold uppercase">{v.color}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Asset Owner',
      accessor: (v: Vehicle) => (
        <div className="flex flex-col">
          <span className="text-zinc-900 dark:text-zinc-100 font-bold">{v.first_name} {v.last_name}</span>
          <span className="text-[10px] text-zinc-500 font-medium">{v.owner_email}</span>
        </div>
      )
    },
    {
      header: 'Submitted',
      accessor: (v: Vehicle) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-black uppercase tracking-widest tabular-nums">
            <Calendar className="w-3 h-3" />
            {v.created_at ? new Date(v.created_at).toLocaleDateString() : 'UNKNOWN'}
          </div>
          <Badge variant={getWaitingUrgency(v.created_at)} className="h-4 px-1.5 text-[8px] font-black">
             {formatWaitingTime(v.created_at)}
          </Badge>
        </div>
      )
    },
    {
      header: '',
      accessor: (v: Vehicle) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setSelectedItem(v)} className="h-8 w-8 p-0 rounded-lg">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  if (!activeTab) {
    return (
      <div className="p-8 space-y-10 bg-white dark:bg-zinc-950 min-h-full">
         <div>
            <h2 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase">Verification Protocols</h2>
            <p className="text-xs text-zinc-500 font-medium mt-1">Authorized access to node identification and asset registries.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'id', label: 'ID Checks', count: stats?.pendingVerifications?.ids || 0, icon: Fingerprint, color: 'text-blue-500' },
              { id: 'license', label: 'Licenses', count: stats?.pendingVerifications?.licenses || 0, icon: ShieldCheck, color: 'text-emerald-500' },
              { id: 'vehicles', label: 'Vehicles', count: stats?.pendingVerifications?.vehicles || 0, icon: Car, color: 'text-purple-500' }
            ].map((q) => (
              <button 
                key={q.id}
                onClick={() => setActiveTab(q.id as TabType)}
                className="p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] text-left hover:border-zinc-400 dark:hover:border-zinc-600 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                   <q.icon className="w-24 h-24" />
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center mb-6 shadow-sm ${q.color}`}>
                   <q.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-zinc-950 dark:text-white uppercase tracking-tight">{q.label}</h3>
                <div className="flex items-center justify-between mt-2">
                   <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{q.count} PENDING</p>
                   <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
         </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-white dark:bg-zinc-950 min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setActiveTab(null)} className="h-10 w-10 p-0 rounded-xl">
               <ChevronRight className="w-4 h-4 rotate-180" />
            </Button>
            <div>
               <h2 className="text-xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase">{activeTab} Protocols</h2>
               <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    Queue Length: {activeTab === 'id' ? idVerifications.length : activeTab === 'license' ? licenseVerifications.length : vehicleVerifications.length}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300" />
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sorted by Oldest-First</span>
               </div>
            </div>
         </div>
         <Button variant="secondary" size="md" onClick={mutateAll} className="rounded-xl h-11 px-4">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
         </Button>
      </div>

      <div className="space-y-4">
        {activeTab === 'id' && (
          <DataTable 
            columns={idColumns} 
            data={idVerifications} 
            loading={loading}
            onRowClick={(v) => setSelectedItem(v)}
            emptyMessage="All identification nodes are synchronized."
          />
        )}
        {activeTab === 'license' && (
          <DataTable 
            columns={idColumns} 
            data={licenseVerifications} 
            loading={loading}
            onRowClick={(v) => setSelectedItem(v)}
            emptyMessage="All operational licenses are authorized."
          />
        )}
        {activeTab === 'vehicles' && (
          <DataTable 
            columns={vehicleColumns} 
            data={vehicleVerifications} 
            loading={loading}
            onRowClick={(v) => setSelectedItem(v)}
            emptyMessage="Registry is clean. No assets pending."
          />
        )}
      </div>

      <Drawer
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Protocol Interrogation"
      >
        {selectedItem && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            {/* Header info */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-lg font-black text-zinc-500 border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
                {activeTab === 'vehicles' ? (
                   <Car className="w-8 h-8" />
                ) : selectedItem.profile_photo ? (
                   <img src={selectedItem.profile_photo} alt="P" className="w-full h-full object-cover" />
                ) : (
                   `${selectedItem.first_name?.[0] || '?'}${selectedItem.last_name?.[0] || '?'}`
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase">
                  {activeTab === 'vehicles' ? `${selectedItem.make} ${selectedItem.model}` : `${selectedItem.first_name} ${selectedItem.last_name}`}
                </h3>
                <div className="flex items-center gap-2">
                   <Badge variant="zinc" className="h-5 px-2 text-[9px] font-black uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-none">
                     {activeTab === 'vehicles' ? 'ASSET_NODE' : 'INDIVIDUAL_NODE'}
                   </Badge>
                   <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-tighter">ID_{selectedItem.id}</span>
                </div>
              </div>
            </div>

            {/* Context Banners */}
            <div className="space-y-2">
               {(selectedItem.rejection_reason || selectedItem.verification_notes) && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                       <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Previous Rejection Protocol</p>
                       <p className="text-xs font-medium text-amber-700 dark:text-amber-400 italic">"{selectedItem.rejection_reason || selectedItem.verification_notes}"</p>
                    </div>
                  </div>
               )}
               {activeTab === 'id' && selectedItem.driving_license_url && !selectedItem.license_verified && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-blue-600" />
                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Dual Submission: Driving License also pending</p>
                  </div>
               )}
               {activeTab === 'license' && selectedItem.id_image_url && !selectedItem.id_verified && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-blue-600" />
                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Dual Submission: National ID also pending</p>
                  </div>
               )}
            </div>

            {/* Visual Evidence */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Credential Evidence</p>
                  <Badge variant={getWaitingUrgency(activeTab === 'vehicles' ? selectedItem.created_at : selectedItem.verification_submitted_at)} className="h-5 px-2 text-[8px] font-black">
                     SUBMITTED {formatRelativeTime(activeTab === 'vehicles' ? selectedItem.created_at : selectedItem.verification_submitted_at)}
                  </Badge>
               </div>
               <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200 dark:shadow-none group">
                 {activeTab === 'id' && selectedItem.id_image_url ? (
                   <img src={selectedItem.id_image_url} alt="ID Evidence" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                 ) : activeTab === 'license' && selectedItem.driving_license_url ? (
                   <img src={selectedItem.driving_license_url} alt="License Evidence" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                 ) : activeTab === 'vehicles' && selectedItem.registration_doc_url ? (
                   <img src={selectedItem.registration_doc_url} alt="Registry Evidence" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-4">
                     <AlertCircle className="w-12 h-12 opacity-10" />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-center px-10">Visual evidence not found in secure storage</p>
                   </div>
                 )}
                 
                 {(selectedItem.id_image_url || selectedItem.driving_license_url || selectedItem.registration_doc_url) && (
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <a 
                        href={selectedItem.id_image_url || selectedItem.driving_license_url || selectedItem.registration_doc_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-6 py-3 bg-white text-zinc-950 rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <ExternalLink className="w-4 h-4" /> Open Original Evidence
                      </a>
                   </div>
                 )}
               </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                {activeTab === 'vehicles' ? (
                  <>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Plate Registry</p>
                      <p className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-tight tabular-nums">{selectedItem.license_plate}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Asset Color</p>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase">{selectedItem.color}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Production Year</p>
                      <p className="text-sm font-black text-zinc-950 dark:text-white tabular-nums">{selectedItem.year || 'UNKNOWN'}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Fleet Node</p>
                      <p className="text-sm font-black text-zinc-950 dark:text-white tabular-nums flex items-center gap-2">
                         <Building2 className="w-4 h-4" /> {selectedItem.company_id || 'INDIVIDUAL'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Age / Gender</p>
                      <p className="text-sm font-black text-zinc-950 dark:text-white tabular-nums">{selectedItem.age || 'Not provided'} • {selectedItem.gender || 'Not provided'}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Account Tier</p>
                      <p className="text-sm font-black text-zinc-950 dark:text-white uppercase">{selectedItem.member_level || 'Newcomer'}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Payout Info if available */}
              {(selectedItem.preferred_bank || selectedItem.bank_account_number) && (
                <div className="p-6 bg-emerald-50/30 dark:bg-emerald-950/10 border-2 border-emerald-100/50 dark:border-emerald-900/20 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Target Bank</p>
                      <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                         <Building2 className="w-4 h-4" /> {selectedItem.preferred_bank}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Account Number</p>
                    <p className="text-sm font-mono font-black text-zinc-900 dark:text-white tracking-widest">{selectedItem.bank_account_number}</p>
                  </div>
                </div>
              )}

              <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                 <div className="flex items-center gap-4">
                    <Mail className="w-4 h-4 text-zinc-400" />
                    <div>
                       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Uplink</p>
                       <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{activeTab === 'vehicles' ? selectedItem.owner_email : selectedItem.email}</p>
                    </div>
                 </div>
                 {selectedItem.phone_number && (
                    <div className="flex items-center gap-4">
                       <Phone className="w-4 h-4 text-zinc-400" />
                       <div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Voice Comms</p>
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{selectedItem.phone_number}</p>
                       </div>
                    </div>
                 )}
              </div>

              <div className="flex gap-3 pt-4 pb-10">
                <Button
                  onClick={() => handleAction('approve', activeTab!, selectedItem.id)}
                  disabled={isActionLoading}
                  className="flex-1 h-16 rounded-[1.5rem] shadow-xl shadow-zinc-200 dark:shadow-none text-[10px] font-black uppercase tracking-[0.2em] bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                >
                  <Check className="w-5 h-5 mr-2" /> Authorize
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction('reject', activeTab!, selectedItem.id)}
                  disabled={isActionLoading}
                  className="flex-1 h-16 rounded-[1.5rem] shadow-xl shadow-rose-200 dark:shadow-none text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <X className="w-5 h-5 mr-2" /> Terminate
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        isOpen={rejectionModal.open}
        onClose={() => {
          setRejectionModal({ open: false, type: null, id: null });
          setRejectionReason('');
        }}
        title="Protocol Termination Reason"
      >
        <div className="space-y-6">
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
            <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <AlertCircle className="w-3 h-3" /> Mandatory Feedback
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 font-medium leading-relaxed">
              Specify the reason for rejecting this {rejectionModal.type} protocol. This message will be sent to the user and logged in the system audit trail.
            </p>
          </div>

          <div className="space-y-3">
             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Quick Select Reasons</p>
             <div className="flex flex-wrap gap-2">
                {QUICK_REASONS.map(r => (
                  <button 
                    key={r}
                    onClick={() => setRejectionReason(r)}
                    className={`px-3 py-2 rounded-xl text-[9px] font-bold border transition-all ${
                      rejectionReason === r 
                      ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950' 
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Custom Rejection Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide specific details for the user..."
              className="w-full h-32 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all resize-none dark:text-white"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setRejectionModal({ open: false, type: null, id: null });
                setRejectionReason('');
              }}
              className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              Abort
            </Button>
            <Button
              variant="destructive"
              onClick={submitRejection}
              disabled={isActionLoading || !rejectionReason.trim()}
              className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200 dark:shadow-none"
            >
              {isActionLoading ? <LoadingSpinner /> : 'Confirm Termination'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
