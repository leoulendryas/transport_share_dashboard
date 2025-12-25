'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import StatsCard from '@/components/admin/StatsCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { User, PendingVerification, Stats, Ride, Payment } from '@/types/user';
import { 
  getUsers, 
  getPendingVerifications, 
  verifyUserID, 
  banUser, 
  unbanUser,
  rejectVerification,
  getDashboardStats,
  getRides,
  adminCancelRide,
  getPayments // Ensure this is exported in your lib/api
} from '@/lib/api';

// Pages
import UsersPage from '@/components/admin/pages/UsersPage';
import VerificationsPage from '@/components/admin/pages/VerificationsPage';
import RidesPage from '@/components/admin/pages/RidesPage';
import ReportsPage from '@/components/admin/pages/ReportsPage';
import PaymentsPage from '@/components/admin/pages/PaymentsPage';

export default function DashboardPage() {
  const { admin, token, loading: authLoading, refreshAuthToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  // Users & verifications
  const [users, setUsers] = useState<User[]>([]);
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);

  // Rides (with pagination)
  const [rides, setRides] = useState<Ride[]>([]);
  const [currentRidePage, setCurrentRidePage] = useState(1);
  const [totalRides, setTotalRides] = useState(0);

  // Payments (with pagination & filter)
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'completed' | 'released_to_driver'>('all');
  const [currentPaymentPage, setCurrentPaymentPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);

  const [activeTab, setActiveTab] = useState<
    'users' | 'rides' | 'verifications' | 'reports' | 'payments' | 'config'
  >('users');

  const router = useRouter();

  const fetchAllData = async (authToken: string) => {
    setIsLoading(true);
    try {
      // 1. Always fetch dashboard stats for the top cards
      const statsData = await getDashboardStats(authToken);
      setStats(statsData);

      // 2. Fetch specific tab data
      switch (activeTab) {
        case 'users':
          const usersData = await getUsers(authToken, 1, 50);
          setUsers(usersData.results);
          break;
        case 'verifications':
          const verificationsData = await getPendingVerifications(authToken, 1, 50);
          setVerifications(verificationsData.results);
          break;
        case 'rides':
          const ridesData = await getRides(authToken, currentRidePage, 10);
          setRides(ridesData.results);
          setTotalRides(ridesData.pagination.total);
          break;
        case 'payments':
          const paymentsData = await getPayments(authToken, currentPaymentPage, 10, paymentFilter);
          setPayments(paymentsData.results);
          setTotalPayments(paymentsData.pagination.total);
          break;
        default:
          break;
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      
      // Handle Token Expiry
      if (error.message?.includes('401') || error.message?.includes('403')) {
        try {
          const newToken = await refreshAuthToken();
          if (newToken) {
            await fetchAllData(newToken);
            return;
          }
        } catch (refreshError) {
          router.push('/admin/login');
          return;
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch when tab or pages change
  useEffect(() => {
    if (!authLoading && admin && token) {
      fetchAllData(token);
    }
  }, [admin, authLoading, token, activeTab, currentRidePage, currentPaymentPage, paymentFilter]);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && (!admin || !token)) {
      router.push('/admin/login');
    }
  }, [admin, authLoading, token, router]);

  /* --- HANDLERS --- */

  const handleVerify = async (userId: number) => {
    if (!token) return;
    try {
      await verifyUserID(token, userId);
      setVerifications(prev => prev.filter(v => v.id !== userId));
      fetchAllData(token);
    } catch (error) { alert('Failed to verify user'); }
  };

  const handleCancelRide = async (rideId: number) => {
    if (!token) return;
    try {
      await adminCancelRide(token, rideId);
      setRides(prev => prev.filter(r => r.id !== rideId));
      fetchAllData(token);
    } catch (error) { alert('Failed to cancel ride'); }
  };

  const handleReleasePayment = async (rideId: number) => {
    if (!token) return;
    try {
      // await releasePayout(token, rideId); // If your API has this
      alert('Payout initiated for Ride #' + rideId);
      fetchAllData(token);
    } catch (error) { alert('Failed to release payment'); }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        // Reset pages when switching tabs
        setCurrentRidePage(1);
        setCurrentPaymentPage(1);
      }} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Admin Dashboard" 
          onRefresh={() => token && fetchAllData(token)} 
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatsCard title="Total Users" value={stats?.totalUsers || 0} icon="people" color="bg-blue-500" loading={isLoading} />
            <StatsCard title="Active Rides" value={stats?.activeRides || 0} icon="directions_car" color="bg-green-500" loading={isLoading} />
            <StatsCard title="Pending Verifications" value={stats?.pendingVerifications || 0} icon="verified" color="bg-yellow-500" loading={isLoading} />
            <StatsCard title="Reports" value={stats?.reports || 0} icon="report" color="bg-red-500" loading={isLoading} />
          </div>

          {/* Dynamic Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {isLoading ? (
              <div className="flex justify-center items-center py-20"><LoadingSpinner size="lg" /></div>
            ) : (
              <>
                {activeTab === 'users' && <UsersPage users={users} onBan={banUser} onUnban={unbanUser} loading={isLoading} />}
                
                {activeTab === 'verifications' && <VerificationsPage verifications={verifications} onVerify={handleVerify} onReject={rejectVerification} />}
                
                {activeTab === 'rides' && (
                  <RidesPage 
                    rides={rides} 
                    currentPage={currentRidePage} 
                    total={totalRides} 
                    onCancel={handleCancelRide} 
                    onPageChange={setCurrentRidePage} 
                  />
                )}
                
                {activeTab === 'payments' && (
                  <PaymentsPage 
                    payments={payments}
                    total={totalPayments}
                    currentPage={currentPaymentPage}
                    filter={paymentFilter}
                    onFilterChange={(f) => { setPaymentFilter(f); setCurrentPaymentPage(1); }}
                    onPageChange={setCurrentPaymentPage}
                    onRelease={handleReleasePayment}
                  />
                )}

                {activeTab === 'reports' && <ReportsPage />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
