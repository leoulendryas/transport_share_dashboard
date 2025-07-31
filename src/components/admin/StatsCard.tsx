import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  change?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, change }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-black">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color} text-white`}>
          <span className="material-icons">{icon}</span>
        </div>
      </div>
      
      {change !== undefined && (
        <p className={`mt-3 text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
        </p>
      )}
    </div>
  );
};

export default StatsCard;