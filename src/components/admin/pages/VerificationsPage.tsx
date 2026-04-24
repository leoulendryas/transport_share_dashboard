'use client';

import { useState, useEffect } from 'react';
import { User, Vehicle } from '@/types/user';
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
  Car
} from 'lucide-react';
import { 
  getPendingVerifications, 
  getPendingLicenses, 
  getPendingVehicles,
  verifyUserID,
  rejectVerification,
  approveLicense,
  approveVehicle,
  rejectVehicle
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type TabType = 'id' | 'license' | 'vehicles';

export default function VerificationsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('id');
  const [idVerifications, setIdVerifications] = useState<User[]>([]);
  const [licenseVerifications, setLicenseVerifications] = useState<User[]>([]);
  const [vehicleVerifications, setVehicleVerifications] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'id') {
        const data = await getPendingVerifications(token!);
        setIdVerifications(data.results);
      } else if (activeTab === 'license') {
        const data = await getPendingLicenses(token!);
        setLicenseVerifications(data as any);
      } else if (activeTab === 'vehicles') {
        const data = await getPendingVehicles(token!);
        setVehicleVerifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type: 'approve' | 'reject', itemType: TabType, id: number) => {
    if (!token) return;
    
    let reason = '';
    if (type === 'reject') {
      reason = window.prompt('Provide a detailed reason for rejection. This will be logged and sent to the user:') || '';
      if (reason === null) return;
    }

    setIsActionLoading(true);
    try {
      if (itemType === 'id') {
        if (type === 'approve') await verifyUserID(token, id);
        else await rejectVerification(token, id, reason);
      } else if (itemType === 'license') {
        if (type === 'approve') await approveLicense(token, id);
        else await rejectVerification(token, id, reason); // Backend uses same rejection endpoint for id/license in some logic, or it clears URL
      } else if (itemType === 'vehicles') {
        if (type === 'approve') await approveVehicle(token, id);
        else await rejectVehicle(token, id, reason);
      }
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      alert(`Failed to ${type} ${itemType}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const idColumns = [
    {
      header: 'Node Identity',
      accessor: (v: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-500 border border-zinc-200 dark:border-zinc-800">
            {v.first_name?.[0]}{v.last_name?.[0]}
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{v.first_name} {v.last_name}</p>
            <p className="text-[10px] text-zinc-400 font-mono font-black uppercase">NODE_{v.id}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contact Protocol',
      accessor: (v: User) => (
        <div className="flex flex-col">
          <span className="text-zinc-600 dark:text-zinc-400 font-medium">{v.email}</span>
          <span className="text-[10px] text-zinc-500 font-black tracking-tight">{v.phone_number || 'STATIONARY'}</span>
        </div>
      )
    },
    {
      header: 'Submitted',
      accessor: (v: User) => (
        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-black uppercase tracking-widest tabular-nums">
          <Calendar className="w-3 h-3" />
          {v.verification_submitted_at ? new Date(v.verification_submitted_at).toLocaleDateString() : 'UNKNOWN'}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: () => <Badge variant="warning">Verification Pending</Badge>
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
      header: 'Status',
      accessor: () => <Badge variant="warning">Registry Pending</Badge>
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

  return (
    <div className="p-8 space-y-8 bg-white dark:bg-zinc-950 min-h-full">
      <div className="flex border-b border-zinc-100 dark:border-zinc-900">
        {(['id', 'license', 'vehicles'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
              activeTab === tab 
              ? 'text-zinc-950 dark:text-white' 
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
            }`}
          >
            {tab} Protocols
            {activeTab === tab && (
              <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-zinc-950 dark:bg-white" />
            )}
          </button>
        ))}
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
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Credential Evidence</p>
               <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200 dark:shadow-none group">
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
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase">
                  {activeTab === 'vehicles' ? `${selectedItem.make} ${selectedItem.model}` : `${selectedItem.first_name} ${selectedItem.last_name}`}
                </h3>
                <div className="flex items-center gap-2">
                   <Badge variant="zinc" className="h-5 px-2 text-[9px] font-black uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-none">
                     {activeTab === 'vehicles' ? 'ASSET_NODE' : 'INDIVIDUAL_NODE'}
                   </Badge>
                   <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-tighter">ID_{selectedItem.id}</span>
                </div>
              </div>

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
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 col-span-2">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Production Year</p>
                      <p className="text-sm font-black text-zinc-950 dark:text-white tabular-nums">{selectedItem.year || 'UNKNOWN'}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Age / Gender</p>
                      <p className="text-sm font-black text-zinc-950 dark:text-white tabular-nums">{selectedItem.age || '??'} • {selectedItem.gender || '??'}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Submission</p>
                      <p className="text-sm font-black text-zinc-950 dark:text-white tabular-nums">{selectedItem.verification_submitted_at ? new Date(selectedItem.verification_submitted_at).toLocaleDateString() : 'UNKNOWN'}</p>
                    </div>
                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 col-span-2 space-y-4">
                       <div className="flex items-center gap-4">
                          <Mail className="w-4 h-4 text-zinc-400" />
                          <div>
                             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Uplink</p>
                             <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{selectedItem.email}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <Phone className="w-4 h-4 text-zinc-400" />
                          <div>
                             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Voice Comms</p>
                             <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{selectedItem.phone_number || 'NOT_CONNECTED'}</p>
                          </div>
                       </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-4 pb-10">
                <Button
                  onClick={() => handleAction('approve', activeTab, selectedItem.id)}
                  disabled={isActionLoading}
                  className="flex-1 h-14 rounded-2xl shadow-xl shadow-zinc-200 dark:shadow-none text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <Check className="w-5 h-5 mr-2" /> Authorize
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction('reject', activeTab, selectedItem.id)}
                  disabled={isActionLoading}
                  className="flex-1 h-14 rounded-2xl shadow-xl shadow-zinc-200 dark:shadow-none text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <X className="w-5 h-5 mr-2" /> Terminate
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
