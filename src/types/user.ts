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
  license_verified: boolean;
  banned: boolean;
  is_admin: boolean;
  id_image_url?: string;
  driving_license_url?: string;
  age?: number;
  gender?: string;
  profile_image_url?: string;
  verification_submitted_at?: string;
  preferred_bank?: string;
  bank_account_number?: string;
  member_level?: string;
  last_login?: string;
  failed_login_attempts?: number;
  lockout_until?: string;
  rejection_reason?: string;
}

export interface DetailedUser extends User {
  vehicles: Vehicle[];
  recentReviews: Review[];
  recentRides: Ride[];
}

export interface AdminLoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Stats {
  totalUsers: number;
  activeRides: number;
  pendingVerifications: {
    ids: number;
    licenses: number;
    vehicles: number;
  };
  pendingReports: number;
  activeSOS: number;
  growth: {
    last24h: number;
    prev24h: number;
  };
  rideStats: RideStats;
  paymentStats: {
    totalPayments: number;
    successfulPayments: number;
    totalRevenue: number;
    pendingPayouts: number;
  };
}

export interface Vehicle {
  id: number;
  owner_id: number;
  license_plate: string;
  make: string;
  model: string;
  year?: number;
  color: string;
  is_verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  registration_doc_url?: string;
  verification_notes?: string;
  created_at: string;
  owner_email?: string;
  first_name?: string;
  last_name?: string;
}

export interface Review {
  id: number;
  reviewer_id: number;
  reviewee_id: number;
  ride_id: number;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name?: string;
  reviewee_name?: string;
}

export interface SOSAlert {
  id: number;
  user_id: number;
  ride_id: number;
  latitude: number;
  longitude: number;
  status: 'active' | 'resolved';
  created_at: string;
  resolved_at?: string;
  admin_notes?: string;
  resolved_by?: number;
  email?: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  from_address?: string;
  to_address?: string;
  ride_status?: string;
}

export interface RideParticipant {
  id: number;
  user_id: number;
  ride_id: number;
  seats_booked: number;
  status: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface Stopover {
  id: number;
  ride_id: number;
  address: string;
  latitude: number;
  longitude: number;
  stop_order: number;
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
  driver_email?: string;
  driver_name?: string;
  driver_phone?: string;
  participants?: RideParticipant[];
  stopovers?: Stopover[];
}

export interface RideStats {
  totalRides: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
  disputedRides: number;
  averageSeats: number;
}

export interface Report {
  id: number;
  reporter_id: number;
  reported_user_id: number;
  reporter_email?: string;
  reporter_name?: string;
  reported_email?: string;
  reported_name?: string;
  ride_id?: number;
  reason: string;
  description?: string;
  admin_notes?: string;
  resolved_at?: string;
  resolved_by?: number;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface Payment {
  id: number;
  ride_id: number;
  user_id: number;
  amount: number;
  status: string;
  released_to_driver: boolean;
  released_at?: string;
  payment_reference?: string;
  created_at: string;
  updated_at?: string;
  user_email?: string;
  from_address?: string;
  to_address?: string;
}

export interface Company {
  id: number;
  name: string;
  created_at?: string;
}

export interface Message {
  id: number;
  user_id: number;
  ride_id: number;
  message_text?: string;
  message?: string;
  content?: string;
  created_at: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
