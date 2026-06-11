// src/app/admin/dashboard/page.tsx
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import StatsCard from '@/components/admin/StatsCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { dashboardApi } from '@/lib/api/dashboard';
import { ApiErrorBoundary } from '@/components/ApiErrorBoundary';

// Pages
import UsersPage from '@/components/admin/pages/UsersPage';
import VerificationsPage from '@/components/admin/pages/VerificationsPage';
import RidesPage from '@/components/admin/pages/RidesPage';
import ReportsPage from '@/components/admin/pages/ReportsPage';
import PaymentsPage from '@/components/admin/pages/PaymentsPage';
import SosAlertsPage from '@/components/admin/pages/SosAlertsPage';
import CompaniesPage from '@/components/admin/pages/CompaniesPage';
import ConfigPage from '@/components/admin/pages/ConfigPage';
import ReviewsPage from '@/components/admin/pages/ReviewsPage';
import SupportPage from '@/components/admin/pages/SupportPage';
import DashboardCharts from '@/components/admin/DashboardCharts';
import RealTimeListener from '@/components/admin/RealTimeListener';

import {
  Users,
  Car,
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  Scale,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function DashboardPage() {
  const { admin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'users' | 'rides' | 'verifications' | 'reports' | 'payments' | 'config' | 'sos' | 'companies' | 'reviews' | 'support'
  >('dashboard');

  const { data: stats, error, isLoading, mutate } = useSWR(
    admin ? 'dashboard-stats' : null,
    () => dashboardApi.getStats(),
    { refreshInterval: 60000, revalidateOnFocus: true }
  );

  const { data: growth } = useSWR(
    admin && activeTab === 'dashboard' ? 'dashboard-growth' : null,
    () => dashboardApi.getGrowth(),
    { refreshInterval: 120000 }
  );

  if (authLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 gap-4">
      <LoadingSpinner />
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 animate-pulse">Establishing Secure Session</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased text-zinc-900 dark:text-zinc-100 transition-colors">
      <RealTimeListener />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={activeTab === 'dashboard' ? 'Platform Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
          description={
            activeTab === 'dashboard' 
              ? "Real-time metrics and system health monitoring." 
              : `Manage your ${activeTab} and platform operations.`
          }
          onRefresh={() => {
              mutate();
              // For other pages, we might need a more global refresh mechanism
              // or rely on SWR's internal keys.
          }} 
        />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10">
          <ApiErrorBoundary>
            {activeTab === 'dashboard' ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard
                    title="Total Users"
                    value={stats?.totalUsers?.toLocaleString() || '0'}
                    icon={Users}
                    loading={isLoading}
                    change={stats?.growth?.trend24h}
                  />
                  <StatsCard
                    title="Active Rides"
                    value={stats?.activeRides?.toLocaleString() || '0'}
                    icon={Car}
                    loading={isLoading}
                  />
                  <StatsCard
                    title="Pending Trust"
                    value={(stats?.pendingVerifications?.total || 0).toLocaleString()}
                    icon={ShieldCheck}
                    loading={isLoading}
                  />
                  <StatsCard
                    title="Total Revenue"
                    value={`${(stats?.paymentStats?.totalRevenue || 0).toLocaleString()} ETB`}
                    icon={DollarSign}
                    loading={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <StatsCard
                    title="Active Reports"
                    value={stats?.pendingReports?.toLocaleString() || '0'}
                    icon={AlertTriangle}
                    loading={isLoading}
                  />
                  <StatsCard
                    title="Active SOS"
                    value={stats?.activeSOS?.toLocaleString() || '0'}
                    icon={AlertTriangle}
                    loading={isLoading}
                  />
                  <StatsCard
                    title="Open Disputes"
                    value={stats?.disputes?.toLocaleString() || '0'}
                    icon={Scale}
                    loading={isLoading}
                  />
                  <StatsCard
                    title="Pending Completion"
                    value={stats?.pendingCompletions?.toLocaleString() || '0'}
                    icon={Car}
                    loading={isLoading}
                  />
                </div>

                {growth && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GrowthCard
                      title="User Growth"
                      thisWeek={growth.users_this_week}
                      lastWeek={growth.users_last_week}
                      thisMonth={growth.users_this_month}
                      pct={growth.user_growth_pct}
                      suffix=""
                    />
                    <GrowthCard
                      title="Revenue Growth"
                      thisWeek={growth.rev_this_week}
                      lastWeek={growth.rev_last_week}
                      thisMonth={growth.rev_this_month}
                      pct={growth.rev_growth_pct}
                      suffix=" ETB"
                    />
                  </div>
                )}

                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Growth & Activity</h3>
                      <p className="text-xs text-zinc-500">Visualization of platform engagement over time.</p>
                    </div>
                  </div>
                  <DashboardCharts stats={stats as any} />
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                {activeTab === 'users' && <UsersPage />}
                {activeTab === 'verifications' && <VerificationsPage />}
                {activeTab === 'rides' && <RidesPage />}
                {activeTab === 'payments' && <PaymentsPage />}
                {activeTab === 'reports' && <ReportsPage />}
                {activeTab === 'sos' && <SosAlertsPage />}
                {activeTab === 'companies' && <CompaniesPage />}
                {activeTab === 'config' && <ConfigPage />}
                {activeTab === 'reviews' && <ReviewsPage />}
                {activeTab === 'support' && <SupportPage />}
              </div>
            )}
          </ApiErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function GrowthCard({
  title, thisWeek, lastWeek, thisMonth, pct, suffix,
}: {
  title: string;
  thisWeek: number | string;
  lastWeek: number | string;
  thisMonth: number | string;
  pct: number | string;
  suffix: string;
}) {
  const pctNum = Number(pct) || 0;
  const up = pctNum >= 0;
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">{title}</h3>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${up ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {up ? '+' : ''}{pctNum.toFixed(1)}%
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'This Week', value: thisWeek },
          { label: 'Last Week', value: lastWeek },
          { label: 'This Month', value: thisMonth },
        ].map((m) => (
          <div key={m.label}>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{m.label}</p>
            <p className="text-sm font-black text-zinc-950 dark:text-white tabular-nums">
              {(Number(m.value) || 0).toLocaleString()}{suffix}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
