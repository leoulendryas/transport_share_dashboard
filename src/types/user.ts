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
  id_image_url?: string;
  age?: number;
  gender?: string;
  profile_image_url?: string;
  verification_submitted_at?: string;
  preferred_bank?: string;
  bank_account_number?: string;
}

export interface AdminLoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface IDVerificationData {
  first_name: string;
  last_name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  id_type: string;
  preferred_bank?: string;
  bank_account_number?: string;
}

export interface PendingVerification {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  created_at: string;
  id_image_url: string;
  age?: number;
  gender?: string;
  preferred_bank?: string;
  bank_account_number?: string;
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
  rideStats: RideStats;
}

// NEW: RideParticipant type
export interface RideParticipant {
  first_name: string;
  last_name: string;
  email: string;
  is_driver?: boolean; // optional flag
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
  participants?: RideParticipant[]; // updated type here
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
  reported_email?: string;
  ride_id?: number;
  reason: string;
  description?: string;
  resolved: boolean;
  created_at: string;
  status?: 'pending' | 'resolved';
}

// FIXED: Added payment_reference to satisfy PaymentsPage.tsx
export type Payment = {
  id: number;
  ride_id: number;
  driver_id: number;
  driver_email: string;
  amount: number;
  status: string;
  created_at: string;
  payment_reference?: string; // Added this line
  from_address?: string;
  to_address?: string;
};

export interface Config {
  id: number;
  key: string;
  value: string;
  updated_at: string;
  maxRideDistance: number;
  commissionRate: number;
  supportEmail: string;
}

export interface VerificationStatus {
  status: 'banned' | 'not_submitted' | 'pending' | 'verified';
  message: string;
  submitted_at: string | null;
}

export interface LoginCredentials {
  email?: string;
  phone_number?: string;
  password: string;
}

export interface OTPLoginCredentials {
  phone_number: string;
  otp: string;
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
