# Gara Admin API — Complete Next.js Integration Reference

> **Audience:** This document is the authoritative integration guide for any Next.js AI agent, developer, or automated system consuming the Gara Admin backend. Every endpoint is documented with exact request shapes, response shapes, error codes, TypeScript types, and ready-to-use Next.js patterns.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Environment & Base Configuration](#2-environment--base-configuration)
3. [TypeScript Type System](#3-typescript-type-system)
4. [HTTP Client Setup — Axios with Token Lifecycle](#4-http-client-setup--axios-with-token-lifecycle)
5. [Authentication Module](#5-authentication-module)
6. [Dashboard & Analytics](#6-dashboard--analytics)
7. [User Management](#7-user-management)
8. [ID Verification](#8-id-verification)
9. [License Verification](#9-license-verification)
10. [Vehicle Verification](#10-vehicle-verification)
11. [Ride Management](#11-ride-management)
12. [Finance & Payments](#12-finance--payments)
13. [Reports & SOS](#13-reports--sos)
14. [Reviews & Messages](#14-reviews--messages)
15. [Companies](#15-companies)
16. [System Settings](#16-system-settings)
17. [Audit Logs](#17-audit-logs)
18. [Next.js Middleware — Auth Guard](#18-nextjs-middleware--auth-guard)
19. [Server Components vs Client Components — Decision Guide](#19-server-components-vs-client-components--decision-guide)
20. [Error Handling Reference](#20-error-handling-reference)
21. [WebSocket Integration](#21-websocket-integration)
22. [Complete API Surface Cheat Sheet](#22-complete-api-surface-cheat-sheet)

---

## 1. Architecture Overview

```
Next.js Admin Frontend
        │
        │  HTTPS + Bearer JWT
        ▼
Gara Admin REST API  (/api/admin/*)
        │
        ├── PostgreSQL (via parameterized pg queries)
        ├── Cloudinary  (image storage & cleanup)
        ├── Chapa       (Ethiopian payment gateway)
        ├── AfroMessage (SMS OTP)
        └── WebSocket   (real-time ride/user events)
```

**Auth model:** Two tokens are issued on every successful login.

| Token | Header / Storage | Lifetime | Purpose |
|---|---|---|---|
| `access_token` | `Authorization: Bearer <token>` | Short (minutes) | Every authenticated request |
| `refresh_token` | HttpOnly cookie or secure storage | Long (days) | Obtain new access token silently |

**Admin gate:** Every protected endpoint checks `req.user.is_admin === true` server-side in addition to JWT validity. A valid JWT from a non-admin user will receive `403 Admin privileges required`.

**2FA gate:** If an admin has `two_factor_enabled = true`, login returns `requires_2fa: true` and a short-lived `temp_token`. The final tokens are only issued after `/verify-2fa` succeeds.

---

## 2. Environment & Base Configuration

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://api.gara.app/api/admin
NEXT_PUBLIC_WS_URL=wss://api.gara.app
```

```ts
// lib/config.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
export const WS_BASE  = process.env.NEXT_PUBLIC_WS_URL!;
```

---

## 3. TypeScript Type System

Paste this block into `types/admin.ts`. Every hook, server action, and component in the rest of this document references these types.

```ts
// types/admin.ts

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
  banned:                boolean;
  suspended_until:       string | null;
  suspension_reason:     string | null;
  email_verified:        boolean;
  phone_verified:        boolean;
  id_verified:           boolean;
  license_verified:      boolean;
  oauth_provider:        string | null;
  two_factor_enabled:    boolean;
  member_level:          MemberLevel;
  rating_penalty:        number;
  cancellation_count:    number;
  created_at:            string;
  last_login:            string | null;
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
  status:           RideStatus;
  distance:         number;
  duration:         number;
  ladies_only:      boolean;
  created_at:       string;
  route_geometry:   GeoJSONLineString | null;
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
  color:                string;
  is_verified:          boolean;
  verification_status:  VerificationStatus;
  registration_doc_url: string | null;
  verification_notes:   string | null;
  created_at:           string;
  owner_email:          string;
  first_name:           string;
  last_name:            string;
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
```

---

## 4. HTTP Client Setup — Axios with Token Lifecycle

Create this once. Every API module in subsequent sections imports from it.

```ts
// lib/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE } from '@/lib/config';

// ─── Token store (works for both browser and SSR) ───────────────────────────
// In production, replace with an HttpOnly cookie strategy for the refresh token.

let accessToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem('gara_access') : null;
let refreshToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem('gara_refresh') : null;

export const tokenStore = {
  get access()  { return accessToken; },
  get refresh() { return refreshToken; },

  set(tokens: { access_token: string; refresh_token: string }) {
    accessToken  = tokens.access_token;
    refreshToken = tokens.refresh_token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gara_access',  tokens.access_token);
      localStorage.setItem('gara_refresh', tokens.refresh_token);
    }
  },

  clear() {
    accessToken  = null;
    refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gara_access');
      localStorage.removeItem('gara_refresh');
    }
  }
};

// ─── Axios instance ──────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (tokenStore.access) {
    config.headers.Authorization = `Bearer ${tokenStore.access}`;
  }
  return config;
});

// ─── Silent token refresh on 401 ─────────────────────────────────────────────

let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Attempt one silent refresh on 401, but not on auth routes themselves
    if (
      error.response?.status === 401 &&
      !original._retry &&
      tokenStore.refresh &&
      !original.url?.includes('/login') &&
      !original.url?.includes('/verify-2fa')
    ) {
      original._retry = true;

      // Deduplicate concurrent refresh calls
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const { data } = await axios.post(`${API_BASE}/refresh`, {
              refresh_token: tokenStore.refresh,
            });
            tokenStore.set(data);
          } catch {
            tokenStore.clear();
            window.location.href = '/login';
          } finally {
            refreshPromise = null;
          }
        })();
      }

      await refreshPromise;
      original.headers.Authorization = `Bearer ${tokenStore.access}`;
      return api(original);
    }

    return Promise.reject(error);
  }
);
```

### Extracting typed error messages

```ts
// lib/api/errors.ts
import { AxiosError } from 'axios';
import type { ApiError } from '@/types/admin';

export function extractError(err: unknown): string {
  const axErr = err as AxiosError<ApiError>;
  if (axErr.response?.data?.error)  return axErr.response.data.error;
  if (axErr.response?.data?.errors) return axErr.response.data.errors.map(e => e.msg).join(', ');
  return 'An unexpected error occurred';
}
```

---

## 5. Authentication Module

```ts
// lib/api/auth.ts
import { api } from './client';
import { tokenStore } from './client';
import type {
  LoginPayload, LoginResponse, TwoFARequiredResponse,
  Verify2FAPayload, AuthTokens, AdminUser, GoogleSignInPayload
} from '@/types/admin';

type LoginResult = LoginResponse | TwoFARequiredResponse;

export const authApi = {

  /**
   * POST /login
   * Accepts email+password or phone_number+password.
   * Returns either full tokens (LoginResponse) or a 2FA challenge.
   */
  async login(payload: LoginPayload): Promise<LoginResult> {
    const { data } = await api.post<LoginResult>('/login', payload);
    if (!('requires_2fa' in data)) tokenStore.set(data);
    return data;
  },

  /**
   * POST /verify-2fa
   * Called only when login() returns { requires_2fa: true }.
   * temp_token is short-lived (5 min). OTP is TOTP — do not cache it.
   */
  async verify2FA(payload: Verify2FAPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/verify-2fa', payload);
    tokenStore.set(data);
    return data;
  },

  /**
   * POST /google-signin
   * For admins who authenticate via Google OAuth.
   * id_token comes from the Google Identity Services SDK on the client.
   */
  async googleSignIn(payload: GoogleSignInPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/google-signin', payload);
    tokenStore.set(data);
    return data;
  },

  /**
   * POST /link-google  [authenticated]
   * Links a Google account to the currently logged-in admin.
   */
  async linkGoogle(payload: GoogleSignInPayload): Promise<{ message: string; user: AdminUser }> {
    const { data } = await api.post('/link-google', payload);
    return data;
  },

  logout() {
    tokenStore.clear();
    window.location.href = '/login';
  }
};
```

### Login flow — complete Next.js component

```tsx
// app/login/LoginForm.tsx
'use client';
import { useState }   from 'react';
import { useRouter }  from 'next/navigation';
import { authApi }    from '@/lib/api/auth';
import { extractError } from '@/lib/api/errors';

export default function LoginForm() {
  const router  = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp]           = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [otpMethod, setOtpMethod] = useState<'phone' | 'email' | null>(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const result = await authApi.login({ email, password });
      if ('requires_2fa' in result) {
        setTempToken(result.temp_token);
        setOtpMethod(result.method);
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    if (!tempToken) return;
    setLoading(true); setError('');
    try {
      await authApi.verify2FA({ temp_token: tempToken, otp });
      router.replace('/dashboard');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }

  if (tempToken) {
    return (
      <form onSubmit={handleVerify2FA}>
        <p>Enter the code sent to your {otpMethod}:</p>
        <input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" disabled={loading}>Verify</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" disabled={loading}>Login</button>
    </form>
  );
}
```

### Error codes — Auth

| Code | Meaning |
|---|---|
| 400 | Missing email/phone or password |
| 401 | Invalid credentials / unverified account / 2FA session expired |
| 403 | Banned account / not an admin |
| 429 | Too many 2FA attempts — user must log in again from scratch |
| 500 | Server-side auth failure |

---

## 6. Dashboard & Analytics

```ts
// lib/api/dashboard.ts
import { api } from './client';
import type { DashboardStats, GrowthStats } from '@/types/admin';

export const dashboardApi = {

  /**
   * GET /stats/dashboard
   * Returns a single object with all key platform metrics.
   * Runs 10 parallel DB queries — expect ~150–300ms on cold cache.
   */
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>('/stats/dashboard');
    return data;
  },

  /**
   * GET /stats/growth
   * Week-over-week user and revenue growth with percentage change.
   * growth_pct = 100 when previous week is zero (avoid division by zero).
   */
  async getGrowth(): Promise<GrowthStats> {
    const { data } = await api.get<GrowthStats>('/stats/growth');
    return data;
  }
};
```

**`GET /stats/dashboard` — Response**

```jsonc
{
  "totalUsers": 4821,
  "activeRides": 17,
  "pendingVerifications": { "ids": 5, "licenses": 3, "vehicles": 2 },
  "pendingReports": 12,
  "activeSOS": 1,
  "growth": { "last24h": 34, "prev24h": 29 },
  "rideStats": {
    "totalRides": 2103,
    "activeRides": 17,
    "completedRides": 1950,
    "cancelledRides": 120,
    "disputedRides": 8,
    "averageSeats": 3.2
  },
  "paymentStats": {
    "totalPayments": 1887,
    "successfulPayments": 1840,
    "totalRevenue": 492300.00,
    "pendingPayouts": 14
  }
}
```

**`GET /stats/growth` — Response**

```jsonc
{
  "users_this_week": 210,
  "users_last_week": 185,
  "rev_this_week": 54200.00,
  "rev_last_week": 49800.00,
  "user_growth_pct": 13.51,
  "rev_growth_pct": 8.84
}
```

---

## 7. User Management

```ts
// lib/api/users.ts
import { api } from './client';
import type {
  AdminUser, UserDetail, MemberLevel,
  PaginatedResponse, AuditLog
} from '@/types/admin';

export interface GetUsersParams {
  page?:                number;
  limit?:               number;
  search?:              string;
  banned?:              boolean;
  is_admin?:            boolean;
  verification_status?: 'pending_id' | 'pending_license';
}

export const usersApi = {

  /**
   * GET /users
   * Paginated, filterable list of all users.
   * Search matches: email, first_name, last_name, phone_number, id.
   */
  async list(params: GetUsersParams = {}): Promise<PaginatedResponse<AdminUser>> {
    const { data } = await api.get('/users', { params });
    return data;
  },

  /**
   * GET /users/:userId
   * Full user profile + vehicles + recent reviews + recent rides
   * + intelligence audit (schedule conflicts, cancellation flags).
   */
  async get(userId: number): Promise<UserDetail> {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  },

  /**
   * GET /users/:userId/audit-logs
   * Full history of admin actions performed on this user.
   */
  async getAuditLogs(userId: number): Promise<AuditLog[]> {
    const { data } = await api.get(`/users/${userId}/audit-logs`);
    return data;
  },

  /**
   * POST /users/:userId/ban
   * Permanently bans a user. Blocked if they have active rides or bookings.
   * Self-ban is blocked server-side.
   */
  async ban(userId: number): Promise<{ message: string }> {
    const { data } = await api.post(`/users/${userId}/ban`);
    return data;
  },

  /**
   * POST /users/:userId/unban
   */
  async unban(userId: number): Promise<{ message: string }> {
    const { data } = await api.post(`/users/${userId}/unban`);
    return data;
  },

  /**
   * POST /users/:userId/suspend
   * Temporary suspension. `days` defaults to 7 if omitted.
   * Blocked if user has active rides or bookings.
   */
  async suspend(userId: number, days: number, reason?: string): Promise<{
    message: string;
    suspended_until: string;
  }> {
    const { data } = await api.post(`/users/${userId}/suspend`, { days, reason });
    return data;
  },

  /**
   * POST /users/:userId/unsuspend
   */
  async unsuspend(userId: number): Promise<{ message: string }> {
    const { data } = await api.post(`/users/${userId}/unsuspend`);
    return data;
  },

  /**
   * POST /users/:userId/toggle-admin
   * Grants or revokes admin privileges. Cannot target yourself.
   */
  async toggleAdmin(userId: number, is_admin: boolean): Promise<{ message: string }> {
    const { data } = await api.post(`/users/${userId}/toggle-admin`, { is_admin });
    return data;
  },

  /**
   * POST /users/:userId/member-level
   * Valid levels: 'Standard' | 'Premium' | 'Elite'
   */
  async updateMemberLevel(userId: number, member_level: MemberLevel): Promise<{ message: string }> {
    const { data } = await api.post(`/users/${userId}/member-level`, { member_level });
    return data;
  }
};
```

**`GET /users` — Query Parameters**

| Param | Type | Description |
|---|---|---|
| `page` | number | Default: 1 |
| `limit` | number | Default: 10 |
| `search` | string | Searches email, name, phone, id |
| `banned` | boolean | Filter by banned status |
| `is_admin` | boolean | Filter admins only |
| `verification_status` | `pending_id` \| `pending_license` | Filter pending verifications |

**`GET /users/:userId` — Response (abridged)**

```jsonc
{
  "id": 42,
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "is_admin": false,
  "banned": false,
  "id_verified": true,
  "license_verified": false,
  "member_level": "Standard",
  "rating_penalty": 0,
  "cancellation_count": 2,
  "vehicles": [{ "id": 7, "make": "Toyota", "model": "Corolla", "is_verified": true }],
  "recentReviews": [{ "rating": 5, "comment": "Great driver", "reviewer_name": "Alice" }],
  "recentRides": [{ "id": 88, "status": "completed", "from_address": "Bole, Addis" }],
  "intelligence_audit": {
    "potential_conflicts": [],
    "has_suspicious_cancellations": false
  }
}
```

**Error codes — User actions**

| Code | Meaning |
|---|---|
| 400 | Self-action (ban yourself), invalid suspension duration |
| 400 | Active rides/bookings block ban or suspend |
| 404 | User not found |
| 500 | DB failure |

---

## 8. ID Verification

```ts
// lib/api/verifications.ts
import { api } from './client';
import type { AdminUser, PaginatedResponse } from '@/types/admin';

export const verificationsApi = {

  /**
   * GET /verifications
   * Users who have uploaded an ID image but are not yet verified.
   * Sorted oldest-first (FIFO queue).
   */
  async list(page = 1, limit = 10): Promise<PaginatedResponse<AdminUser>> {
    const { data } = await api.get('/verifications', { params: { page, limit } });
    return data;
  },

  /**
   * POST /users/:userId/verify-id/approve
   * Marks id_verified = true. Records approving admin + timestamp.
   */
  async approve(userId: number): Promise<{ message: string }> {
    const { data } = await api.post(`/users/${userId}/verify-id/approve`);
    return data;
  },

  /**
   * POST /users/:userId/verify-id/reject
   * Clears id_image_url (triggers Cloudinary cleanup in background).
   * Records rejection reason, rejecting admin, timestamp.
   */
  async reject(userId: number, reason: string): Promise<{ message: string }> {
    const { data } = await api.post(`/users/${userId}/verify-id/reject`, { reason });
    return data;
  }
};
```

**Cloudinary note:** On rejection the backend deletes the stored image asynchronously. The `id_image_url` field is nulled in the DB synchronously before the response returns, so the image will no longer appear in subsequent `GET /users/:userId` calls regardless of Cloudinary timing.

---

## 9. License Verification

```ts
// lib/api/licenses.ts
import { api } from './client';
import type { AdminUser, PaginatedResponse } from '@/types/admin';

export const licensesApi = {

  /**
   * GET /licenses
   * Users with a driving_license_url uploaded but license_verified = false.
   * Sorted oldest-first.
   */
  async list(page = 1, limit = 10): Promise<PaginatedResponse<AdminUser>> {
    const { data } = await api.get('/licenses', { params: { page, limit } });
    return data;
  },

  /**
   * POST /users/:userId/license/approve
   */
  async approve(userId: number): Promise<{ message: string }> {
    const { data } = await api.post(`/users/${userId}/license/approve`);
    return data;
  },

  /**
   * POST /users/:userId/license/reject
   * Clears driving_license_url + triggers Cloudinary cleanup.
   */
  async reject(userId: number, reason: string): Promise<{ message: string }> {
    const { data } = await api.post(`/users/${userId}/license/reject`, { reason });
    return data;
  }
};
```

---

## 10. Vehicle Verification

```ts
// lib/api/vehicles.ts
import { api } from './client';
import type { Vehicle } from '@/types/admin';

export const vehiclesApi = {

  /**
   * GET /vehicles/pending
   * Vehicles with verification_status = 'pending'.
   * Sorted oldest-first.
   */
  async listPending(page = 1, limit = 10): Promise<Vehicle[]> {
    const { data } = await api.get('/vehicles/pending', { params: { page, limit } });
    return data;
  },

  /**
   * POST /vehicles/:id/approve
   * Sets is_verified = true, verification_status = 'approved'.
   */
  async approve(id: number): Promise<{ message: string }> {
    const { data } = await api.post(`/vehicles/${id}/approve`);
    return data;
  },

  /**
   * POST /vehicles/:id/reject
   * Sets verification_status = 'rejected', stores reason.
   * Deletes registration_doc_url from Cloudinary in background.
   */
  async reject(id: number, reason: string): Promise<{ message: string }> {
    const { data } = await api.post(`/vehicles/${id}/reject`, { reason });
    return data;
  }
};
```

---

## 11. Ride Management

```ts
// lib/api/rides.ts
import { api } from './client';
import type {
  Ride, RideDetail, RideParticipant, RideStatusHistoryEntry,
  RideVerification, IntelligenceRide, RideStatus,
  PaginatedResponse
} from '@/types/admin';

export interface GetRidesParams {
  page?:          number;
  limit?:         number;
  status?:        RideStatus;
  start_date?:    string;     // ISO 8601
  end_date?:      string;     // ISO 8601
  company_id?:    number;
  from_lat?:      number;
  from_lng?:      number;
  to_lat?:        number;
  to_lng?:        number;
  radius?:        number;     // metres, default 10000
  min_price?:     number;
  max_price?:     number;
}

export const ridesApi = {

  /**
   * GET /rides
   * Full paginated ride list with optional geo, price, status, date filters.
   * Returns coordinates extracted from PostGIS geometry columns.
   */
  async list(params: GetRidesParams = {}): Promise<PaginatedResponse<Ride>> {
    const { data } = await api.get('/rides', { params });
    return data;
  },

  /**
   * GET /rides/live
   * All rides with status = 'ongoing'. Includes driver info and current
   * passenger count. Poll this every 15–30s for a live dashboard view.
   */
  async getLive(): Promise<Ride[]> {
    const { data } = await api.get('/rides/live');
    return data;
  },

  /**
   * GET /rides/intelligence
   * Flagged rides: overdue, zero-price, high-cancel drivers, SOS, reports.
   * Sorted by severity (sos_count DESC, report_count DESC).
   * risk_level param is accepted but filtering is currently server-side fixed.
   */
  async getIntelligence(risk_level = 'high'): Promise<IntelligenceRide[]> {
    const { data } = await api.get('/rides/intelligence', { params: { risk_level } });
    return data;
  },

  /**
   * GET /rides/:rideId
   * Full ride detail with pricing audit, compliance audit, intelligence audit,
   * driver overlap detection, and parsed route GeoJSON.
   */
  async get(rideId: number): Promise<RideDetail> {
    const { data } = await api.get(`/rides/${rideId}`);
    return data;
  },

  /**
   * GET /rides/:rideId/history
   * Ordered list of all status transitions with admin attribution.
   */
  async getHistory(rideId: number): Promise<RideStatusHistoryEntry[]> {
    const { data } = await api.get(`/rides/${rideId}/history`);
    return data;
  },

  /**
   * GET /rides/:rideId/participants
   * All participants (driver first, then passengers).
   * Includes payment details joined from the payments table.
   */
  async getParticipants(rideId: number): Promise<RideParticipant[]> {
    const { data } = await api.get(`/rides/${rideId}/participants`);
    return data;
  },

  /**
   * GET /rides/:rideId/verifications
   * Ride completion verification records per participant.
   * admin_override = true means an admin confirmed on their behalf.
   */
  async getVerifications(rideId: number): Promise<RideVerification[]> {
    const { data } = await api.get(`/rides/${rideId}/verifications`);
    return data;
  },

  /**
   * GET /rides/:rideId/messages
   * All chat messages for a specific ride, ordered chronologically.
   */
  async getMessages(rideId: number): Promise<import('@/types/admin').Message[]> {
    const { data } = await api.get(`/rides/${rideId}/messages`);
    return data;
  },

  /**
   * POST /rides/:rideId/start
   * Force-starts a ride from 'active', 'full', or 'pending_approval'.
   * Broadcasts { type: 'ride_started' } via WebSocket to all participants.
   * `notes` appear in ride_status_history.
   */
  async start(rideId: number, notes?: string): Promise<{ message: string; status: 'ongoing' }> {
    const { data } = await api.post(`/rides/${rideId}/start`, { notes });
    return data;
  },

  /**
   * POST /rides/:rideId/complete
   * Force-completes a ride. resolve_verifications=true auto-confirms all
   * pending completion verifications before calling the canonical finalizer
   * (which releases driver payout, updates ratings, etc.).
   */
  async complete(rideId: number, notes?: string, resolve_verifications = true): Promise<{ message: string; status: 'completed' }> {
    const { data } = await api.post(`/rides/${rideId}/complete`, { notes, resolve_verifications });
    return data;
  },

  /**
   * POST /rides/:rideId/finalize
   * Only valid on rides in 'pending_completion' status.
   * Confirms any still-pending verifications and calls the canonical finalizer.
   * Use this when passengers/driver fail to confirm completion within the window.
   */
  async finalize(rideId: number, notes?: string): Promise<{ message: string }> {
    const { data } = await api.post(`/rides/${rideId}/finalize`, { notes });
    return data;
  },

  /**
   * POST /rides/:rideId/resolve-dispute
   * resolution = 'complete'  → resolves in favor of driver (triggers finalizer)
   * resolution = 'refund'    → cancels ride and refunds all passengers via Chapa
   */
  async resolveDispute(rideId: number, resolution: 'complete' | 'refund', notes: string): Promise<{ message: string; resolution: string }> {
    const { data } = await api.post(`/rides/${rideId}/resolve-dispute`, { resolution, notes });
    return data;
  },

  /**
   * POST /rides/:rideId/status
   * Free-form status override. Use sparingly — prefer the semantic endpoints
   * (start, complete, finalize, resolve-dispute) for auditable actions.
   */
  async updateStatus(rideId: number, status: RideStatus, notes?: string): Promise<{ message: string; from: RideStatus; to: RideStatus }> {
    const { data } = await api.post(`/rides/${rideId}/status`, { status, notes });
    return data;
  },

  /**
   * POST /rides/:rideId/cancel
   * Thin wrapper — runs the shared cancelRide utility which handles
   * seat restoration, notification, and payment rollback.
   */
  async cancel(rideId: number): Promise<{ message: string }> {
    const { data } = await api.post(`/rides/${rideId}/cancel`);
    return data;
  },

  /**
   * POST /rides/:rideId/toggle-chat
   * lock = true  → sets chat_locked_at = NOW()
   * lock = false → sets chat_unlocked_at = NOW()
   * Both broadcast a 'chat_status_update' WebSocket event.
   */
  async toggleChat(rideId: number, lock: boolean): Promise<{ message: string }> {
    const { data } = await api.post(`/rides/${rideId}/toggle-chat`, { lock });
    return data;
  },

  /**
   * PUT /rides/:rideId/details
   * Partial update of mutable ride fields.
   * Changing total_seats recalculates seats_available against current bookings.
   * Changing departure_time recalculates estimated_arrival from stored duration.
   * Broadcasts 'ride_updated' WebSocket event.
   */
  async updateDetails(rideId: number, payload: {
    departure_time?: string;
    total_seats?:    number;
    price_per_seat?: number;
    from_address?:   string;
    to_address?:     string;
    admin_notes?:    string;
  }): Promise<{ message: string }> {
    const { data } = await api.put(`/rides/${rideId}/details`, payload);
    return data;
  },

  /**
   * POST /rides/:rideId/participants/add
   * Manually adds a user to a ride. Does NOT charge them — use for comped seats.
   * status = 'confirmed' automatically sets payment_status = 'paid'.
   */
  async addParticipant(rideId: number, payload: {
    userId:        number;
    seats_booked?: number;  // default 1
    status?:       string;  // default 'confirmed'
    notes?:        string;
  }): Promise<{ message: string }> {
    const { data } = await api.post(`/rides/${rideId}/participants/add`, payload);
    return data;
  },

  /**
   * POST /rides/:rideId/participants/:userId/remove
   * Removes a passenger. Cannot remove the driver (cancel the ride instead).
   * refund = true triggers a full Chapa refund on their last successful payment.
   */
  async removeParticipant(rideId: number, userId: number, payload: {
    refund?: boolean;
    reason?: string;
  }): Promise<{ message: string; refund_processed: boolean }> {
    const { data } = await api.post(`/rides/${rideId}/participants/${userId}/remove`, payload);
    return data;
  },

  /**
   * POST /rides/:rideId/participants/:userId/no-show
   * Marks user as no-show, sets user_rides.status = 'cancelled',
   * returns their seats to the pool. apply_penalty = true (default) adds
   * 1.0 to their rating_penalty score.
   */
  async markNoShow(rideId: number, userId: number, payload: {
    notes?:         string;
    apply_penalty?: boolean;
  }): Promise<{ message: string; penalty_applied: boolean }> {
    const { data } = await api.post(`/rides/${rideId}/participants/${userId}/no-show`, payload);
    return data;
  }
};
```

**`GET /rides/:rideId` — Response (key fields)**

```jsonc
{
  "id": 101,
  "status": "active",
  "from_address": "Bole, Addis Ababa",
  "to_address": "Hawassa",
  "departure_time": "2025-06-01T07:00:00.000Z",
  "price_per_seat": 450.00,
  "seats_available": 2,
  "total_seats": 4,
  "route_geometry": { "type": "LineString", "coordinates": [[38.79, 9.01], [38.47, 7.05]] },
  "stopovers": [{ "id": 3, "address": "Debre Zeit", "stop_order": 1, "lat": 8.73, "lng": 38.98 }],
  "pricing_audit": {
    "ceiling_limit": 600.00,
    "floor_limit": 300.00,
    "is_near_ceiling": false,
    "is_below_floor": false
  },
  "compliance_audit": {
    "ladies_only_violation": false,
    "driver_verified": true,
    "driver_has_overlaps": false,
    "driver_overlap_details": []
  },
  "intelligence_audit": {
    "high_cancellation_rate": false,
    "unusual_pricing": false
  }
}
```

**`GET /rides/intelligence` — When a ride appears**

A ride appears in the intelligence feed if ANY of the following are true:

| Flag | Condition |
|---|---|
| Overdue to start | `status = 'active'` and `departure_time < NOW() - 2h` |
| Overdue to complete | `status = 'ongoing'` and `estimated_arrival < NOW() - 4h` |
| Risky driver | `driver_cancellations > 10` |
| Reported | `report_count > 0` |
| SOS active | `sos_count > 0` |
| Suspicious pricing | `price_per_seat = 0` |

---

## 12. Finance & Payments

```ts
// lib/api/payments.ts
import { api } from './client';
import type { Payment, PaymentStatus, PaginatedResponse } from '@/types/admin';

export interface GetPaymentsParams {
  page?:       number;
  limit?:      number;
  status?:     PaymentStatus;
  released?:   boolean;
  start_date?: string;
  end_date?:   string;
}

export const paymentsApi = {

  /**
   * GET /payments
   * Paginated payment list with status, release, and date filters.
   * Joined with user email and ride addresses.
   */
  async list(params: GetPaymentsParams = {}): Promise<PaginatedResponse<Payment>> {
    const { data } = await api.get('/payments', { params });
    return data;
  },

  /**
   * POST /payments/:id/update-status
   * Direct status field override. Setting released_to_driver = true
   * also writes released_at = NOW() automatically.
   * Prefer release-manual for payout releases (better audit trail).
   */
  async updateStatus(id: number, payload: {
    status?:             PaymentStatus;
    released_to_driver?: boolean;
  }): Promise<{ message: string }> {
    const { data } = await api.post(`/payments/${id}/update-status`, payload);
    return data;
  },

  /**
   * POST /payments/:paymentId/refund
   * Triggers a real Chapa refund. amount_percent = 1.0 = full refund.
   * Only works on payments with status = 'success'.
   * Notifies the user via WebSocket on success.
   */
  async refund(paymentId: number, amount_percent = 1.0, reason?: string): Promise<{ message: string }> {
    const { data } = await api.post(`/payments/${paymentId}/refund`, { amount_percent, reason });
    return data;
  },

  /**
   * POST /payments/:tx_ref/verify-manual
   * Re-verifies a Chapa transaction by reference and syncs DB state.
   * Use when a user's payment succeeded in Chapa but the webhook was missed.
   * Idempotent — if already 'success' returns already_synced: true.
   */
  async verifyManual(tx_ref: string): Promise<{ message: string; already_synced?: boolean; data: unknown }> {
    const { data } = await api.post(`/payments/${tx_ref}/verify-manual`);
    return data;
  },

  /**
   * POST /payments/:paymentId/release-manual
   * Sets released_to_driver = true with payout_manual_override = true.
   * Only works on success payments not yet released.
   * Better audited than update-status for driver payout scenarios.
   */
  async releaseManual(paymentId: number): Promise<{ message: string; payment: Payment }> {
    const { data } = await api.post(`/payments/${paymentId}/release-manual`);
    return data;
  }
};
```

**Payment status lifecycle**

```
pending ──► success ──► refunded
        └──► failed
```

`released_to_driver` is a separate flag on a `success` payment. A payment can be `success` with `released_to_driver = false` (held in escrow pending confirmation), or `released_to_driver = true` (paid out to driver).

**Error codes — Payments**

| Code | Meaning |
|---|---|
| 400 | Payment not found / wrong status / Chapa refund failed |
| 400 | Payment already released (release-manual) |
| 400 | Payment not successful (refund) |
| 500 | Chapa API unreachable |

---

## 13. Reports & SOS

```ts
// lib/api/moderation.ts
import { api } from './client';
import type { Report, SOSAlert, PaginatedResponse } from '@/types/admin';

export const moderationApi = {

  // ── Reports ────────────────────────────────────────────────────────────────

  /**
   * GET /reports
   * Paginated reports with optional status filter.
   * Joins reporter and reported user names + emails.
   */
  async listReports(page = 1, limit = 10, status?: 'pending' | 'resolved' | 'dismissed'): Promise<PaginatedResponse<Report>> {
    const { data } = await api.get('/reports', { params: { page, limit, status } });
    return data;
  },

  /**
   * POST /reports/:id/resolve
   * status: 'resolved' | 'dismissed' | 'pending'
   * On 'resolved', applies a rating_penalty to the reported user.
   * penalty defaults to 0.5 if omitted when resolving.
   * penalty = 0 to resolve without penalty.
   */
  async resolveReport(id: number, payload: {
    status?:  'resolved' | 'dismissed';
    notes?:   string;
    penalty?: number;
  }): Promise<{ message: string; penalty_applied: number }> {
    const { data } = await api.post(`/reports/${id}/resolve`, payload);
    return data;
  },

  // ── SOS ────────────────────────────────────────────────────────────────────

  /**
   * GET /sos
   * SOS alerts ordered newest-first.
   * Joined with user contact info and ride details.
   */
  async listSOS(page = 1, limit = 10, status?: 'active' | 'resolved'): Promise<SOSAlert[]> {
    const { data } = await api.get('/sos', { params: { page, limit, status } });
    return data;
  },

  /**
   * POST /sos/:id/resolve
   * Marks alert resolved, records admin notes and whether authorities were
   * dispatched. Broadcasts SOS_RESOLVED to all ride participants via WebSocket.
   */
  async resolveSOS(id: number, payload: {
    notes?:              string;
    authority_dispatch?: boolean;
  }): Promise<{ message: string }> {
    const { data } = await api.post(`/sos/${id}/resolve`, payload);
    return data;
  }
};
```

**`GET /sos` — Response row**

```jsonc
{
  "id": 3,
  "user_id": 99,
  "ride_id": 101,
  "status": "active",
  "authority_dispatch": false,
  "created_at": "2025-05-31T14:22:00.000Z",
  "email": "passenger@example.com",
  "phone_number": "+251912345678",
  "first_name": "Sara",
  "last_name": "Bekele",
  "from_address": "Bole, Addis",
  "to_address": "Hawassa",
  "ride_status": "ongoing"
}
```

---

## 14. Reviews & Messages

```ts
// lib/api/content.ts
import { api } from './client';
import type { Review, Message, PaginatedResponse } from '@/types/admin';

export interface GetMessagesParams {
  page?:   number;
  limit?:  number;
  search?: string;
  userId?: number;
  rideId?: number;
}

export const contentApi = {

  /**
   * GET /reviews
   * All reviews with optional min_rating filter.
   * Joins reviewer and reviewee names.
   */
  async listReviews(page = 1, limit = 10, min_rating?: number): Promise<Review[]> {
    const { data } = await api.get('/reviews', { params: { page, limit, min_rating } });
    return data;
  },

  /**
   * DELETE /reviews/:id
   */
  async deleteReview(id: number): Promise<{ message: string }> {
    const { data } = await api.delete(`/reviews/${id}`);
    return data;
  },

  /**
   * GET /messages
   * Cross-ride message search. Filterable by content (ILIKE), userId, rideId.
   * Joins user email and ride addresses.
   */
  async listMessages(params: GetMessagesParams = {}): Promise<PaginatedResponse<Message>> {
    const { data } = await api.get('/messages', { params });
    return data;
  },

  /**
   * DELETE /messages/:id
   * Deletes a single message. Logs admin + reason to server console.
   * reason field is optional but recommended for audit purposes.
   */
  async deleteMessage(id: number, reason?: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/messages/${id}`, { data: { reason } });
    return data;
  }
};
```

---

## 15. Companies

```ts
// lib/api/companies.ts
import { api } from './client';
import type { Company, CompanyStat } from '@/types/admin';

export const companiesApi = {

  /**
   * GET /companies
   * All companies ordered alphabetically.
   */
  async list(): Promise<Company[]> {
    const { data } = await api.get('/companies');
    return data;
  },

  /**
   * GET /companies/stats
   * Per-company aggregates: total rides, unique passengers, total revenue.
   * Ordered by revenue DESC.
   */
  async getStats(): Promise<CompanyStat[]> {
    const { data } = await api.get('/companies/stats');
    return data;
  },

  /**
   * POST /companies
   */
  async create(name: string): Promise<Company> {
    const { data } = await api.post('/companies', { name });
    return data;
  },

  /**
   * PUT /companies/:id
   */
  async update(id: number, payload: { name?: string; is_active?: boolean }): Promise<Company> {
    const { data } = await api.put(`/companies/${id}`, payload);
    return data;
  },

  /**
   * DELETE /companies/:id
   * Hard delete — ensure no rides are mapped to this company first
   * or the FK constraint will throw a 500.
   */
  async delete(id: number): Promise<{ message: string }> {
    const { data } = await api.delete(`/companies/${id}`);
    return data;
  }
};
```

---

## 16. System Settings

```ts
// lib/api/settings.ts
import { api } from './client';
import type { SystemSettings } from '@/types/admin';

export const settingsApi = {

  /**
   * GET /settings
   * Returns all key-value pairs from system_settings table as a flat object.
   * Common keys: maintenance_mode, max_price_multiplier, platform_fee_pct
   */
  async get(): Promise<SystemSettings> {
    const { data } = await api.get<SystemSettings>('/settings');
    return data;
  },

  /**
   * PUT /settings
   * Partial update — only send keys you want to change.
   * All values are stored as strings; cast on read.
   */
  async update(settings: Record<string, string>): Promise<{ message: string }> {
    const { data } = await api.put('/settings', { settings });
    return data;
  }
};
```

**Usage example — toggle maintenance mode**

```ts
await settingsApi.update({ maintenance_mode: 'true' });
```

---

## 17. Audit Logs

```ts
// lib/api/audit.ts
// Audit logs are fetched per-user via the users API.
// See usersApi.getAuditLogs(userId) in Section 7.
```

**`GET /users/:userId/audit-logs` — Response row**

```jsonc
{
  "id": 55,
  "user_id": 42,
  "admin_id": 1,
  "action": "ban",
  "metadata": { "reason": "Repeated no-shows" },
  "created_at": "2025-05-30T10:14:00.000Z",
  "admin_email": "admin@gara.app"
}
```

---

## 18. Next.js Middleware — Auth Guard

This middleware runs on every `/dashboard/*` and `/admin/*` route. It reads the access token from localStorage via a cookie mirror (see note below) and redirects unauthenticated requests to `/login`.

```ts
// middleware.ts  (Next.js App Router root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/login', '/api/'];
const JWT_SECRET   = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Read token from cookie (set it on login — see tip below)
  const token = request.cookies.get('gara_access')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.is_admin) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  } catch {
    // Expired or tampered — clear and redirect
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('gara_access');
    return response;
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/users/:path*', '/rides/:path*', '/settings/:path*'],
};
```

**Cookie tip:** When calling `tokenStore.set()` after login, also write the access token to a non-HttpOnly cookie so middleware can read it. The refresh token should remain in HttpOnly storage only.

```ts
// In tokenStore.set(), add:
document.cookie = `gara_access=${tokens.access_token}; path=/; SameSite=Strict`;
```

---

## 19. Server Components vs Client Components — Decision Guide

| Data | Pattern | Why |
|---|---|---|
| Dashboard stats (initial load) | Server Component + `fetch` | No auth state needed in browser, SEO irrelevant, eliminates loading flash |
| User list with live search | Client Component + SWR/React Query | User types → debounced refetch |
| Live rides map | Client Component + polling (15s) | Map interactions are client-side |
| Ride intelligence feed | Server Component with ISR (30s revalidation) | Fresh enough, no interactivity |
| SOS alerts | Client Component + WebSocket | Must react in real-time |
| Payment actions (refund, release) | Server Action | Mutation, no loading state needed in UI |

### Server Component data fetching example

```tsx
// app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { DashboardStats } from '@/types/admin';

async function getDashboardStats(): Promise<DashboardStats> {
  const token = cookies().get('gara_access')?.value;
  const res   = await fetch(`${process.env.API_BASE_URL}/stats/dashboard`, {
    headers:    { Authorization: `Bearer ${token}` },
    next:       { revalidate: 60 },  // ISR — revalidate every 60s
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return (
    <div>
      <h1>Total Users: {stats.totalUsers}</h1>
      <h1>Active Rides: {stats.activeRides}</h1>
      {/* ... */}
    </div>
  );
}
```

### Server Action example — ban user

```ts
// app/users/[userId]/actions.ts
'use server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function banUserAction(userId: number) {
  const token = cookies().get('gara_access')?.value;
  const res   = await fetch(`${process.env.API_BASE_URL}/users/${userId}/ban`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? 'Failed to ban user');
  }
  revalidatePath(`/users/${userId}`);
}
```

### SWR hook example — paginated user list

```ts
// hooks/useUsers.ts
import useSWR from 'swr';
import { usersApi } from '@/lib/api/users';
import type { GetUsersParams } from '@/lib/api/users';

export function useUsers(params: GetUsersParams) {
  return useSWR(
    ['users', params],
    () => usersApi.list(params),
    { keepPreviousData: true }  // prevents flicker on page change
  );
}
```

---

## 20. Error Handling Reference

### Global API error shape

Every error response from the backend is one of:

```jsonc
// Single error
{ "error": "Human-readable description" }

// Validation errors (express-validator)
{ "errors": [{ "msg": "Invalid email", "param": "email", "location": "body" }] }
```

### HTTP status codes

| Code | Meaning | Common causes |
|---|---|---|
| 400 | Bad request | Validation failed, invalid params, business rule violation (ban with active rides) |
| 401 | Unauthenticated | Missing/expired token, wrong credentials, 2FA session expired |
| 403 | Forbidden | Not an admin, account banned/suspended, self-action blocked |
| 404 | Not found | User/ride/payment/vehicle does not exist |
| 409 | Conflict | Google account already linked to another user |
| 429 | Rate limited | Too many 2FA attempts — user must start login again |
| 500 | Server error | DB failure, Cloudinary unreachable, Chapa API down |

### React error boundary for API pages

```tsx
// components/ApiErrorBoundary.tsx
'use client';
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; message: string }

export class ApiErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="text-red-600 p-4 border border-red-200 rounded">
          {this.state.message}
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

## 21. WebSocket Integration

The backend pushes real-time events to connected clients via WebSocket. Three event types are relevant to the admin frontend:

```ts
// lib/ws/useAdminSocket.ts
'use client';
import { useEffect, useRef } from 'react';
import { WS_BASE } from '@/lib/config';
import { tokenStore } from '@/lib/api/client';

type AdminWsEvent =
  | { type: 'ride_started';      ride_id: string; message: string; timestamp: string }
  | { type: 'ride_completed';    ride_id: string; message: string; timestamp: string }
  | { type: 'ride_status_update'; rideId: string; status: string; message: string }
  | { type: 'dispute_resolved';  rideId: string; resolution: string; message: string }
  | { type: 'chat_status_update'; locked: boolean; message: string }
  | { type: 'SOS_RESOLVED';      message: string }
  | { type: 'no_show_flagged';   rideId: string; message: string }
  | { type: 'payment_refunded';  amount_percent: number; message: string }
  | { type: 'removed_from_ride'; rideId: string; message: string }
  | { type: 'added_to_ride';     rideId: string; message: string };

export function useAdminSocket(onEvent: (event: AdminWsEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE}?token=${tokenStore.access}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const event: AdminWsEvent = JSON.parse(e.data);
        onEvent(event);
      } catch {
        console.warn('Unparseable WS message', e.data);
      }
    };

    ws.onerror = (e) => console.error('Admin WS error', e);

    ws.onclose = () => {
      // Reconnect after 3s unless the component unmounted
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          wsRef.current = new WebSocket(`${WS_BASE}?token=${tokenStore.access}`);
        }
      }, 3000);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [onEvent]);
}
```

**Usage — SOS live badge**

```tsx
'use client';
import { useState } from 'react';
import { useAdminSocket } from '@/lib/ws/useAdminSocket';

export function SOSBadge({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial);

  useAdminSocket((event) => {
    if (event.type === 'SOS_RESOLVED') setCount(c => Math.max(0, c - 1));
  });

  if (count === 0) return null;
  return <span className="bg-red-600 text-white rounded-full px-2 py-0.5 text-xs">{count}</span>;
}
```

---

## 22. Complete API Surface Cheat Sheet

| Method | Path | Controller | Auth |
|---|---|---|---|
| POST | `/login` | `login` | Public |
| POST | `/google-signin` | `googleSignIn` | Public |
| POST | `/verify-2fa` | `verify2FA` | Public |
| POST | `/link-google` | `linkGoogle` | Admin |
| GET | `/stats/dashboard` | `getDashboardStats` | Admin |
| GET | `/stats/growth` | `getGrowthStats` | Admin |
| GET | `/settings` | `getSystemSettings` | Admin |
| PUT | `/settings` | `updateSystemSettings` | Admin |
| GET | `/users` | `getUsers` | Admin |
| GET | `/users/:userId` | `getUserById` | Admin |
| GET | `/users/:userId/audit-logs` | `getUserAuditLogs` | Admin |
| POST | `/users/:userId/ban` | `banUser` | Admin |
| POST | `/users/:userId/unban` | `unbanUser` | Admin |
| POST | `/users/:userId/suspend` | `suspendUser` | Admin |
| POST | `/users/:userId/unsuspend` | `unsuspendUser` | Admin |
| POST | `/users/:userId/toggle-admin` | `toggleAdmin` | Admin |
| POST | `/users/:userId/member-level` | `updateMemberLevel` | Admin |
| GET | `/verifications` | `getVerifications` | Admin |
| POST | `/users/:userId/verify-id/approve` | `approveVerification` | Admin |
| POST | `/users/:userId/verify-id/reject` | `rejectVerification` | Admin |
| GET | `/licenses` | `getPendingLicenses` | Admin |
| POST | `/users/:userId/license/approve` | `approveLicense` | Admin |
| POST | `/users/:userId/license/reject` | `rejectLicense` | Admin |
| GET | `/vehicles/pending` | `getPendingVehicles` | Admin |
| POST | `/vehicles/:id/approve` | `approveVehicle` | Admin |
| POST | `/vehicles/:id/reject` | `rejectVehicle` | Admin |
| GET | `/rides` | `getRides` | Admin |
| GET | `/rides/live` | `getLiveRides` | Admin |
| GET | `/rides/intelligence` | `getRideIntelligence` | Admin |
| GET | `/rides/:rideId` | `getRideById` | Admin |
| GET | `/rides/:rideId/history` | `getRideStatusHistory` | Admin |
| GET | `/rides/:rideId/participants` | `getRideParticipants` | Admin |
| GET | `/rides/:rideId/verifications` | `getRideVerifications` | Admin |
| GET | `/rides/:rideId/messages` | `getRideMessages` | Admin |
| POST | `/rides/:rideId/start` | `adminStartRide` | Admin |
| POST | `/rides/:rideId/complete` | `adminCompleteRide` | Admin |
| POST | `/rides/:rideId/finalize` | `forceFinalizeRide` | Admin |
| POST | `/rides/:rideId/resolve-dispute` | `adminResolveDispute` | Admin |
| POST | `/rides/:rideId/status` | `updateRideStatus` | Admin |
| POST | `/rides/:rideId/cancel` | `cancelRide` | Admin |
| POST | `/rides/:rideId/toggle-chat` | `toggleRideChat` | Admin |
| PUT | `/rides/:rideId/details` | `adminUpdateRideDetails` | Admin |
| POST | `/rides/:rideId/participants/add` | `adminAddParticipant` | Admin |
| POST | `/rides/:rideId/participants/:userId/remove` | `adminRemoveParticipant` | Admin |
| POST | `/rides/:rideId/participants/:userId/no-show` | `adminHandleNoShow` | Admin |
| GET | `/payments` | `getPayments` | Admin |
| POST | `/payments/:id/update-status` | `updatePaymentStatus` | Admin |
| POST | `/payments/:paymentId/refund` | `manualRefund` | Admin |
| POST | `/payments/:tx_ref/verify-manual` | `verifyPaymentManually` | Admin |
| POST | `/payments/:paymentId/release-manual` | `releasePayoutManually` | Admin |
| GET | `/sos` | `getSOSAlerts` | Admin |
| POST | `/sos/:id/resolve` | `resolveSOS` | Admin |
| GET | `/reports` | `getReports` | Admin |
| POST | `/reports/:id/resolve` | `resolveReport` | Admin |
| GET | `/reviews` | `getReviews` | Admin |
| DELETE | `/reviews/:id` | `deleteReview` | Admin |
| GET | `/messages` | `getAllMessages` | Admin |
| DELETE | `/messages/:id` | `deleteMessage` | Admin |
| GET | `/companies` | `getCompanies` | Admin |
| GET | `/companies/stats` | `getCompanyStats` | Admin |
| POST | `/companies` | `createCompany` | Admin |
| PUT | `/companies/:id` | `updateCompany` | Admin |
| DELETE | `/companies/:id` | `deleteCompany` | Admin |

---

*Document version: aligned to adminController.js + adminRoutes.js as reviewed May 2026.*
