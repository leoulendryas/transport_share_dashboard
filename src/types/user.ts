export interface User {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  created_at: string;
  email_verified: boolean;
  phone_verified: boolean;
  id_verified: boolean;
  license_verified: boolean;
  banned: boolean;
  is_admin: boolean;
  id_image_url: string | null;
  driving_license_url: string | null;
  age: number | null;
  gender: string | null;
  profile_photo: string | null;
  profile_image_url?: string;
  verification_submitted_at: string | null;
  preferred_bank: string | null;
  bank_account_number: string | null;
  member_level: 'Newcomer' | 'Standard' | 'Premium' | 'Elite';
  last_login: string | null;
  failed_login_attempts?: number;
  lockout_until?: string;
  rejection_reason: string | null;
  suspended_until: string | null;
  suspension_reason: string | null;
  oauth_provider: 'google' | null;
  oauth_id: string | null;
  bio: string | null;
  social_vibe: number;
  chattiness_pref: number;
  music_pref: number;
  smoking_pref: number;
  pets_pref: number;
  cancellation_count: number;
  is_driver: boolean;
}

export interface DetailedUser extends User {
  vehicles: Vehicle[];
  recentReviews: Review[];
  recentRides: Ride[];
  intelligence_audit: {
    potential_conflicts: any[];
    has_suspicious_cancellations: boolean;
  };
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
  company_id?: number;
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
  lat: number;
  lng: number;
  stop_order: number;
}

export interface PricingAudit {
  price_per_seat: number;
  min_price: number;
  max_price: number;
  booking_summary: {
    seats_booked: number;
    seat_price_total_offline: number;
    platform_fee_total_online: number;
    total_passenger_payable: number;
  };
  platform_fee_breakdown: {
    base_service_fee: number;
    vat: number;
    chapa_processing: number;
    total_platform_fee: number;
  };
  distance_km: number;
  duration_minutes: number;
  base_price_per_seat: number;
  ceiling_limit: number;
  floor_limit: number;
  is_near_ceiling: boolean;
}

export interface ComplianceAudit {
  ladies_only_violation: boolean;
  driver_verified: boolean;
}

export interface Ride {
  id: number;
  driver_id: number;
  driver_email: string;
  driver_name: string;
  driver_phone: string | null;
  from_address: string;
  to_address: string;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
  departure_time: string | null;
  estimated_arrival: string | null;
  distance: number;
  duration: number;
  status: 'active' | 'full' | 'ongoing' | 'pending_completion' | 'completed' | 'cancelled' | 'disputed';
  total_seats: number;
  seats_available: number;
  price_per_seat: string;
  total_trip_cost: string;
  plate_number: string;
  color: string;
  brand_name: string;
  vehicle_id: number;
  approval_mode: boolean;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  ladies_only: boolean;
  luggage_size: 'small' | 'medium' | 'large';
  max_back_seats: boolean;
  meeting_point_details: string | null;
  payment_released: boolean;
  payment_released_at: string | null;
  completed_at: string | null;
  chat_locked_at: string | null;
  chat_unlocked_at: string | null;
  created_at: string;
  route_geometry?: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  stopovers?: Stopover[];
  pricing_audit?: PricingAudit;
  compliance_audit?: ComplianceAudit;
  company_id: number | null;
  participants?: RideParticipant[];
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
