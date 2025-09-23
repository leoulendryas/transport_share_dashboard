'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  activeTab: 'users' | 'rides' | 'verifications' | 'reports' | 'payments' | 'config';
  onTabChange: (tab: SidebarProps['activeTab']) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { admin, logout } = useAuth();
  const pathname = usePathname();
  
  const menuItems = [
    { name: 'Dashboard', key: 'users', icon: 'dashboard', href: '/admin/dashboard' },
    { name: 'Users', key: 'users', icon: 'people', href: '/admin/users' },
    { name: 'Rides', key: 'rides', icon: 'directions_car', href: '/admin/rides' },
    { name: 'Verifications', key: 'verifications', icon: 'verified', href: '/admin/verifications' },
    { name: 'Reports', key: 'reports', icon: 'analytics', href: '/admin/reports' },
    { name: 'Payments', key: 'payments', icon: 'credit_card', href: '/admin/payments' },
    { name: 'Config', key: 'config', icon: 'settings', href: '/admin/config' },
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
              <li key={item.key} className="mb-1">
                <button
                  onClick={() => onTabChange(item.key as SidebarProps['activeTab'])}
                  className={`w-full text-left flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                    activeTab === item.key ? 'bg-gray-700 text-white' : ''
                  }`}
                >
                  <span className="material-icons mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
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
