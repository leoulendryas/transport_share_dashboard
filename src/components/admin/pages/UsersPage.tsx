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
  RefreshCw
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
  }, [token, filterBanned]); // Search is handled by button or debounce if preferred, but for now let's use a refresh pattern or manual trigger

  useEffect(() => {
    if (selectedUserId && token) {
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
    const matchesSearch =
      (user.first_name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (user.last_name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (user.phone_number?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const columns = [
    {
      header: 'User',
      accessor: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{user.first_name} {user.last_name}</span>
              {user.is_admin && <Shield className="w-3 h-3 text-zinc-400" />}
            </div>
            <span className="text-[10px] text-zinc-500">ID: #{user.id}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: (user: User) => (
        <div className="flex flex-col">
          <span className="text-zinc-600 dark:text-zinc-400">{user.email}</span>
          <span className="text-[10px] text-zinc-500">{user.phone_number || 'No phone'}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (user: User) => (
        <Badge variant={user.banned ? 'error' : 'success'}>
          {user.banned ? 'Banned' : 'Active'}
        </Badge>
      )
    },
    {
      header: 'Verification',
      accessor: (user: User) => (
        <div className="flex gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${user.id_verified ? 'bg-zinc-950 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`} title="ID Verified" />
          <div className={`w-1.5 h-1.5 rounded-full ${user.license_verified ? 'bg-zinc-950 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`} title="License Verified" />
          <div className={`w-1.5 h-1.5 rounded-full ${user.email_verified ? 'bg-zinc-950 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`} title="Email Verified" />
        </div>
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
        <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-zinc-500 outline-none transition-all dark:text-zinc-200"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filterBanned}
            onChange={(e) => setFilterBanned(e.target.value as any)}
            className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-zinc-500 transition-all cursor-pointer dark:text-zinc-200"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="banned">Banned Only</option>
          </select>
          <Button variant="secondary" size="sm" onClick={fetchUsers}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-zinc-200 dark:border-zinc-800">
            {filteredUsers.length} Users
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredUsers} 
        loading={loading}
        onRowClick={(user) => setSelectedUserId(user.id)}
      />

      <Drawer
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        title="User Profile"
      >
        {loadingDetails ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <LoadingSpinner size="md" />
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">Loading info...</p>
          </div>
        ) : detailedUser ? (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-xl font-black text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                {detailedUser.first_name?.[0]}{detailedUser.last_name?.[0]}
              </div>
              <div>
                <h3 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">{detailedUser.first_name} {detailedUser.last_name}</h3>
                <p className="text-zinc-500 text-xs font-medium">{detailedUser.email}</p>
                <div className="mt-2">
                  <Badge variant={detailedUser.banned ? 'error' : 'success'}>
                    {detailedUser.banned ? 'Banned' : 'Active'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={detailedUser.is_admin ? 'primary' : 'secondary'}
                onClick={() => handleToggleAdmin(detailedUser)}
                disabled={isUpdating}
                className="w-full gap-2"
              >
                {detailedUser.is_admin ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                {detailedUser.is_admin ? 'Admin' : 'Make Admin'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleToggleBan(detailedUser)}
                disabled={isUpdating}
                className="w-full gap-2"
              >
                <Ban className="w-4 h-4" />
                {detailedUser.banned ? 'Unban' : 'Ban'}
              </Button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Member Level</label>
              <select
                disabled={isUpdating}
                value={detailedUser.member_level || 'standard'}
                onChange={(e) => handleMemberLevelChange(detailedUser.id, e.target.value)}
                className="w-full py-2 px-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-zinc-500 transition-all dark:text-zinc-200"
              >
                {MemberLevels.map(level => (
                  <option key={level} value={level}>{level.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-zinc-100 dark:border-zinc-900 pt-6">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Joined</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">{new Date(detailedUser.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Phone</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">{detailedUser.phone_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Age / Gender</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">{detailedUser.age || '?'} • {detailedUser.gender || '?'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Bank</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">{detailedUser.preferred_bank || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Vehicles ({detailedUser.vehicles?.length || 0})</h4>
              <div className="space-y-2">
                {detailedUser.vehicles?.map(v => (
                  <div key={v.id} className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700">
                      <Car className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{v.make} {v.model}</p>
                      <p className="text-[10px] text-zinc-500 font-medium uppercase">{v.license_plate}</p>
                    </div>
                    <Badge variant={v.is_verified ? 'success' : 'zinc'}>
                      {v.is_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recent Reviews</h4>
              <div className="space-y-4">
                {detailedUser.recentReviews?.map(r => (
                  <div key={r.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex text-zinc-950 dark:text-white">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-2.5 h-2.5 ${i < r.rating ? 'fill-current' : 'text-zinc-200 dark:text-zinc-800'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed italic">"{r.comment}"</p>
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
