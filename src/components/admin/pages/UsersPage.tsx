'use client';

import { useState, useEffect } from 'react';
import { User, DetailedUser } from '@/types/user';
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
  Hash
} from 'lucide-react';
import { getUsers, toggleAdminStatus, getUserById, updateMemberLevel, banUser, unbanUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const MemberLevels = ['standard', 'silver', 'gold', 'platinum'];

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBanned, setFilterBanned] = useState<'all' | 'banned' | 'active'>('all');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [detailedUser, setDetailedUser] = useState<DetailedUser | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getUsers(token, 1, 100, searchTerm || undefined, filterBanned === 'all' ? undefined : filterBanned === 'banned');
      setUsers(data.results);
    } catch (error) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, filterBanned]);

  useEffect(() => {
    if (selectedUserId !== null && token) {
      fetchUserDetails(selectedUserId);
    } else {
      setDetailedUser(null);
    }
  }, [selectedUserId, token]);

  const fetchUserDetails = async (userId: number) => {
    setLoadingDetails(true);
    try {
      const data = await getUserById(token!, userId);
      setDetailedUser(data);
    } catch (error) {
      console.error('Failed to fetch user details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleAdmin = async (user: User) => {
    if (!token) return;
    setIsUpdating(true);
    try {
      await toggleAdminStatus(token, user.id, !user.is_admin);
      if (detailedUser && detailedUser.id === user.id) {
        setDetailedUser({ ...detailedUser, is_admin: !user.is_admin });
      }
      fetchUsers();
    } catch (error) {
      alert('Failed to update admin status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleBan = async (user: User) => {
    if (!token) return;
    setIsUpdating(true);
    try {
      if (user.banned) {
        await unbanUser(token, user.id);
        if (detailedUser && detailedUser.id === user.id) {
          setDetailedUser({ ...detailedUser, banned: false });
        }
      } else {
        await banUser(token, user.id);
        if (detailedUser && detailedUser.id === user.id) {
          setDetailedUser({ ...detailedUser, banned: true });
        }
      }
      fetchUsers();
    } catch (error) {
      alert('Failed to update ban status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMemberLevelChange = async (userId: number, level: string) => {
    if (!token) return;
    setIsUpdating(true);
    try {
      await updateMemberLevel(token, userId, level);
      if (detailedUser && detailedUser.id === userId) {
        setDetailedUser({ ...detailedUser, member_level: level });
      }
      fetchUsers();
    } catch (error) {
      alert('Failed to update member level');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchStr = searchTerm.toLowerCase();
    return (
      (user.first_name?.toLowerCase() ?? '').includes(searchStr) ||
      (user.last_name?.toLowerCase() ?? '').includes(searchStr) ||
      (user.email?.toLowerCase() ?? '').includes(searchStr) ||
      (user.phone_number?.toLowerCase() ?? '').includes(searchStr) ||
      user.id.toString().includes(searchStr)
    );
  });

  const columns = [
    {
      header: 'User Profile',
      accessor: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[11px] font-black text-zinc-500 border border-zinc-200 dark:border-zinc-800">
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{user.first_name} {user.last_name}</span>
              {user.is_admin && <Badge variant="zinc" className="h-4 px-1.5 text-[8px] bg-zinc-950 text-white border-none">ADMIN</Badge>}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] text-zinc-400 font-mono font-bold tracking-tighter">ID: {user.id}</span>
               <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
               <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{user.member_level || 'standard'}</span>
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
        </div>
      )
    },
    {
      header: 'Member Since',
      accessor: (user: User) => (
        <span className="text-zinc-500 font-medium tabular-nums">
          {new Date(user.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (user: User) => (
        <Badge variant={user.banned ? 'error' : 'success'}>
          {user.banned ? 'Suspended' : 'Active'}
        </Badge>
      )
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
          <Button variant="secondary" size="md" onClick={fetchUsers} className="rounded-xl">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredUsers} 
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
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center text-2xl font-black shadow-2xl shadow-zinc-200 dark:shadow-none">
                {detailedUser.first_name?.[0]}{detailedUser.last_name?.[0]}
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tighter">{detailedUser.first_name} {detailedUser.last_name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={detailedUser.banned ? 'error' : 'success'}>
                    {detailedUser.banned ? 'Suspended' : 'Active Account'}
                  </Badge>
                  <span className="text-[10px] font-mono font-black text-zinc-400">NODE_{detailedUser.id}</span>
                </div>
              </div>
            </div>

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

            <div className="space-y-6">
               <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6">
                  <div className="flex items-start gap-4">
                     <Mail className="w-4 h-4 text-zinc-400 mt-1" />
                     <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Email Protocol</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{detailedUser.email}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                           {detailedUser.email_verified ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-zinc-300" />}
                           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{detailedUser.email_verified ? 'Verified Address' : 'Unverified Address'}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-start gap-4">
                     <Phone className="w-4 h-4 text-zinc-400 mt-1" />
                     <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Mobile Uplink</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{detailedUser.phone_number || 'STATIONARY_NODE'}</p>
                     </div>
                  </div>

                  <div className="flex items-start gap-4">
                     <Hash className="w-4 h-4 text-zinc-400 mt-1" />
                     <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Global ID</p>
                        <p className="text-sm font-mono font-black text-zinc-900 dark:text-zinc-100">#{detailedUser.id}</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Member Level</p>
                     <select
                        disabled={isUpdating}
                        value={detailedUser.member_level || 'standard'}
                        onChange={(e) => handleMemberLevelChange(detailedUser.id, e.target.value)}
                        className="w-full bg-transparent text-xs font-black text-zinc-950 dark:text-white uppercase tracking-wider outline-none cursor-pointer"
                     >
                        {MemberLevels.map(level => (
                           <option key={level} value={level} className="bg-white dark:bg-zinc-950">{level}</option>
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

               <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Fingerprint className="w-5 h-5 text-zinc-400" />
                     <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ID Verification</p>
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{detailedUser.id_verified ? 'AUTHORIZED' : 'PENDING_REVIEW'}</p>
                     </div>
                  </div>
                  <Badge variant={detailedUser.id_verified ? 'success' : 'zinc'}>
                     {detailedUser.id_verified ? 'MATCH' : 'VOID'}
                  </Badge>
               </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Car className="w-3.5 h-3.5" /> Registered Assets ({detailedUser.vehicles?.length || 0})
              </h4>
              <div className="space-y-2">
                {detailedUser.vehicles?.length === 0 ? (
                   <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest py-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">No assets linked to node</p>
                ) : detailedUser.vehicles?.map(v => (
                  <div key={v.id} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                      <Car className="w-4 h-4 text-zinc-900 dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-zinc-950 dark:text-white uppercase tracking-tight">{v.make} {v.model}</p>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{v.license_plate} • {v.color}</p>
                    </div>
                    <Badge variant={v.is_verified ? 'success' : 'zinc'}>
                      {v.is_verified ? 'AUTH' : 'PEND'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Star className="w-3.5 h-3.5" /> Reputation Log
              </h4>
              <div className="space-y-6">
                {detailedUser.recentReviews?.length === 0 ? (
                   <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest py-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">No reputation data found</p>
                ) : detailedUser.recentReviews?.map(r => (
                  <div key={r.id} className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-2.5 h-2.5 ${i < r.rating ? 'fill-zinc-950 text-zinc-950 dark:fill-white dark:text-white' : 'text-zinc-200 dark:text-zinc-800'}`} />
                        ))}
                      </div>
                      <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors">
                       <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium italic">"{r.comment}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
