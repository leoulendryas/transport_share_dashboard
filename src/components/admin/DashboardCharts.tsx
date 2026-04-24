'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Stats } from '@/types/user';

interface DashboardChartsProps {
  stats: Stats | null;
}

export default function DashboardCharts({ stats }: DashboardChartsProps) {
  if (!stats) return null;

  const rideData = [
    { name: 'Active', value: stats.rideStats.activeRides, color: '#18181b' },
    { name: 'Completed', value: stats.rideStats.completedRides, color: '#52525b' },
    { name: 'Cancelled', value: stats.rideStats.cancelledRides, color: '#a1a1aa' },
    { name: 'Disputed', value: stats.rideStats.disputedRides, color: '#e4e4e7' },
  ];

  const paymentData = [
    { name: 'Successful', amount: stats.paymentStats.successfulPayments, fill: '#18181b' },
    { name: 'Pending', amount: stats.paymentStats.totalPayments - stats.paymentStats.successfulPayments, fill: '#e4e4e7' },
  ];

  const chartTheme = {
    tooltip: {
      contentStyle: { borderRadius: '1rem', border: '1px solid #e4e4e7', boxShadow: 'none', backgroundColor: '#fff', fontSize: '12px', fontWeight: 600 }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-8">Ride Status Distribution</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rideData} cx="50%" cy="50%" innerRadius={80} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                {rideData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip {...chartTheme.tooltip} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-8">Transaction Analytics</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentData}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }} />
              <Tooltip cursor={{ fill: '#f9f9f9' }} {...chartTheme.tooltip} />
              <Bar dataKey="amount" radius={[8, 8, 8, 8]} barSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
