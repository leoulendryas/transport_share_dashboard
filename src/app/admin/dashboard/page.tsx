'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import StatsCard from '@/components/admin/StatsCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Stats } from '@/types/user';
import { getDashboardStats } from '@/lib/api';

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

import { 
  Users, 
  Car, 
  ShieldCheck, 
  AlertTriangle
} from 'lucide-react';

export default function DashboardPage() {
  const { admin, token, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'users' | 'rides' | 'verifications' | 'reports' | 'payments' | 'config' | 'sos' | 'companies' | 'reviews' | 'support'
  >('dashboard');

  const router = useRouter();

  const fetchStats = async (authToken: string) => {
    setIsLoading(true);
    try {
      const statsData = await getDashboardStats(authToken);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && admin && token) {
      fetchStats(token);
    }
  }, [admin, authLoading, token]);

  useEffect(() => {
    if (!authLoading && (!admin || !token)) {
      router.push('/admin/login');
    }
  }, [admin, authLoading, token, router]);

  if (authLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 gap-4">
      <LoadingSpinner />
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 animate-pulse">Establishing Secure Session</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased text-zinc-900 dark:text-zinc-100 transition-colors">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={activeTab === 'dashboard' ? 'Platform Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
          description={
            activeTab === 'dashboard' 
              ? "Real-time metrics and system health monitoring." 
              : `Manage your ${activeTab} and platform operations.`
          }
          onRefresh={() => token && fetchStats(token)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10">
          {activeTab === 'dashboard' ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                  title="Total Users" 
                  value={stats?.totalUsers?.toLocaleString() || 0} 
                  icon={Users} 
                  loading={isLoading} 
                  change={12} 
                />
                <StatsCard 
                  title="Active Rides" 
                  value={stats?.activeRides?.toLocaleString() || 0} 
                  icon={Car} 
                  loading={isLoading} 
                  change={-5} 
                />
                <StatsCard 
                  title="Pending Trust" 
                  value={(
                    (stats?.pendingVerifications?.ids || 0) + 
                    (stats?.pendingVerifications?.licenses || 0) + 
                    (stats?.pendingVerifications?.vehicles || 0)
                  ).toLocaleString()} 
                  icon={ShieldCheck} 
                  loading={isLoading} 
                />
                <StatsCard 
                  title="Active Reports" 
                  value={stats?.pendingReports?.toLocaleString() || 0} 
                  icon={AlertTriangle} 
                  loading={isLoading} 
                  change={2} 
                />
              </div>

              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Growth & Activity</h3>
                    <p className="text-xs text-zinc-500">Visualization of platform engagement over time.</p>
                  </div>
                </div>
                <DashboardCharts stats={stats} />
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
        </main>
      </div>
    </div>
  );
}
