'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import StatsCard from '@/components/admin/StatsCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { User, PendingVerification, Stats, Ride } from '@/types/user';
import { 
  getUsers, 
  getPendingVerifications, 
  verifyUserID, 
  banUser, 
  rejectVerification,
  getDashboardStats,
  getRides,
  adminCancelRide
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

  // Rides
  const [rides, setRides] = useState<Ride[]>([]);
  const [currentRidePage, setCurrentRidePage] = useState(1);
  const [totalRides, setTotalRides] = useState(0);

  const [activeTab, setActiveTab] = useState<
    'users' | 'rides' | 'verifications' | 'reports' | 'payments' | 'config'
  >('users');

  const router = useRouter();

  const fetchAllData = async (token: string) => {
    setIsLoading(true);
    try {
      // Fetch data in parallel
      const [usersData, verificationsData, statsData, ridesData] = await Promise.all([
        getUsers(token),
        getPendingVerifications(token),
        getDashboardStats(token),
        getRides(token, currentRidePage, 10) // Updated limit to 10
      ]);

      // Update state with fetched data
      setUsers(usersData); // Now returns array directly, no .results
      setVerifications(verificationsData); // Now returns array directly, no .results
      setStats(statsData);
      
      // Handle paginated rides response
      if (ridesData && ridesData.results) {
        setRides(ridesData.results);
        setTotalRides(ridesData.pagination?.total || 0);
      } else {
        setRides([]);
        setTotalRides(0);
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      
      // Handle token expiration
      if (error.message.includes('401') || error.message.includes('403')) {
        try {
          const newToken = await refreshAuthToken();
          if (newToken) {
            await fetchAllData(newToken);
            return;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          router.push('/admin/login');
          return;
        }
      }
      
      // Set empty states on error
      setUsers([]);
      setVerifications([]);
      setRides([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!admin || !token) {
        router.push('/admin/login');
      } else {
        fetchAllData(token);
      }
    }
  }, [admin, authLoading, token, router, currentRidePage]);

  // User handlers
  const handleVerify = async (userId: number) => {
    if (!token) return;
    
    try {
      await verifyUserID(token, userId);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, id_verified: true } : user
        )
      );
      setVerifications(prevVerifications => 
        prevVerifications.filter(verification => verification.id !== userId)
      );
      
      // Refresh stats to get updated counts
      const updatedStats = await getDashboardStats(token);
      setStats(updatedStats);
      
    } catch (error) {
      console.error('Failed to verify user:', error);
      alert('Failed to verify user. Please try again.');
    }
  };

  const handleReject = async (userId: number, reason: string = 'Rejected by admin') => {
    if (!token) return;
    
    try {
      await rejectVerification(token, userId, reason);
      
      // Update local state
      setVerifications(prevVerifications => 
        prevVerifications.filter(verification => verification.id !== userId)
      );
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, id_verified: false, id_image_url: undefined } : user
        )
      );
      
    } catch (error) {
      console.error('Failed to reject verification:', error);
      alert('Failed to reject verification. Please try again.');
    }
  };

  const handleBan = async (userId: number, banned: boolean) => {
    if (!token) return;
    
    try {
      await banUser(token, userId, banned);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, banned } : user
        )
      );
      
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  // Ride handlers
  const handleCancelRide = async (rideId: number) => {
    if (!token) return;
    
    try {
      await adminCancelRide(token, rideId);
      
      // Update local state
      setRides(prevRides => prevRides.filter(ride => ride.id !== rideId));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          activeRides: Math.max(0, (stats.activeRides || 0) - 1),
          rideStats: {
            ...stats.rideStats,
            cancelledRides: (stats.rideStats?.cancelledRides || 0) + 1,
            activeRides: Math.max(0, (stats.rideStats?.activeRides || 0) - 1)
          }
        });
      }
      
    } catch (error) {
      console.error('Failed to cancel ride:', error);
      alert('Failed to cancel ride. Please try again.');
    }
  };

  const handleRidePageChange = (page: number) => {
    setCurrentRidePage(page);
  };

  const handleRefreshData = () => {
    if (token) {
      fetchAllData(token);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Checking authentication...</span>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Admin Dashboard"
          description="Manage users, verifications, rides, reports, payments, and system config"
          onRefresh={handleRefreshData}
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon="people"
              color="bg-blue-500"
              loading={isLoading}
            />
            <StatsCard
              title="Active Rides"
              value={stats?.activeRides || 0}
              icon="directions_car"
              color="bg-green-500"
              loading={isLoading}
            />
            <StatsCard
              title="Pending Verifications"
              value={stats?.pendingVerifications || 0}
              icon="verified"
              color="bg-yellow-500"
              loading={isLoading}
            />
            <StatsCard
              title="Reports"
              value={stats?.reports || 0}
              icon="report"
              color="bg-red-500"
              loading={isLoading}
            />
          </div>

          {/* Ride Stats Subgrid */}
          {stats?.rideStats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <StatsCard
                title="Total Rides"
                value={stats.rideStats.totalRides || 0}
                icon="route"
                color="bg-purple-500"
                size="sm"
              />
              <StatsCard
                title="Completed"
                value={stats.rideStats.completedRides || 0}
                icon="check_circle"
                color="bg-green-500"
                size="sm"
              />
              <StatsCard
                title="Cancelled"
                value={stats.rideStats.cancelledRides || 0}
                icon="cancel"
                color="bg-red-500"
                size="sm"
              />
              <StatsCard
                title="Disputed"
                value={stats.rideStats.disputedRides || 0}
                icon="warning"
                color="bg-orange-500"
                size="sm"
              />
              <StatsCard
                title="Avg Seats"
                value={stats.rideStats.averageSeats ? Math.round(stats.rideStats.averageSeats) : 0}
                icon="airline_seat_recline_normal"
                color="bg-indigo-500"
                size="sm"
              />
            </div>
          )}

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-2 text-gray-600">Loading {activeTab}...</span>
              </div>
            ) : (
              <>
                {activeTab === 'users' && (
                  <UsersPage 
                    users={users} 
                    onBan={handleBan} 
                    loading={isLoading}
                  />
                )}
                
                {activeTab === 'verifications' && (
                  <VerificationsPage
                    verifications={verifications}
                    onVerify={handleVerify}
                    onReject={handleReject}
                    loading={isLoading}
                  />
                )}
                
                {activeTab === 'rides' && (
                  <RidesPage
                    rides={rides}
                    currentPage={currentRidePage}
                    total={totalRides}
                    onCancel={handleCancelRide}
                    onPageChange={handleRidePageChange}
                    loading={isLoading}
                  />
                )}
                
                {activeTab === 'reports' && (
                  <ReportsPage loading={isLoading} />
                )}
                
                {activeTab === 'payments' && (
                  <PaymentsPage loading={isLoading} />
                )}
                
                {activeTab === 'config' && (
                  <div className="p-6 text-center text-gray-500">
                    System Configuration - Coming Soon
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}