'use client';

import { useState, useEffect } from 'react';
import { User, Vehicle } from '@/types/user';
import { 
  Check, 
  X, 
  Eye, 
  ExternalLink,
  FileText,
  AlertCircle
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
      reason = window.prompt('Please enter a reason for rejection:') || '';
      if (reason === null) return;
    }

    setIsActionLoading(true);
    try {
      if (itemType === 'id') {
        if (type === 'approve') await verifyUserID(token, id);
        else await rejectVerification(token, id, reason);
      } else if (itemType === 'license') {
        if (type === 'approve') await approveLicense(token, id);
        else await rejectVerification(token, id, reason);
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
      header: 'User',
      accessor: (v: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            {v.first_name?.[0]}{v.last_name?.[0]}
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{v.first_name} {v.last_name}</p>
            <p className="text-[10px] text-zinc-500">{v.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Submitted',
      accessor: (v: User) => (
        <span className="text-zinc-500">
          {v.verification_submitted_at ? new Date(v.verification_submitted_at).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: () => <Badge variant="warning">Pending ID</Badge>
    },
    {
      header: '',
      accessor: (v: User) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setSelectedItem(v)}>
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  const vehicleColumns = [
    {
      header: 'Vehicle',
      accessor: (v: Vehicle) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <FileText className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{v.make} {v.model}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{v.license_plate}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Owner',
      accessor: (v: Vehicle) => (
        <div className="flex flex-col">
          <span className="text-zinc-900 dark:text-zinc-100">{v.first_name} {v.last_name}</span>
          <span className="text-[10px] text-zinc-500">{v.owner_email}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: () => <Badge variant="warning">Pending Vehicle</Badge>
    },
    {
      header: '',
      accessor: (v: Vehicle) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setSelectedItem(v)}>
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
            className={`px-6 pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
              activeTab === tab 
              ? 'text-zinc-950 dark:text-white' 
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
            }`}
          >
            {tab} Verifications
            {activeTab === tab && (
              <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-zinc-950 dark:bg-white" />
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
            emptyMessage="No pending ID verifications"
          />
        )}
        {activeTab === 'license' && (
          <DataTable 
            columns={idColumns} 
            data={licenseVerifications} 
            loading={loading}
            onRowClick={(v) => setSelectedItem(v)}
            emptyMessage="No pending license verifications"
          />
        )}
        {activeTab === 'vehicles' && (
          <DataTable 
            columns={vehicleColumns} 
            data={vehicleVerifications} 
            loading={loading}
            onRowClick={(v) => setSelectedItem(v)}
            emptyMessage="No pending vehicle verifications"
          />
        )}
      </div>

      <Drawer
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Verification Details"
      >
        {selectedItem && (
          <div className="space-y-8">
            <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              {activeTab === 'id' && selectedItem.id_image_url ? (
                <img src={selectedItem.id_image_url} alt="ID" className="w-full h-full object-cover" />
              ) : activeTab === 'license' && selectedItem.driving_license_url ? (
                <img src={selectedItem.driving_license_url} alt="License" className="w-full h-full object-cover" />
              ) : activeTab === 'vehicles' && selectedItem.registration_doc_url ? (
                <img src={selectedItem.registration_doc_url} alt="Registration" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
                  <AlertCircle className="w-8 h-8 opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">No Image Available</p>
                </div>
              )}
              
              <div className="absolute top-4 right-4">
                <a 
                  href={selectedItem.id_image_url || selectedItem.driving_license_url || selectedItem.registration_doc_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 bg-white/90 dark:bg-zinc-950/90 rounded-xl shadow-lg text-zinc-900 dark:text-white hover:scale-105 transition-transform"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">
                  {activeTab === 'vehicles' ? `${selectedItem.make} ${selectedItem.model}` : `${selectedItem.first_name} ${selectedItem.last_name}`}
                </h3>
                <p className="text-zinc-500 text-xs font-medium">
                  {activeTab === 'vehicles' ? `Owner: ${selectedItem.first_name} ${selectedItem.last_name}` : selectedItem.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 py-6 border-y border-zinc-100 dark:border-zinc-900">
                {activeTab === 'vehicles' ? (
                  <>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Plate</p>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 uppercase">{selectedItem.license_plate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Color</p>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">{selectedItem.color}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Age / Gender</p>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">{selectedItem.age || '?'} • {selectedItem.gender || '?'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Phone</p>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">{selectedItem.phone_number || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleAction('approve', activeTab, selectedItem.id)}
                  disabled={isActionLoading}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" /> Approve
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleAction('reject', activeTab, selectedItem.id)}
                  disabled={isActionLoading}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" /> Reject
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
