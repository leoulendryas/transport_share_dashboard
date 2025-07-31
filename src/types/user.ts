export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  created_at: string;
  email_verified: boolean;
  phone_verified: boolean;
  id_verified: boolean;
  banned: boolean;
  is_admin: boolean;
  is_driver: boolean;
  id_image_url?: string;
  age?: number;
  gender?: string;
  profile_image_url?: string;
  verification_status?: 'pending' | 'approved' | 'rejected';
}

export interface IDVerificationData {
  first_name: string;
  last_name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  id_type: string;
}

export interface Admin {
  id: number;
  name: string;
  role: string;
  token: string;
  refreshToken: string;
}

export interface Stats {
  totalUsers: number;
  activeRides: number;
  pendingVerifications: number;
  reports: number;
}

export interface Ride {
  id: number;
  driver_id: number;
  from_address: string;
  to_address: string;
  total_seats: number;
  seats_available: number;
  departure_time: string | null;
  status: 'active' | 'full' | 'ongoing' | 'completed' | 'cancelled' | 'disputed';
  created_at: string;
  plate_number: string;
  color: string;
  brand_name: string;
  price_per_seat: number;
  driver?: User;
  participants?: User[];
}

export interface RideStats {
  totalRides: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
  disputedRides: number;
  averageSeats: number;
}

export interface Stats {
  totalUsers: number;
  activeRides: number;
  pendingVerifications: number;
  reports: number;
  rideStats: RideStats;
}