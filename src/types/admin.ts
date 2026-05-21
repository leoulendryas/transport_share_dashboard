// src/types/admin.ts

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token:  string;
  refresh_token: string;
}

export interface LoginPayload {
  email?:        string;
  phone_number?: string;
  password:      string;
}

export interface LoginResponse extends AuthTokens {
  user:          AdminUser;
}

export interface TwoFARequiredResponse {
  requires_2fa: true;
  method:       'phone' | 'email';
  temp_token:   string;
}

export interface Verify2FAPayload {
  temp_token: string;
  otp:        string;
}

export interface GoogleSignInPayload {
  id_token: string;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export type MemberLevel = 'Standard' | 'Premium' | 'Elite';

export interface AdminUser {
  id:                    number;
  email:                 string | null;
  phone_number:          string | null;
  first_name:            string;
  last_name:             string;
  profile_photo:         string | null;
  is_admin:              boolean;
  is_driver:             boolean;
  banned:                boolean;
  suspended_until:       string | null;
  suspension_reason:     string | null;
  email_verified:        boolean;
  phone_verified:        boolean;
  id_verified:           boolean;
  license_verified:      boolean;
  id_number:             string | null;
  verification_submitted_at: string | null;
  oauth_provider:        string | null;
  two_factor_enabled:    boolean;
  member_level:          MemberLevel;
  rating_penalty:        number;
  cancellation_count:    number;
  created_at:            string;
  last_login:            string | null;
  id_image_url:          string | null;
  driving_license_url:   string | null;
  rejection_reason:      string | null;
  preferred_bank:        string | null;
  bank_account_number:   string | null;
  bio:                   string | null;
  social_vibe:           number;
  chattiness_pref:       number;
  music_pref:            number;
  smoking_pref:          number;
  pets_pref:             number;
}

export interface UserDetail extends AdminUser {
  vehicles:       Vehicle[];
  recentReviews:  Review[];
  recentRides:    Ride[];
  intelligence_audit: {
    potential_conflicts:         ScheduleConflict[];
    has_suspicious_cancellations: boolean;
  };
}

export interface ScheduleConflict {
  ride_1:           number;
  ride_2:           number;
  departure_time:   string;
  estimated_arrival: string;
}

export interface PaginatedResponse<T> {
  results:    T[];
  pagination: { page: number; limit: number; total: number };
}

// ─── Rides ───────────────────────────────────────────────────────────────────

export type RideStatus =
  | 'active' | 'full' | 'ongoing' | 'pending_completion'
  | 'completed' | 'cancelled' | 'disputed' | 'expired';

export interface Ride {
  id:               number;
  driver_id:        number;
  driver_email:     string;
  driver_name:      string;
  driver_phone:     string;
  from_address:     string;
  to_address:       string;
  from_lat:         number;
  from_lng:         number;
  to_lat:           number;
  to_lng:           number;
  departure_time:   string;
  estimated_arrival: string;
  actual_start_at:  string | null;
  total_seats:      number;
  seats_available:  number;
  price_per_seat:   number;
  total_trip_cost:  number;
  status:           RideStatus;
  distance:         number;
  duration:         number;
  ladies_only:      boolean;
  pets_allowed?:    boolean;
  smoking_allowed?: boolean;
  max_back_seats?:  boolean;
  approval_mode?:   boolean;
  luggage_size?:    string;
  brand_name?:      string;
  plate_number?:    string;
  color?:           string;
  meeting_point_details?: string;
  created_at:       string;
  chat_locked_at:   string | null;
  chat_unlocked_at: string | null;
  payment_released: boolean;
  payment_released_at?: string | null;
  route_geometry:   GeoJSONLineString | null;
  pricing_audit?: {
    base_price:       number;
    platform_fee:     number;
    ceiling_limit:    number;
    floor_limit:      number;
    is_near_ceiling:  boolean;
    is_below_floor:   boolean;
    booking_summary: {
      total_passenger_payable: number;
    };
    platform_fee_breakdown: {
      total_platform_fee: number;
      vat: number;
      base_service_fee: number;
    };
  };
  compliance_audit?: {
    ladies_only_violation: boolean;
    driver_verified:       boolean;
    driver_has_overlaps:   boolean;
    driver_overlap_details: OverlapDetail[];
  };
  intelligence_audit?: {
    high_cancellation_rate: boolean;
    unusual_pricing:        boolean;
  };
  stopovers:        Stopover[] | null;
  company_id:       number | null;
}

export interface RideDetail extends Ride {
  pricing_audit: {
    base_price:       number;
    platform_fee:     number;
    ceiling_limit:    number;
    floor_limit:      number;
    is_near_ceiling:  boolean;
    is_below_floor:   boolean;
    booking_summary: {
      total_passenger_payable: number;
    };
    platform_fee_breakdown: {
      total_platform_fee: number;
      vat: number;
      base_service_fee: number;
    };
  };
  compliance_audit: {
    ladies_only_violation: boolean;
    driver_verified:       boolean;
    driver_has_overlaps:   boolean;
    driver_overlap_details: OverlapDetail[];
  };
  intelligence_audit: {
    high_cancellation_rate: boolean;
    unusual_pricing:        boolean;
  };
  participants?:      RideParticipant[];
  status_history?:    RideStatusHistoryEntry[];
}

export interface Stopover {
  id:          number;
  address:     string;
  stop_order:  number;
  lat:         number;
  lng:         number;
}

export interface OverlapDetail {
  id:               number;
  status:           RideStatus;
  departure_time:   string;
  estimated_arrival: string;
}

export interface GeoJSONLineString {
  type:        'LineString';
  coordinates: [number, number][];
}

export interface RideParticipant {
  user_id:            number;
  ride_id:            number;
  is_driver:          boolean;
  seats_booked:       number;
  status:             string;
  payment_status:     string;
  is_no_show:         boolean;
  first_name:         string;
  last_name:          string;
  email:              string;
  phone_number:       string;
  profile_photo:      string | null;
  payment_amount:     number | null;
  payment_status_detailed: string | null;
  payment_ref:        string | null;
  released_to_driver: boolean | null;
  released_at:        string | null;
}

export interface RideStatusHistoryEntry {
  status:           RideStatus;
  timestamp:        string;
  created_at?:      string;
  notes?:           string;
  changed_by_name:  string | null;
  changed_by_email: string | null;
  changed_by_id:    number | null;
}

export interface RideVerification {
  id:          number;
  ride_id:     number;
  user_id:     number;
  status:      'pending' | 'confirmed';
  admin_override: boolean;
  verified_at: string | null;
  created_at:  string;
  first_name:  string;
  last_name:   string;
  email:       string;
}

export interface IntelligenceRide extends Ride {
  driver_cancellations: number;
  driver_penalty:       number;
  passenger_count:      number;
  report_count:         number;
  sos_count:            number;
}

// ─── Payments ────────────────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface Payment {
  id:                  number;
  ride_id:             number;
  user_id:             number;
  amount:              number;
  status:              PaymentStatus;
  reference:           string;
  released_to_driver:  boolean;
  released_at:         string | null;
  refunded_at:         string | null;
  refund_reason:       string | null;
  created_at:          string;
  user_email:          string | null;
  from_address:        string | null;
  to_address:          string | null;
}

// ─── Vehicles ────────────────────────────────────────────────────────────────

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Vehicle {
  id:                   number;
  owner_id:             number;
  make:                 string;
  model:                string;
  year:                 number;
  plate_number:         string;
  license_plate?:       string;
  color:                string;
  is_verified:          boolean;
  verification_status:  VerificationStatus;
  registration_doc_url: string | null;
  verification_notes:   string | null;
  created_at:           string;
  owner_email:          string;
  first_name:           string;
  last_name:            string;
  company_id?:          number;
}

// ─── Reports & SOS ───────────────────────────────────────────────────────────

export interface Report {
  id:              number;
  reporter_id:     number;
  reported_user_id: number;
  ride_id:         number | null;
  description:     string;
  status:          'pending' | 'resolved' | 'dismissed';
  admin_notes:     string | null;
  resolved_at:     string | null;
  created_at:      string;
  reporter_email:  string;
  reporter_name:   string;
  reported_email:  string;
  reported_name:   string;
}

export interface SOSAlert {
  id:                 number;
  user_id:            number;
  ride_id:            number;
  status:             'active' | 'resolved';
  admin_notes:        string | null;
  authority_dispatch: boolean;
  resolved_at:        string | null;
  created_at:         string;
  email:              string;
  phone_number:       string;
  first_name:         string;
  last_name:          string;
  from_address:       string;
  to_address:         string;
  ride_status:        RideStatus;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface Review {
  id:             number;
  reviewer_id:    number;
  reviewee_id:    number;
  ride_id:        number;
  rating:         number;
  comment:        string | null;
  created_at:     string;
  reviewer_name:  string;
  reviewee_name:  string;
}

// ─── Messages ────────────────────────────────────────────────────────────────

export interface Message {
  id:           number;
  ride_id:      number;
  user_id:      number;
  content:      string;
  message?:      string;
  message_text?: string;
  created_at:   string;
  email:        string;
  first_name:   string;
  last_name:    string;
  from_address?: string;
  to_address?:   string;
}

// ─── Companies ───────────────────────────────────────────────────────────────

export interface Company {
  id:         number;
  name:       string;
  is_active:  boolean;
  created_at: string;
}

export interface CompanyStat extends Company {
  total_rides:      number;
  total_passengers: number;
  total_revenue:    number;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers:  number;
  activeRides: number;
  pendingVerifications: {
    ids:      number;
    licenses: number;
    vehicles: number;
  };
  pendingReports: number;
  activeSOS:      number;
  growth: { last24h: number; prev24h: number };
  rideStats: {
    totalRides:      number;
    activeRides:     number;
    completedRides:  number;
    cancelledRides:  number;
    disputedRides:   number;
    averageSeats:    number;
  };
  paymentStats: {
    totalPayments:      number;
    successfulPayments: number;
    totalRevenue:       number;
    pendingPayouts:     number;
  };
}

export interface GrowthStats {
  users_this_week:  number;
  users_last_week:  number;
  rev_this_week:    number;
  rev_last_week:    number;
  user_growth_pct:  number;
  rev_growth_pct:   number;
}

// ─── System ──────────────────────────────────────────────────────────────────

export type SystemSettings = Record<string, string>;

export interface AuditLog {
  id:          number;
  user_id:     number;
  admin_id:    number;
  action:      string;
  metadata:    Record<string, unknown>;
  created_at:  string;
  admin_email: string | null;
}

// ─── Error ───────────────────────────────────────────────────────────────────

export interface ApiError {
  error:   string;
  errors?: { msg: string; param: string; location: string }[];
}
