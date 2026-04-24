import { RefreshCw, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface HeaderProps {
  title: string;
  description: string;
  onRefresh: () => void;
}

export default function Header({ title, description, onRefresh }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-20 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 transition-colors">
      <div>
        <h1 className="text-lg font-black text-zinc-950 dark:text-white tracking-tight">{title}</h1>
        <p className="text-xs font-medium text-zinc-500">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl text-zinc-950 dark:text-zinc-100 transition-all border border-zinc-200 dark:border-zinc-800 shadow-sm"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 fill-zinc-950" />
          ) : (
            <Sun className="w-4 h-4 fill-white" />
          )}
        </button>

        <div className="w-[1px] h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <button 
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-xl text-xs font-black uppercase tracking-widest text-white dark:text-zinc-950 transition-all shadow-lg shadow-zinc-200 dark:shadow-none"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>
    </header>
  );
}
