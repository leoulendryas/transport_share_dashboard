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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {change !== undefined && !loading && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
            change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">{title}</p>
        {loading ? (
          <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg mt-1" />
        ) : (
          <h3 className={`${valueClasses} text-slate-900 tracking-tight`}>{value}</h3>
        )}
      </div>

      {/* Decorative background shape */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${color} opacity-5 group-hover:scale-110 transition-transform duration-500`} />
    </div>
  );
};

export default StatsCard;
