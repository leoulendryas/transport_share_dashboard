import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  change?: number;
  loading?: boolean;
}

export default function StatsCard({ title, value, icon: Icon, change, loading }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && !loading && (
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            change >= 0 ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
          }`}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg mt-1" />
        ) : (
          <h3 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">{value}</h3>
        )}
      </div>
    </div>
  );
}
