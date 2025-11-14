'use client';

import { useState } from 'react';
import { User } from '@/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Ban, UserCheck, UserX, Search } from 'lucide-react';

interface UsersPageProps {
  users: User[];
  onBan: (userId: number) => Promise<void>; // Changed from (userId: number, banned: boolean)
  onUnban: (userId: number) => Promise<void>; // Add this prop
  loading?: boolean;
}

export default function UsersPage({ users, onBan, onUnban, loading = false }: UsersPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBanned, setFilterBanned] = useState<'all' | 'banned' | 'active'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredUsers.length} of {users.length} users
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterBanned}
          onChange={(e) => setFilterBanned(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Users</option>
          <option value="active">Active Only</option>
          <option value="banned">Banned Only</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserX className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterBanned !== 'all' ? 'Try adjusting your search or filter' : 'No users in the system'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.first_name?.[0] ?? ''}{user.last_name?.[0] ?? ''}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                            {user.is_admin && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email || 'No email'}</div>
                      <div className="text-sm text-gray-500">{user.phone_number || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.banned 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.id_verified 
                            ? 'bg-green-100 text-green-800' 
                            : user.id_image_url
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.id_verified ? 'Verified' : user.id_image_url ? 'Pending' : 'Not Submitted'}
                        </span>
                        <div className="flex gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                            user.email_verified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            Email: {user.email_verified ? '✓' : '✗'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                            user.phone_verified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            Phone: {user.phone_verified ? '✓' : '✗'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.banned ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUnban(user); }}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded bg-green-100 text-green-700 hover:bg-green-200"
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBan(user); }}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          <Ban className="h-3 w-3 mr-1" />
                          Ban
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 max-h-[90vh] overflow-y-auto p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg font-bold"
            >
              ✕
            </button>
      
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                {selectedUser.first_name?.[0] ?? ''}{selectedUser.last_name?.[0] ?? ''}
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">{selectedUser.first_name} {selectedUser.last_name}</h3>
            </div>
      
            {/* User Details */}
            <div className="space-y-3 text-sm text-gray-700">
              <p><span className="font-medium">ID:</span> {selectedUser.id}</p>
              <p><span className="font-medium">Email:</span> {selectedUser.email || 'N/A'}</p>
              <p><span className="font-medium">Phone:</span> {selectedUser.phone_number || 'N/A'}</p>
              <p><span className="font-medium">Age:</span> {selectedUser.age ?? 'N/A'}</p>
              <p><span className="font-medium">Gender:</span> {selectedUser.gender ?? 'N/A'}</p>
              <p><span className="font-medium">Preferred Bank:</span> {selectedUser.preferred_bank}</p>
              <p><span className="font-medium">Bank Account:</span> {selectedUser.bank_account_number}</p>
              <p><span className="font-medium">Joined:</span> {new Date(selectedUser.created_at).toLocaleString()}</p>
              <p><span className="font-medium">ID Verified:</span> {selectedUser.id_verified ? 'Yes' : 'No'}</p>
              {selectedUser.id_image_url && (
                <div className="mt-2">
                  <span className="font-medium">ID Image:</span>
                  <img src={selectedUser.id_image_url} alt="ID" className="mt-1 w-full rounded-lg border border-gray-200 shadow-sm" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}