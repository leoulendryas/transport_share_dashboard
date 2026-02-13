'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { Stats } from '@/types/user';

interface DashboardChartsProps {
  stats: Stats | null;
}

export default function DashboardCharts({ stats }: DashboardChartsProps) {
  if (!stats) return null;

  const rideData = [
    { name: 'Active', value: stats.rideStats.activeRides, color: '#3b82f6' },
    { name: 'Completed', value: stats.rideStats.completedRides, color: '#10b981' },
    { name: 'Cancelled', value: stats.rideStats.cancelledRides, color: '#f43f5e' },
    { name: 'Disputed', value: stats.rideStats.disputedRides, color: '#f59e0b' },
  ];

  const paymentData = [
    { 
      name: 'Successful', 
      amount: stats.paymentStats.successfulPayments, 
      fill: '#10b981' 
    },
    { 
      name: 'Pending', 
      amount: stats.paymentStats.totalPayments - stats.paymentStats.successfulPayments, 
      fill: '#f59e0b' 
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Ride Distribution Pie Chart */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Ride Distribution</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rideData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
              >
                {rideData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' 
                }} 
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Success Bar Chart */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Transaction Volume</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' 
                }} 
              />
              <Bar dataKey="amount" radius={[10, 10, 10, 10]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
