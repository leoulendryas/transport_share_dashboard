'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const { admin, logout } = useAuth();
  const pathname = usePathname();
  
  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
    { name: 'Users', href: '/admin/users', icon: 'people' },
    { name: 'Rides', href: '/admin/rides', icon: 'directions_car' },
    { name: 'Verifications', href: '/admin/verifications', icon: 'verified' },
    { name: 'Reports', href: '/admin/reports', icon: 'analytics' },
  ];

  return (
    <div className="h-full w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-5 border-b border-gray-700">
        <h1 className="text-xl font-bold">Carpool Admin</h1>
        <p className="text-sm text-gray-400 mt-1">Administration Panel</p>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.name} className="mb-1">
                <Link
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                    pathname === item.href ? 'bg-gray-700 text-white' : ''
                  }`}
                >
                  <span className="material-icons mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {admin && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
            <div className="ml-3">
              <p className="text-sm font-medium">{admin.name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;