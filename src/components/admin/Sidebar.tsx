import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Car, 
  CreditCard, 
  FileText, 
  AlertTriangle, 
  Settings, 
  Building2, 
  LogOut,
  ChevronRight,
  Star,
  LifeBuoy
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { logout } = useAuth();
  
  const menu = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'verifications', label: 'Verifications', icon: ShieldCheck },
    { id: 'rides', label: 'Rides', icon: Car },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'sos', label: 'SOS Alerts', icon: AlertTriangle },
    { id: 'support', label: 'Support', icon: LifeBuoy },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'config', label: 'Config', icon: Settings },
  ];

  return (
    <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col transition-colors">
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold">
          G
        </div>
        <span className="font-semibold text-zinc-950 dark:text-white tracking-tight">GeoRide Admin</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        <div>
          <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Management</p>
          <nav className="space-y-1">
            {menu.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`w-full flex items-center justify-between px-2 py-2 rounded-md text-xs font-medium transition-all group ${
                  activeTab === id 
                    ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-white' 
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 transition-colors ${
                    activeTab === id ? 'text-zinc-950 dark:text-white' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                  }`} />
                  {label}
                </div>
                {activeTab === id && <ChevronRight className="w-3 h-3 opacity-50" />}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-100 dark:border-zinc-900">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-2 py-2 text-xs font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
