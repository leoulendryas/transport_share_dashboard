'use client';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { RefreshCw, Bell, Search, User, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  title: string;
  description: string;
  onRefresh?: () => void;
}

const Header = ({ title, description, onRefresh }: HeaderProps) => {
  const { admin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-20 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm transition-colors">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{description}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block text-slate-900 dark:text-white">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm w-64 transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-2 border-x border-slate-200 dark:border-slate-800 px-4">
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5 group-active:rotate-180 transition-transform duration-500" />
            </button>
          )}
        </div>

        {admin && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{admin.name}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Super Admin</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors">
              <User className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
