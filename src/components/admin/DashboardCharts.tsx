'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Stats } from '@/types/user';
import { useTheme } from '@/context/ThemeContext';

interface DashboardChartsProps {
  stats: Stats | null;
}

export default function DashboardCharts({ stats }: DashboardChartsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!stats) return null;

  const rideData = [
    { name: 'Active', value: stats.rideStats.activeRides, color: isDark ? '#ffffff' : '#09090b' },
    { name: 'Completed', value: stats.rideStats.completedRides, color: isDark ? '#a1a1aa' : '#52525b' },
    { name: 'Cancelled', value: stats.rideStats.cancelledRides, color: isDark ? '#52525b' : '#a1a1aa' },
    { name: 'Disputed', value: stats.rideStats.disputedRides, color: isDark ? '#27272a' : '#e4e4e7' },
  ];

  const paymentData = [
    { name: 'Successful', amount: stats.paymentStats.successfulPayments, fill: isDark ? '#ffffff' : '#09090b' },
    { name: 'Pending', amount: stats.paymentStats.totalPayments - stats.paymentStats.successfulPayments, fill: isDark ? '#27272a' : '#e4e4e7' },
  ];

  const chartTheme: any = {
    tooltip: {
      contentStyle: { 
        borderRadius: '1rem', 
        border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7', 
        boxShadow: 'none', 
        backgroundColor: isDark ? '#09090b' : '#fff', 
        fontSize: '11px', 
        fontWeight: 800,
        textTransform: 'uppercase'
      }
    },
    grid: {
      stroke: isDark ? '#18181b' : '#f4f4f5'
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="bg-white dark:bg-zinc-950/50 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Trajectory Analysis</h3>
           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rideData} cx="50%" cy="50%" innerRadius={90} outerRadius={115} paddingAngle={10} dataKey="value" stroke="none">
                {rideData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip {...chartTheme.tooltip} />
              <Legend verticalAlign="bottom" iconType="square" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '30px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950/50 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Capital Flow</h3>
           <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
           </div>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentData}>
              <CartesianGrid strokeDasharray="6 6" vertical={false} stroke={chartTheme.grid.stroke} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 800 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 800 }} />
              <Tooltip cursor={{ fill: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }} {...chartTheme.tooltip} />
              <Bar dataKey="amount" radius={[6, 6, 6, 6]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
