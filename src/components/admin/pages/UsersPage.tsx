import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { 
  AdminUser as User, 
  UserDetail as DetailedUser, 
  Company,
  MemberLevel
} from '@/types/admin';
import { 
  Ban, 
  Search, 
  Shield, 
  ShieldAlert, 
  ShieldCheck,
  Eye,
  Car,
  Star,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Fingerprint,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Hash,
  AlertCircle,
  Activity,
  Key,
  ExternalLink,
  Info,
  DollarSign,
  Building2,
  Clock
} from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import { companiesApi } from '@/lib/api/companies';
import { verificationsApi } from '@/lib/api/verifications';
import { licensesApi } from '@/lib/api/licenses';
import { vehiclesApi } from '@/lib/api/vehicles';
import { extractError } from '@/lib/api/errors';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const MemberLevels: MemberLevel[] = ['Standard', 'Premium', 'Elite'];

const getMemberLevelColor = (level?: string) => {
  switch (level?.toLowerCase()) {
    case 'standard': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'premium': return 'bg-amber-50 text-amber-600 border-amber-200'; // Gold
    case 'elite': return 'bg-purple-50 text-purple-600 border-purple-100';
    default: return 'bg-zinc-100 text-zinc-500 border-zinc-200';
  }
};

const getPreferenceLabel = (key: string, value: number) => {
  const labels: Record<string, string[]> = {
    chattiness_pref: ['Silent', 'Quiet', 'Neutral', 'Chatty', 'Very social'],
    music_pref: ['No music', 'Soft music', 'Neutral', 'Loud music', 'Any music'],
    smoking_pref: ['No smoking', 'Tolerant', 'Neutral', 'Tolerant', 'OK with smoking'],
    pets_pref: ['No pets', 'Tolerant', 'Neutral', 'Tolerant', 'OK with pets'],
    social_vibe: ['Introverted', 'Quiet', 'Neutral', 'Outgoing', 'Very social']
  };
  return labels[key]?.[value - 1] || 'Neutral';
};

const formatRelativeTime = (dateString: string | null) => {
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

const isCurrentlySuspended = (user: User): boolean =>
  user.suspended_until !== null && user.suspended_until !== undefined && new Date(user.suspended_until) > new Date();

export default function UsersPage() {
  const { admin } = useAuth();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBanned, setFilterBanned] = useState<'all' | 'banned' | 'active'>('all');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [rejectionModal, setRejectionModal] = useState<{ open: boolean, type: 'id' | 'license' | 'vehicle', id: number | null }>({ open: false, type: 'id', id: null });
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: usersData, mutate: mutateUsers, isLoading: loading } = useSWR(
    admin ? ['users', searchTerm, filterBanned] : null,
    () => usersApi.list({
      search: searchTerm || undefined,
      banned: filterBanned === 'all' ? undefined : filterBanned === 'banned',
      limit: 100
    })
  );

  const users = usersData?.results || [];

  const { data: detailedUser, mutate: mutateDetails, isLoading: loadingDetails } = useSWR(
    admin && selectedUserId ? ['users', selectedUserId] : null,
    () => usersApi.get(selectedUserId!)
  );

  const { data: companiesData } = useSWR(
    admin ? 'companies' : null,
    () => companiesApi.list()
  );

  const companies = companiesData || [];

  const handleToggleAdmin = async (user: User) => {
    if (!admin) return;
    setIsUpdating(true);
    try {
      await usersApi.toggleAdmin(user.id, !user.is_admin);
      addNotification('success', 'Permissions Updated', `${user.first_name}'s administrative status changed.`);
      mutateUsers();
      if (selectedUserId === user.id) mutateDetails();
    } catch (error) {
      addNotification('warning', 'Update Failed', extractError(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleBan = async (user: User) => {
    if (!admin) return;
    setIsUpdating(true);
    try {
      if (user.banned) {
        await usersApi.unban(user.id);
        addNotification('success', 'Node Restored', `${user.first_name}'s access has been reactivated.`);
      } else {
        await usersApi.ban(user.id);
        addNotification('success', 'Node Suspended', `${user.first_name}'s access has been terminated.`);
      }
      mutateUsers();
      if (selectedUserId === user.id) mutateDetails();
    } catch (error) {
      addNotification('warning', 'State Update Failed', extractError(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnsuspend = async (userId: number) => {
    if (!admin) return;
    setIsUpdating(true);
    try {
      await usersApi.unsuspend(userId);
      addNotification('success', 'Suspension Lifted', 'User suspension has been cleared.');
      mutateUsers();
      if (selectedUserId === userId) mutateDetails();
    } catch (error) {
      addNotification('warning', 'Update Failed', extractError(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApprove = async (type: 'id' | 'license' | 'vehicle', id: number) => {
    if (!admin) return;
    setIsUpdating(true);
    try {
      if (type === 'id') await verificationsApi.approve(id);
      else if (type === 'license') await licensesApi.approve(id);
      else if (type === 'vehicle') await vehiclesApi.approve(id);
      
      addNotification('success', 'Protocol Authorized', `${type.toUpperCase()} evidence approved.`);
      mutateUsers();
      if (selectedUserId) mutateDetails();
    } catch (error) {
      addNotification('warning', 'Auth Failure', extractError(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = (type: 'id' | 'license' | 'vehicle', id: number) => {
    setRejectionModal({ open: true, type, id });
  };

  const submitRejection = async () => {
    if (!admin || !rejectionModal.id || !rejectionReason.trim()) return;
    setIsUpdating(true);
    try {
      if (rejectionModal.type === 'id') await verificationsApi.reject(rejectionModal.id, rejectionReason);
      else if (rejectionModal.type === 'license') await licensesApi.reject(rejectionModal.id, rejectionReason);
      else if (rejectionModal.type === 'vehicle') await vehiclesApi.reject(rejectionModal.id, rejectionReason);
      
      addNotification('success', 'Protocol Terminated', `${rejectionModal.type.toUpperCase()} evidence rejected.`);
      setRejectionModal({ open: false, type: 'id', id: null });
      setRejectionReason('');
      mutateUsers();
      if (selectedUserId) mutateDetails();
    } catch (error) {
      addNotification('warning', 'Action Failed', extractError(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMemberLevelChange = async (userId: number, level: string) => {
    if (!admin) return;
    setIsUpdating(true);
    try {
      await usersApi.updateMemberLevel(userId, level as MemberLevel);
      mutateUsers();
      if (selectedUserId === userId) mutateDetails();
    } catch (error) {
      addNotification('warning', 'Update Failed', extractError(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const columns = [
    {
      header: 'User Profile',
      accessor: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[11px] font-black text-zinc-500 border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
            {user.profile_photo ? (
              <img src={user.profile_photo} alt="P" className="w-full h-full object-cover" />
            ) : (
              `${user.first_name?.[0] || '?'}${user.last_name?.[0] || '?'}`
            )}
            {user.oauth_provider === 'google' && (
               <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-white border border-zinc-200 rounded-full flex items-center justify-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
               </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{user.first_name || (user.email ? user.email.split('@')[0] : 'USER')} {user.last_name}</span>
              {user.is_admin && <Badge variant="zinc" className="h-4 px-1.5 text-[8px] bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">ADMIN</Badge>}
              {user.is_driver && <Badge variant="zinc" className="h-4 px-1.5 text-[8px] bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"><Car className="w-2 h-2 mr-1" /> DRIVER</Badge>}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] text-zinc-400 font-mono font-bold tracking-tighter">NODE_{user.id}</span>
               <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
               <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${getMemberLevelColor(user.member_level)}`}>
                 {user.member_level || 'Newcomer'}
               </span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Security',
      accessor: (user: User) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
             <div className={`w-1.5 h-1.5 rounded-full ${user.email_verified ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Email</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className={`w-1.5 h-1.5 rounded-full ${user.id_verified ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Identity</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className={`w-1.5 h-1.5 rounded-full ${user.license_verified ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">License</span>
          </div>
        </div>
      )
    },
    {
      header: 'Finance',
      accessor: (user: User) => (
        <div className="flex flex-col gap-0.5">
           {user.preferred_bank ? (
             <>
               <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter flex items-center gap-1">
                 <Building2 className="w-2.5 h-2.5 text-emerald-500" /> {user.preferred_bank}
               </span>
               <span className="text-[9px] text-zinc-400 font-mono tabular-nums">{user.bank_account_number}</span>
             </>
           ) : (
             <span className="text-[9px] text-zinc-300 font-black uppercase tracking-widest italic">No Payout Data</span>
           )}
        </div>
      )
    },
    {
      header: 'Activity',
      accessor: (user: User) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 tabular-nums uppercase tracking-tight flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-zinc-400" /> {formatRelativeTime(user.last_login)}
            </span>
            {user.cancellation_count && user.cancellation_count > 5 && (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">Joined: {new Date(user.created_at).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (user: User) => {
        const suspended = isCurrentlySuspended(user);
        return (
          <div className="flex flex-col gap-1 items-start">
            <Badge variant={user.banned ? 'error' : suspended ? 'warning' : 'success'}>
              {user.banned ? 'Terminated' : suspended ? 'Suspended' : 'Synchronized'}
            </Badge>
            {suspended && (
              <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Until {new Date(user.suspended_until!).toLocaleDateString()}</span>
            )}
          </div>
        );
      }
    },
    {
      header: '',
      accessor: (user: User) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setSelectedUserId(user.id)}>
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="p-8 space-y-6 bg-white dark:bg-zinc-950 min-h-full">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search by name, email, ID or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white outline-none transition-all dark:text-zinc-200"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filterBanned}
            onChange={(e) => setFilterBanned(e.target.value as any)}
            className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all cursor-pointer dark:text-zinc-200"
          >
            <option value="all">All Accounts</option>
            <option value="active">Active Only</option>
            <option value="banned">Suspended Only</option>
          </select>
          <Button variant="secondary" size="md" onClick={() => mutateUsers()} className="rounded-xl">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        loading={loading}
        onRowClick={(user) => setSelectedUserId(user.id)}
      />

      <Drawer
        isOpen={selectedUserId !== null}
        onClose={() => setSelectedUserId(null)}
        title="Account Intelligence"
      >
        {loadingDetails ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <LoadingSpinner size="lg" />
            <div className="text-center space-y-1">
               <p className="text-zinc-950 dark:text-white text-xs font-black uppercase tracking-[0.2em]">Processing Request</p>
               <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Retrieving node data</p>
            </div>
          </div>
        ) : detailedUser ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-xl font-black text-zinc-500 border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
                {detailedUser.profile_photo ? (
                  <img src={detailedUser.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  `${detailedUser.first_name?.[0] || '?'}${detailedUser.last_name?.[0] || '?'}`
                )}
                {detailedUser.oauth_provider === 'google' && (
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-zinc-100">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tighter">{detailedUser.first_name || (detailedUser.email ? detailedUser.email.split('@')[0] : 'USER')} {detailedUser.last_name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={detailedUser.banned ? 'error' : isCurrentlySuspended(detailedUser) ? 'warning' : 'success'}>
                    {detailedUser.banned ? 'Terminated Account' : isCurrentlySuspended(detailedUser) ? 'Suspended Node' : 'Active Account'}
                  </Badge>
                  <span className="text-[10px] font-mono font-black text-zinc-400 uppercase">NODE_{detailedUser.id}</span>
                </div>
              </div>
            </div>

            {isCurrentlySuspended(detailedUser) && (
               <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-100 dark:border-amber-900/50 rounded-3xl space-y-4">
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600">
                        <AlertCircle className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Active Suspension</p>
                        <p className="text-sm font-bold text-zinc-950 dark:text-white">Ends: {new Date(detailedUser.suspended_until!).toLocaleString()}</p>
                        <p className="text-xs text-zinc-500 mt-1 font-medium">{detailedUser.suspension_reason || 'No reason provided'}</p>
                     </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={() => handleUnsuspend(detailedUser.id)}
                    disabled={isUpdating}
                    className="w-full h-10 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-zinc-900"
                  >
                    Lift Suspension
                  </Button>
               </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={detailedUser.is_admin ? 'primary' : 'secondary'}
                onClick={() => handleToggleAdmin(detailedUser)}
                disabled={isUpdating}
                className="w-full h-12 gap-2 text-[10px] font-black uppercase tracking-widest"
              >
                {detailedUser.is_admin ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                {detailedUser.is_admin ? 'Revoke Admin' : 'Grant Admin'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleToggleBan(detailedUser)}
                disabled={isUpdating}
                className="w-full h-12 gap-2 text-[10px] font-black uppercase tracking-widest"
              >
                <Ban className="w-4 h-4" />
                {detailedUser.banned ? 'Restore Access' : 'Suspend Node'}
              </Button>
            </div>

            {detailedUser.intelligence_audit && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Intelligence Audit</p>
                <div className="grid grid-cols-1 gap-3">
                  {detailedUser.intelligence_audit.has_suspicious_cancellations && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">High cancellation rate detected (&gt;5)</p>
                    </div>
                  )}
                  {detailedUser.intelligence_audit.potential_conflicts.length > 0 && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-500" />
                      <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Suspicious overlapping bookings detected ({detailedUser.intelligence_audit.potential_conflicts.length})</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-6">
               <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6">
                  <div className="flex items-start gap-4">
                     <Mail className="w-4 h-4 text-zinc-400 mt-1" />
                     <div className="flex-1">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Email Protocol</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{detailedUser.email}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                           {detailedUser.email_verified ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-zinc-300" />}
                           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{detailedUser.email_verified ? 'Verified Address' : 'Unverified Address'}</span>
                        </div>
                     </div>
                  </div>

                  {detailedUser.phone_number && (
                    <div className="flex items-start gap-4">
                       <Phone className="w-4 h-4 text-zinc-400 mt-1" />
                       <div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Mobile Uplink</p>
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{detailedUser.phone_number}</p>
                       </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                     <Hash className="w-4 h-4 text-zinc-400 mt-1" />
                     <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Global ID</p>
                        <p className="text-sm font-mono font-black text-zinc-900 dark:text-zinc-100">#{detailedUser.id}</p>
                     </div>
                  </div>

                  {detailedUser.bio && (
                    <div className="flex items-start gap-4">
                       <Info className="w-4 h-4 text-zinc-400 mt-1" />
                       <div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Bio / Intel</p>
                          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed italic">"{detailedUser.bio}"</p>
                       </div>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Member Level</p>
                     <select
                        disabled={isUpdating}
                        value={detailedUser.member_level || 'Newcomer'}
                        onChange={(e) => handleMemberLevelChange(detailedUser.id, e.target.value)}
                        className={`w-full bg-transparent text-xs font-black uppercase tracking-wider outline-none cursor-pointer ${getMemberLevelColor(detailedUser.member_level)} px-2 py-1 rounded-lg border`}
                     >
                        {MemberLevels.map(level => (
                           <option key={level} value={level} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">{level}</option>
                        ))}
                     </select>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Join Sequence</p>
                     <p className="text-xs font-black text-zinc-950 dark:text-white uppercase tracking-wider tabular-nums">
                        {new Date(detailedUser.created_at).toLocaleDateString()}
                     </p>
                  </div>
               </div>

               <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-zinc-400" />
                        <div>
                           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Activity</p>
                           <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{detailedUser.last_login ? new Date(detailedUser.last_login).toLocaleString() : 'VOID'}</p>
                        </div>
                     </div>
                     <Badge variant="zinc" className="h-5 px-2 text-[8px] font-black uppercase">{formatRelativeTime(detailedUser.last_login)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Fingerprint className="w-5 h-5 text-zinc-400" />
                        <div>
                           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Identity Auth</p>
                           <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{detailedUser.id_verified ? 'MATCH_SUCCESS' : 'PENDING_SCAN'}</p>
                        </div>
                     </div>
                     <Badge variant={detailedUser.id_verified ? 'success' : 'zinc'}>
                        {detailedUser.id_verified ? 'VERIFIED' : 'VOID'}
                     </Badge>
                  </div>
               </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" /> ID Credential Evidence
                </h4>
                {detailedUser.id_verified ? (
                  <Badge variant="success" className="text-[8px] h-4">VERIFIED</Badge>
                ) : (
                  <Badge variant="warning" className="text-[8px] h-4">PENDING</Badge>
                )}
              </div>
               <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200 dark:shadow-none group">
                 {detailedUser.id_image_url ? (
                   <img src={detailedUser.id_image_url} alt="ID Evidence" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-4">
                     <AlertCircle className="w-12 h-12 opacity-10" />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-center px-10">ID evidence not found in secure storage</p>
                   </div>
                 )}
                 {detailedUser.id_image_url && (
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <a 
                        href={detailedUser.id_image_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-6 py-3 bg-white text-zinc-950 rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <ExternalLink className="w-4 h-4" /> Open Original Evidence
                      </a>
                   </div>
                 )}
               </div>
               {detailedUser.rejection_reason && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl">
                    <p className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Previous Rejection Protocol</p>
                    <p className="text-[10px] font-bold text-rose-500">{detailedUser.rejection_reason}</p>
                  </div>
               )}
               {!detailedUser.id_verified && detailedUser.id_image_url && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove('id', detailedUser.id)} disabled={isUpdating} size="sm" className="flex-1 text-[9px] font-black uppercase tracking-widest h-10">Authorize Identity</Button>
                    <Button variant="destructive" onClick={() => handleReject('id', detailedUser.id)} disabled={isUpdating} size="sm" className="flex-1 text-[9px] font-black uppercase tracking-widest h-10">Terminate Identity</Button>
                  </div>
               )}
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Driving License Protocol
                </h4>
                {detailedUser.license_verified ? (
                  <Badge variant="success" className="text-[8px] h-4">VERIFIED</Badge>
                ) : (
                  <Badge variant="warning" className="text-[8px] h-4">PENDING</Badge>
                )}
              </div>
               <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200 dark:shadow-none group">
                 {detailedUser.driving_license_url ? (
                   <img src={detailedUser.driving_license_url} alt="License Evidence" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-4">
                     <AlertCircle className="w-12 h-12 opacity-10" />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-center px-10">License evidence not found in secure storage</p>
                   </div>
                 )}
                 {detailedUser.driving_license_url && (
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <a 
                        href={detailedUser.driving_license_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-6 py-3 bg-white text-zinc-950 rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <ExternalLink className="w-4 h-4" /> Open Original Evidence
                      </a>
                   </div>
                 )}
               </div>
               {!detailedUser.license_verified && detailedUser.driving_license_url && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove('license', detailedUser.id)} disabled={isUpdating} size="sm" className="flex-1 text-[9px] font-black uppercase tracking-widest h-10">Authorize License</Button>
                    <Button variant="destructive" onClick={() => handleReject('license', detailedUser.id)} disabled={isUpdating} size="sm" className="flex-1 text-[9px] font-black uppercase tracking-widest h-10">Terminate License</Button>
                  </div>
               )}
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Car className="w-3.5 h-3.5" /> Registered Assets ({detailedUser.vehicles?.length || 0})
              </h4>
              <div className="space-y-4">
                {detailedUser.vehicles?.length === 0 ? (
                   <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest py-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">No assets linked to node</p>
                ) : detailedUser.vehicles?.map(v => (
                  <div key={v.id} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                        <Car className="w-4 h-4 text-zinc-900 dark:text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                           <p className="text-xs font-black text-zinc-950 dark:text-white uppercase tracking-tight">{v.make} {v.model} ({v.year || '?'})</p>
                           {v.company_id && (
                             <Badge variant="zinc" className="h-4 px-1.5 text-[7px] font-black uppercase bg-zinc-950 text-white border-none">
                                {companies.find(c => c.id === v.company_id)?.name || 'Fleet'}
                             </Badge>
                           )}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{v.license_plate} • {v.color}</p>
                      </div>
                      <Badge variant={v.is_verified ? 'success' : 'zinc'}>
                        {v.verification_status || 'PEND'}
                      </Badge>
                    </div>
                    
                    {v.registration_doc_url && (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 group/img">
                        <img src={v.registration_doc_url} alt="Doc" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                           <a href={v.registration_doc_url} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-lg text-zinc-950 shadow-xl scale-90 group-hover/img:scale-100 transition-transform">
                             <ExternalLink className="w-4 h-4" />
                           </a>
                        </div>
                      </div>
                    )}

                    {v.verification_status === 'pending' && (
                       <div className="flex gap-2">
                          <Button onClick={() => handleApprove('vehicle', v.id)} disabled={isUpdating} size="sm" className="flex-1 text-[9px] font-black uppercase tracking-widest h-9">Approve Registry</Button>
                          <Button variant="destructive" onClick={() => handleReject('vehicle', v.id)} disabled={isUpdating} size="sm" className="flex-1 text-[9px] font-black uppercase tracking-widest h-9">Reject Registry</Button>
                       </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {detailedUser.is_driver && (detailedUser.preferred_bank || detailedUser.bank_account_number) && (
              <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" /> Payout Configuration
                </h4>
                <div className="p-6 bg-emerald-50/30 dark:bg-emerald-950/10 border-2 border-emerald-100/50 dark:border-emerald-900/20 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Financial Institution</p>
                      <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                         <Building2 className="w-4 h-4" /> {detailedUser.preferred_bank || 'NOT_SPECIFIED'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Account Number</p>
                    <p className="text-sm font-mono font-black text-zinc-900 dark:text-white tracking-widest">{detailedUser.bank_account_number || 'VOID'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Behavioral Preferences
              </h4>
              <div className="grid grid-cols-2 gap-3">
                 {[
                   { label: 'Social Vibe', value: detailedUser.social_vibe, key: 'social_vibe' },
                   { label: 'Chattiness', value: detailedUser.chattiness_pref, key: 'chattiness_pref' },
                   { label: 'Music Pref', value: detailedUser.music_pref, key: 'music_pref' },
                   { label: 'Smoking Pref', value: detailedUser.smoking_pref, key: 'smoking_pref' },
                   { label: 'Pets Pref', value: detailedUser.pets_pref, key: 'pets_pref' },
                 ].map((pref, idx) => (
                   <div key={idx} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">{pref.label}</p>
                      <div className="flex gap-1 mb-2">
                         {[1,2,3,4,5].map(v => (
                           <div key={v} className={`h-1.5 flex-1 rounded-full ${v <= (pref.value || 3) ? 'bg-zinc-950 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                         ))}
                      </div>
                      <p className="text-[9px] font-bold text-zinc-500 uppercase">{getPreferenceLabel(pref.key, pref.value || 3)}</p>
                   </div>
                 ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Star className="w-3.5 h-3.5" /> Recent Node Evaluations ({detailedUser.recentReviews?.length || 0})
              </h4>
              <div className="space-y-3">
                 {detailedUser.recentReviews?.length === 0 ? (
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest py-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">No evaluations recorded</p>
                 ) : detailedUser.recentReviews?.map(review => (
                   <div key={review.id} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 uppercase">{review.reviewer_name || 'Anonymous'}</p>
                        <div className="flex items-center gap-0.5">
                           {Array.from({ length: 5 }).map((_, i) => (
                             <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />
                           ))}
                        </div>
                      </div>
                      <p className="text-[10px] font-medium text-zinc-500 leading-relaxed italic">"{review.comment}"</p>
                      <p className="text-[8px] text-zinc-400 font-bold mt-2 uppercase tabular-nums">{new Date(review.created_at).toLocaleDateString()}</p>
                   </div>
                 ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Active Trajectories ({detailedUser.recentRides?.length || 0})
              </h4>
              <div className="space-y-3 pb-10">
                 {detailedUser.recentRides?.length === 0 ? (
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest py-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">No mission history</p>
                 ) : detailedUser.recentRides?.map(ride => (
                   <div key={ride.id} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-black text-zinc-950 dark:text-white uppercase">RIDE_{ride.id}</p>
                         <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{ride.from_address.split(',')[0]} → {ride.to_address.split(',')[0]}</p>
                      </div>
                      <Badge variant={ride.status === 'completed' ? 'success' : 'zinc'}>{ride.status}</Badge>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>

      <Modal
        isOpen={rejectionModal.open}
        onClose={() => {
          setRejectionModal({ open: false, type: 'id', id: null });
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
              Specify the reason for rejecting this {rejectionModal.type} protocol. This message will be logged in the system audit trail.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Rejection Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Document is unreadable or expired."
              className="w-full h-32 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setRejectionModal({ open: false, type: 'id', id: null });
                setRejectionReason('');
              }}
              className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              Abort
            </Button>
            <Button
              variant="destructive"
              onClick={submitRejection}
              disabled={isUpdating || !rejectionReason.trim()}
              className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200 dark:shadow-none"
            >
              {isUpdating ? <LoadingSpinner /> : 'Confirm Termination'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
