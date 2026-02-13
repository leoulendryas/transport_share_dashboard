'use client';

import { useState } from 'react';
import { User } from '@/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Ban, UserCheck, UserX, Search, Mail, Phone, Calendar, Shield, MoreVertical, Eye, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toggleAdminStatus } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface UsersPageProps {
  users: User[];
  onBan: (userId: number) => Promise<void>;
  onUnban: (userId: number) => Promise<void>;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function UsersPage({ users, onBan, onUnban, onRefresh, loading = false }: UsersPageProps) {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBanned, setFilterBanned] = useState<'all' | 'banned' | 'active'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);

  const handleToggleAdmin = async (user: User) => {
    if (!token) return;
    const confirmMsg = user.is_admin 
      ? `Revoke admin privileges from ${user.first_name}?` 
      : `Grant admin privileges to ${user.first_name}?`;
      
    if (window.confirm(confirmMsg)) {
      setIsUpdatingAdmin(true);
      try {
        await toggleAdminStatus(token, user.id, !user.is_admin);
        if (onRefresh) onRefresh();
        setSelectedUser(prev => prev ? { ...prev, is_admin: !prev.is_admin } : null);
      } catch (error) {
        alert('Failed to update admin status');
      } finally {
        setIsUpdatingAdmin(false);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.first_name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (user.last_name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (user.phone_number?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterBanned === 'all' ? true :
      filterBanned === 'banned' ? user.banned :
      !user.banned;

    return matchesSearch && matchesFilter;
  });

  const handleBan = (user: User) => {
    if (window.confirm(`Are you sure you want to ban ${user.first_name} ${user.last_name}?`)) {
      onBan(user.id);
    }
  };

  const handleUnban = (user: User) => {
    if (window.confirm(`Are you sure you want to unban ${user.first_name} ${user.last_name}?`)) {
      onUnban(user.id);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 font-medium animate-pulse">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters Area */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={filterBanned}
              onChange={(e) => setFilterBanned(e.target.value as any)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="banned">Banned Only</option>
            </select>
            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold whitespace-nowrap">
              {filteredUsers.length} Users
            </div>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-x-auto">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <UserX className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Profile</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Verification</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user, idx) => (
                <tr 
                  key={user.id} 
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className="hover:bg-slate-50/80 transition-all group cursor-pointer animate-in fade-in slide-in-from-left-4 fill-mode-both"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 tracking-tight">{user.first_name} {user.last_name}</span>
                          {user.is_admin && <div className="px-1.5 py-0.5 bg-indigo-50 rounded-md"><Shield className="w-3 h-3 text-indigo-600" /></div>}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: #{user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-300" />
                        {user.phone_number}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      user.banned 
                        ? 'bg-rose-50 text-rose-600 border-rose-100' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {user.banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user.banned ? (
                        <button
                          onClick={() => handleUnban(user)}
                          className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm"
                          title="Unban User"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBan(user)}
                          className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"
                          title="Ban User"
                        >
                          <Ban className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modern Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="px-8 pb-8 -mt-12 relative">
              <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl mb-4">
                <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 border border-slate-100">
                  {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900">{selectedUser.first_name} {selectedUser.last_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">User Profile</span>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-sm font-bold text-blue-600">#{selectedUser.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-semibold text-slate-700">{selectedUser.email || 'None'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                  <p className="text-sm font-semibold text-slate-700">{selectedUser.phone_number || 'None'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bank Partner</p>
                  <p className="text-sm font-semibold text-slate-700">{selectedUser.preferred_bank || 'Not set'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account No.</p>
                  <p className="text-sm font-semibold text-slate-700 font-mono">{selectedUser.bank_account_number || '•••• ••••'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Join Date</p>
                  <p className="text-sm font-semibold text-slate-700">{new Date(selectedUser.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender / Age</p>
                  <p className="text-sm font-semibold text-slate-700">{selectedUser.gender || '?'}, {selectedUser.age || '?'}</p>
                </div>
              </div>

              <div className="flex gap-3 mb-8">
                <button
                  disabled={isUpdatingAdmin}
                  onClick={() => handleToggleAdmin(selectedUser)}
                  className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    selectedUser.is_admin 
                    ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                  }`}
                >
                  {selectedUser.is_admin ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  {selectedUser.is_admin ? 'Revoke Admin' : 'Make Admin'}
                </button>
                
                {selectedUser.banned ? (
                  <button
                    onClick={() => handleUnban(selectedUser)}
                    className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-900/20"
                  >
                    Unban User
                  </button>
                ) : (
                  <button
                    onClick={() => handleBan(selectedUser)}
                    className="flex-1 py-3 px-4 bg-rose-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-rose-900/20"
                  >
                    Ban User
                  </button>
                )}
              </div>

              {selectedUser.id_image_url && (
                <div className="mt-6">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Verification Document</p>
                  <div className="relative group rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                    <img src={selectedUser.id_image_url} alt="ID" className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="px-4 py-2 bg-white rounded-xl text-sm font-bold text-slate-900 shadow-xl">View Original</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}