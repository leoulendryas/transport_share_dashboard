import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  change?: number;
  loading?: boolean;
  size?: 'sm' | 'md';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  change, 
  loading,
  size = 'md'
}) => {
  const valueClasses = size === 'sm' ? 'text-xl font-bold' : 'text-3xl font-extrabold';

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 relative overflow-hidden group cursor-default hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform duration-500`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {change !== undefined && !loading && (
          <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
            change >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
          }`}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
        {loading ? (
          <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-xl mt-2" />
        ) : (
          <h3 className={`${valueClasses} text-slate-900 tracking-tighter`}>{value}</h3>
        )}
      </div>

      {/* Modern glassmorphism background element */}
      <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full ${color} opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-125 transition-all duration-700 blur-2xl`} />
    </div>
  );
};

export default StatsCard;
