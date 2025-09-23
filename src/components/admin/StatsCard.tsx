import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  change?: number;
  loading?: boolean;
  size?: 'sm' | 'md'; // 👈 added
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  change, 
  loading,
  size = 'md' // 👈 default
}) => {
  const valueClasses =
    size === 'sm'
      ? 'text-lg font-semibold'
      : 'text-2xl font-bold';

  const cardPadding = size === 'sm' ? 'p-4' : 'p-5';
  const iconPadding = size === 'sm' ? 'p-2' : 'p-3';

  return (
    <div className={`bg-white rounded-xl shadow-sm ${cardPadding}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          {loading ? (
            <h3 className={`${valueClasses} mt-1 text-gray-400 animate-pulse`}>
              Loading...
            </h3>
          ) : (
            <h3 className={`${valueClasses} mt-1 text-black`}>{value}</h3>
          )}
        </div>
        <div className={`${iconPadding} rounded-lg ${color} text-white`}>
          <span className="material-icons">{icon}</span>
        </div>
      </div>
      
      {!loading && change !== undefined && (
        <p className={`mt-3 text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
        </p>
      )}
    </div>
  );
};

export default StatsCard;
