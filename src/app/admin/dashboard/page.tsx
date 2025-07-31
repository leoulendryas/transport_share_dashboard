'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import StatsCard from '@/components/admin/StatsCard';
import UserTable from '@/components/admin/UserTable';
import VerificationCard from '@/components/admin/VerificationCard';
import RideTable from '@/components/admin/RideTable';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { User, Stats, Ride } from '@/types/user';
import { 
  getUsers, 
  getPendingVerifications, 
  verifyUserID, 
  banUser as apiBanUser, 
  rejectVerification,
  getDashboardStats,
  getRides,
  adminCancelRide
} from '@/lib/api';

export default function DashboardPage() {
  const { admin, token, loading: authLoading, refreshAuthToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [verifications, setVerifications] = useState<User[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'rides'>('users');
  const [currentRidePage, setCurrentRidePage] = useState(1);
  const [totalRides, setTotalRides] = useState(0);
  const router = useRouter();

  const fetchData = async (token: string) => {
    setIsLoading(true);
    try {
      const [usersData, verificationsData, statsData, ridesData] = await Promise.all([
        getUsers(token),
        getPendingVerifications(token),
        getDashboardStats(token),
        getRides(token, currentRidePage, 5)
      ]);
      
      setUsers(usersData);
      setVerifications(verificationsData);
      setStats(statsData);
      setRides(ridesData.results);
      setTotalRides(ridesData.pagination.total);
    } catch (error: any) {
      if (error.message.includes('401')) {
        const newToken = await refreshAuthToken();
        if (newToken) {
          await fetchData(newToken);
          return;
        }
      }
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!admin) {
        router.push('/admin/login');
      } else if (token) {
        fetchData(token);
      }
    }
  }, [admin, authLoading, token, router, currentRidePage]);

  const handleVerify = async (userId: number) => {
    if (!token) return;
    
    try {
      await verifyUserID(token, userId);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, id_verified: true } : user
      ));
      setVerifications(verifications.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Failed to verify user:', error);
    }
  };

  const handleReject = async (userId: number) => {
    if (!token) return;
    
    try {
      await rejectVerification(token, userId);
      setVerifications(verifications.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Failed to reject verification:', error);
    }
  };

  const handleBan = async (userId: number, banned: boolean) => {
    if (!token) return;
    
    try {
      await apiBanUser(token, userId, banned);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, banned } : user
      ));
    } catch (error) {
      console.error('Failed to ban user:', error);
    }
  };

  const handleCancelRide = async (rideId: number) => {
    if (!token) return;
    
    try {
      await adminCancelRide(token, rideId);
      setRides(rides.filter(ride => ride.id !== rideId));
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
    }
  };

  const handleRidePageChange = (page: number) => {
    setCurrentRidePage(page);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Header 
            title="Admin Dashboard" 
            description="Manage users, verifications, rides, and monitor platform activity"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard 
              title="Total Users" 
              value={stats?.totalUsers || 0} 
              icon="people" 
              color="bg-blue-500" 
            />
            <StatsCard 
              title="Active Rides" 
              value={stats?.activeRides || 0} 
              icon="directions_car" 
              color="bg-green-500" 
            />
            <StatsCard 
              title="Pending Verifications" 
              value={stats?.pendingVerifications || 0} 
              icon="verified" 
              color="bg-yellow-500" 
            />
            <StatsCard 
              title="Total Rides" 
              value={stats?.rideStats?.totalRides || 0} 
              icon="route" 
              color="bg-purple-500" 
            />
          </div>
          
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                className={`pb-3 px-1 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('users')}
              >
                User Management
              </button>
              <button
                className={`pb-3 px-1 font-medium text-sm ${
                  activeTab === 'rides'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('rides')}
              >
                Ride Management
              </button>
            </nav>
          </div>
          
          {activeTab === 'users' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Recent Users</h2>
                  </div>
                  <UserTable 
                    users={users} 
                    onVerify={handleVerify} 
                    onBan={handleBan} 
                  />
                </div>
              </div>
              
              <div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Pending Verifications</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {verifications.length > 0 ? (
                      verifications.map(user => (
                        <VerificationCard 
                          key={user.id}
                          user={user}
                          onVerify={handleVerify}
                          onReject={handleReject}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No pending verifications
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Recent Rides</h2>
              </div>
              <RideTable 
                rides={rides} 
                onCancel={handleCancelRide}
                currentPage={currentRidePage}
                total={totalRides}
                onPageChange={handleRidePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}