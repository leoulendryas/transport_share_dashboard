'use client';

import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  ShieldCheck, 
  AlertTriangle, 
  CreditCard, 
  Settings, 
  LogOut,
  Building2,
  Bell
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'users' | 'rides' | 'verifications' | 'reports' | 'payments' | 'config' | 'sos' | 'companies';
  onTabChange: (tab: SidebarProps['activeTab']) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { admin, logout } = useAuth();
  
  const menuItems = [
    { name: 'Dashboard', key: 'users', icon: LayoutDashboard },
    { name: 'Users', key: 'users', icon: Users },
    { name: 'Rides', key: 'rides', icon: Car },
    { name: 'Verifications', key: 'verifications', icon: ShieldCheck },
    { name: 'SOS Alerts', key: 'sos', icon: Bell },
    { name: 'Reports', key: 'reports', icon: AlertTriangle },
    { name: 'Payments', key: 'payments', icon: CreditCard },
    { name: 'Companies', key: 'companies', icon: Building2 },
    { name: 'Config', key: 'config', icon: Settings },
  ];

  return (
    <div className="h-full w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Car className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">GeoRide</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Main Menu</p>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => onTabChange(item.key as SidebarProps['activeTab'])}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                activeTab === item.key 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.key ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {admin && (
        <div className="p-4 m-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {admin.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{admin.name}</p>
              <p className="text-xs text-slate-500 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-slate-700 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
