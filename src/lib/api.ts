import {
  User,
  Stats,
  AdminLoginResponse,
  Ride,
  RideStats,
  IDVerificationData,
  PendingVerification,
  Report,
  Payment,
  Config,
  VerificationStatus,
  LoginCredentials,
  OTPLoginCredentials,
  RefreshTokenResponse,
  ApiResponse
} from '@/types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper function to handle responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return response.json();
};

// Headers
const getHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const getFormDataHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

//
// 🔐 AUTHENTICATION ENDPOINTS
//

// Admin login
export const adminLogin = async (email: string, password: string): Promise<AdminLoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AdminLoginResponse>(response);
};

// Regular login
export const login = async (credentials: LoginCredentials): Promise<AdminLoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials),
  });
  return handleResponse<AdminLoginResponse>(response);
};

// OTP login
export const loginWithOTP = async (credentials: OTPLoginCredentials): Promise<AdminLoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login-otp`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials),
  });
  return handleResponse<AdminLoginResponse>(response);
};

// Refresh token
export const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return handleResponse<RefreshTokenResponse>(response);
};

// Logout
export const logout = async (token: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  return handleResponse<{ message: string }>(response);
};

// Request OTP
export const requestOTP = async (phone_number: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ phone_number }),
  });
  return handleResponse<{ message: string }>(response);
};

// Verify phone
export const verifyPhone = async (phone_number: string, otp: string): Promise<AdminLoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-phone`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ phone_number, otp }),
  });
  return handleResponse<AdminLoginResponse>(response);
};

// Resend verification email
export const resendVerificationEmail = async (email: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  });
  return handleResponse<{ message: string }>(response);
};

// Get verification status
export const getVerificationStatus = async (token: string): Promise<VerificationStatus> => {
  const response = await fetch(`${API_BASE_URL}/auth/verification-status`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<VerificationStatus>(response);
};

// Submit ID verification
export const submitIDVerification = async (
  token: string,
  data: IDVerificationData,
  file: File
): Promise<{ status: string; message: string; image_url: string; submitted_at: string }> => {
  const formData = new FormData();

  formData.append('first_name', data.first_name);
  formData.append('last_name', data.last_name);
  formData.append('age', data.age.toString());
  formData.append('gender', data.gender);
  formData.append('id_type', data.id_type);

  if (data.preferred_bank) {
    formData.append('preferred_bank', data.preferred_bank);
  }
  if (data.bank_account_number) {
    formData.append('bank_account_number', data.bank_account_number);
  }

  formData.append('id_image', file);

  const response = await fetch(`${API_BASE_URL}/auth/verify-identity`, {
    method: 'POST',
    headers: getFormDataHeaders(token),
    body: formData,
  });

  return handleResponse(response);
};

//
// 👤 USER MANAGEMENT (ADMIN)
//

// Get all users
export const getUsers = async (token: string): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/auth/admin/users`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<User[]>(response);
};

// Ban/Unban user
export const banUser = async (token: string, userId: number, banned: boolean): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/admin/ban-user`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ userId, banned }),
  });
  return handleResponse<{ message: string }>(response);
};

// Verify user ID (admin)
export const verifyUserID = async (token: string, userId: number): Promise<{ message: string; user_id: number }> => {
  const response = await fetch(`${API_BASE_URL}/auth/admin/verify-id`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ userId }),
  });
  return handleResponse<{ message: string; user_id: number }>(response);
};

// Reject verification
export const rejectVerification = async (
  token: string,
  userId: number,
  reason: string
): Promise<{ message: string; user_id: number }> => {
  const response = await fetch(`${API_BASE_URL}/auth/admin/reject-verification`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ userId, reason }),
  });
  return handleResponse<{ message: string; user_id: number }>(response);
};

// Get pending verifications
export const getPendingVerifications = async (token: string): Promise<PendingVerification[]> => {
  const response = await fetch(`${API_BASE_URL}/auth/admin/pending-verifications`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<PendingVerification[]>(response);
};

//
// 🚗 RIDES MANAGEMENT (ADMIN)
// Note: These endpoints are in your rides.js backend file
//

// Get all rides (admin)
export const getRides = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<{ results: Ride[]; pagination: { page: number; limit: number; total: number } }> => {
  const url = new URL(`${API_BASE_URL}/rides/admin/rides`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());

  if (status) {
    url.searchParams.append('status', status);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

// Get ride by ID (admin)
export const getRideById = async (token: string, rideId: number): Promise<Ride> => {
  const response = await fetch(`${API_BASE_URL}/rides/admin/admin/rides/${rideId}`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<Ride>(response);
};

// Cancel a ride (admin)
export const adminCancelRide = async (token: string, rideId: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/rides/admin/rides/cancel`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ rideId }),
  });
  return handleResponse<{ message: string }>(response);
};

// Get ride statistics
export const getRideStatistics = async (token: string): Promise<RideStats> => {
  const response = await fetch(`${API_BASE_URL}/rides/admin/admin/stats/rides`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<RideStats>(response);
};

// Get dashboard stats
export const getDashboardStats = async (token: string): Promise<Stats> => {
  const response = await fetch(`${API_BASE_URL}/rides/admin/stats/dashboard`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<Stats>(response);
};

//
// 📋 REPORTS MANAGEMENT (ADMIN)
//

export const getReports = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  resolved?: boolean
): Promise<{ results: Report[]; pagination: { page: number; limit: number; total: number } }> => {
  const url = new URL(`${API_BASE_URL}/admin/reports`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());

  if (resolved !== undefined) {
    url.searchParams.append('resolved', resolved.toString());
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

export const getReportById = async (token: string, reportId: number): Promise<Report> => {
  const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<Report>(response);
};

export const resolveReport = async (token: string, reportId: number): Promise<Report> => {
  const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/resolve`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  return handleResponse<Report>(response);
};

export const deleteReport = async (token: string, reportId: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  return handleResponse<{ message: string }>(response);
};

//
// ⚙️ SYSTEM CONFIG & HEALTH (ADMIN)
//

export const getConfig = async (token: string): Promise<Config> => {
  const response = await fetch(`${API_BASE_URL}/admin/config`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<Config>(response);
};

export const updateConfig = async (
  token: string,
  config: Partial<Config>
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/config`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(config),
  });
  return handleResponse<{ message: string }>(response);
};

export const getSystemHealth = async (token: string): Promise<{
  database: string;
  gebeta_maps_api: string;
  timestamp: string;
}> => {
  const response = await fetch(`${API_BASE_URL}/admin/system-health`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

//
// 💵 PAYMENTS MANAGEMENT (ADMIN)
// Note: These endpoints need to be implemented in your backend
//

export const getPayments = async (
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<{ results: Payment[]; pagination: { page: number; limit: number; total: number } }> => {
  const url = new URL(`${API_BASE_URL}/admin/payments`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

export const releasePayment = async (token: string, rideId: number): Promise<Payment> => {
  const response = await fetch(`${API_BASE_URL}/admin/payments/release`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ rideId }),
  });
  return handleResponse<Payment>(response);
};

// Utility function for API error handling
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// API client with interceptors
export const createApiClient = (token: string) => {
  const baseHeaders = getHeaders(token);

  return {
    get: <T>(url: string) => fetch(`${API_BASE_URL}${url}`, { headers: baseHeaders }).then(handleResponse<T>),
    post: <T>(url: string, data?: any) => 
      fetch(`${API_BASE_URL}${url}`, { 
        method: 'POST', 
        headers: baseHeaders, 
        body: data ? JSON.stringify(data) : undefined 
      }).then(handleResponse<T>),
    put: <T>(url: string, data?: any) => 
      fetch(`${API_BASE_URL}${url}`, { 
        method: 'PUT', 
        headers: baseHeaders, 
        body: data ? JSON.stringify(data) : undefined 
      }).then(handleResponse<T>),
    delete: <T>(url: string) => 
      fetch(`${API_BASE_URL}${url}`, { 
        method: 'DELETE', 
        headers: baseHeaders 
      }).then(handleResponse<T>),
  };
};