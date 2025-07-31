'use client';

import { useState } from 'react';
import Button from '../ui/Button';
import { User } from '@/types/user';

interface UserTableProps {
  users: User[];
  onVerify: (userId: number) => void;
  onBan: (userId: number, banned: boolean) => void;
}

// utils/imageUtils.ts
export const getSafeUrl = (url: string | null) => {
  if (!url) return '';
  
  // If it's already a full URL (Cloudinary case)
  if (url.startsWith('http')) {
    return url;
  }
  
  // If it's an old-style path (shouldn't happen with new uploads)
  return `${url}`;
};

const UserTable: React.FC<UserTableProps> = ({ users, onVerify, onBan }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Verified</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                      <div className="text-sm text-gray-500">Joined {new Date(user.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-sm text-gray-500">{user.phone_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    !user.banned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.banned ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.id_verified ? (
                    <span className="text-green-600 flex items-center">
                      <span className="material-icons mr-1 text-sm">check_circle</span>
                      Verified
                    </span>
                  ) : (
                    <span className="text-yellow-600 flex items-center">
                      <span className="material-icons mr-1 text-sm">warning</span>
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setSelectedUser(user)}>View</Button>
                    {!user.id_verified && <Button onClick={() => onVerify(user.id)}>Verify</Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-800">User Details</h3>
                <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-gray-700">
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Personal Information</h4>
                  <div className="mt-2 space-y-2">
                    <p className='text-black'><span className="font-medium text-black">Name:</span> {selectedUser.first_name} {selectedUser.last_name}</p>
                    <p className='text-black'><span className="font-medium text-black">Email:</span> {selectedUser.email}</p>
                    <p className='text-black'><span className="font-medium text-black">Phone:</span> {selectedUser.phone_number}</p>
                    <p className='text-black'><span className="font-medium text-black">Join Date:</span> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                    {selectedUser.age && <p><span className="font-medium text-black">Age:</span> {selectedUser.age}</p>}
                    {selectedUser.gender && <p><span className="font-medium text-black">Gender:</span> {selectedUser.gender}</p>}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Verification Status</h4>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="font-medium text-black">ID Verified:</span> 
                      {selectedUser.id_verified ? (
                        <span className="text-green-600 ml-2">Verified</span>
                      ) : (
                        <span className="text-yellow-600 ml-2">Pending Verification</span>
                      )}
                    </p>
                    <p>
                      <span className="font-medium text-black">Status:</span> 
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        !selectedUser.banned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.banned ? 'Banned' : 'Active'}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">ID Document</h4>
                    {selectedUser?.id_image_url ? (
                      <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
                        {selectedUser.id_image_url.endsWith('.pdf') ? (
                          <div className="flex flex-col items-center">
                            <span className="material-icons text-5xl text-red-500">picture_as_pdf</span>
                            <a 
                              href={getSafeUrl(selectedUser.id_image_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 text-blue-500 hover:underline"
                            >
                              View PDF Document
                            </a>
                          </div>
                        ) : (
                          <img 
                            src={getSafeUrl(selectedUser.id_image_url)}
                            alt="ID Document" 
                            className="max-w-full h-40 object-contain"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="text-center p-4 text-gray-500">
                                    <span class="material-icons text-4xl">broken_image</span>
                                    <p>Failed to load image</p>
                                  </div>
                                `;
                              }
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-4 flex justify-center items-center h-40">
                        <p className="text-gray-500">No ID document uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="secondary" onClick={() => setSelectedUser(null)}>Close</Button>
                {!selectedUser.id_verified && (
                  <Button onClick={() => onVerify(selectedUser.id)}>Verify ID</Button>
                )}
                <Button 
                  variant="danger"
                  onClick={() => onBan(selectedUser.id, !selectedUser.banned)}
                >
                  {selectedUser.banned ? 'Unban User' : 'Ban User'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
