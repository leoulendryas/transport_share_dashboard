import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  description: string;
  onRefresh: () => void;
}

export default function Header({ title, description, onRefresh }: HeaderProps) {
  return (
    <header className="h-20 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-black text-zinc-950 dark:text-white tracking-tight">{title}</h1>
        <p className="text-xs font-medium text-zinc-500">{description}</p>
      </div>
      <button 
        onClick={onRefresh}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-950 dark:text-zinc-100 transition-all"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Refresh Data
      </button>
    </header>
  );
}
