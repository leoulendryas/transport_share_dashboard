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
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
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

//
// 👤 USER MANAGEMENT (ADMIN) - UPDATED TO MATCH BACKEND
//

// Get all users with pagination and filtering
export const getUsers = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
  banned?: boolean
): Promise<{ 
  results: User[]; 
  pagination: { 
    page: number; 
    limit: number; 
    total: number 
  } 
}> => {
  const url = new URL(`${API_BASE_URL}/admin/users`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  
  if (search) url.searchParams.append('search', search);
  if (banned !== undefined) url.searchParams.append('banned', banned.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

// Get user by ID
export const getUserById = async (token: string, userId: number): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<User>(response);
};

// Update user
export const updateUser = async (
  token: string, 
  userId: number, 
  updates: Partial<User>
): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(updates),
  });
  return handleResponse<User>(response);
};

// Ban user
export const banUser = async (token: string, userId: number): Promise<{ message: string; user: User }> => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/ban`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  return handleResponse<{ message: string; user: User }>(response);
};

// Unban user
export const unbanUser = async (token: string, userId: number): Promise<{ message: string; user: User }> => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/unban`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  return handleResponse<{ message: string; user: User }>(response);
};

// Toggle admin status
export const toggleAdminStatus = async (token: string, userId: number, isAdmin: boolean): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-admin`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ is_admin: isAdmin }),
  });
  return handleResponse<{ message: string }>(response);
};

//
// 🆔 VERIFICATIONS MANAGEMENT - UPDATED TO MATCH BACKEND
//

// Get pending verifications with pagination
export const getPendingVerifications = async (
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<{ 
  results: PendingVerification[]; 
  pagination: { 
    page: number; 
    limit: number; 
    total: number 
  } 
}> => {
  const url = new URL(`${API_BASE_URL}/admin/verifications`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

// Verify user ID (admin)
export const verifyUserID = async (token: string, userId: number): Promise<{ message: string; user: User }> => {
  const response = await fetch(`${API_BASE_URL}/admin/verifications/${userId}/verify`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  return handleResponse<{ message: string; user: User }>(response);
};

// Reject verification
export const rejectVerification = async (
  token: string,
  userId: number
): Promise<{ message: string; user: User }> => {
  const response = await fetch(`${API_BASE_URL}/admin/verifications/${userId}/reject`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  return handleResponse<{ message: string; user: User }>(response);
};

//
// 🚗 RIDES MANAGEMENT (ADMIN) - ALREADY CORRECT
//

// Get all rides (admin)
export const getRides = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<{ results: Ride[]; pagination: { page: number; limit: number; total: number } }> => {
  const url = new URL(`${API_BASE_URL}/admin/rides`);
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
  const response = await fetch(`${API_BASE_URL}/admin/rides/${rideId}`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<Ride>(response);
};

// Cancel a ride (admin)
export const adminCancelRide = async (token: string, rideId: number): Promise<{ 
  message: string;
  refunds_processed: number;
}> => {
  const response = await fetch(`${API_BASE_URL}/admin/rides/cancel`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ rideId }),
  });
  return handleResponse<{ message: string; refunds_processed: number }>(response);
};

// Get ride messages
export const getRideMessages = async (token: string, rideId: number): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/admin/rides/${rideId}/messages`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<any[]>(response);
};

//
// 🆘 SOS ALERTS
//

export const getSosAlerts = async (
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<any[]> => {
  const url = new URL(`${API_BASE_URL}/admin/sos`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<any[]>(response);
};

//
// 🏢 COMPANIES MANAGEMENT
//

export const getCompanies = async (token: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/admin/companies`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<any[]>(response);
};

export const createCompany = async (token: string, name: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/admin/companies`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ name }),
  });
  return handleResponse<any>(response);
};

export const deleteCompany = async (token: string, id: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/companies/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  return handleResponse<{ message: string }>(response);
};

// Get ride statistics
export const getRideStatistics = async (token: string): Promise<RideStats> => {
  const response = await fetch(`${API_BASE_URL}/admin/stats/rides`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<RideStats>(response);
};

// Get dashboard stats
export const getDashboardStats = async (token: string): Promise<Stats> => {
  const response = await fetch(`${API_BASE_URL}/admin/stats/dashboard`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<Stats>(response);
};

//
// 📋 REPORTS MANAGEMENT (ADMIN) - ALREADY CORRECT
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

export const resolveReport = async (token: string, reportId: number): Promise<{ message: string; report: Report }> => {
  const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/resolve`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  return handleResponse<{ message: string; report: Report }>(response);
};

export const deleteReport = async (token: string, reportId: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  return handleResponse<{ message: string }>(response);
};

//
// 💵 PAYMENTS MANAGEMENT (ADMIN) - ALREADY CORRECT
//

export const getPayments = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  status?: string,
  userId?: number,
  rideId?: number
): Promise<{ results: Payment[]; pagination: { page: number; limit: number; total: number } }> => {
  const url = new URL(`${API_BASE_URL}/admin/payments`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());

  if (status) url.searchParams.append('status', status);
  if (userId) url.searchParams.append('user_id', userId.toString());
  if (rideId) url.searchParams.append('ride_id', rideId.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

export const getPaymentById = async (token: string, paymentId: number): Promise<Payment> => {
  const response = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<Payment>(response);
};

export const releasePayment = async (token: string, rideId: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/payments/release`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ rideId }),
  });
  return handleResponse<{ message: string }>(response);
};

export const refundPayment = async (token: string, paymentId: number): Promise<{ 
  message: string; 
  refund_amount: number; 
  payment_reference: string 
}> => {
  const response = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}/refund`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

export const runPaymentCleanup = async (token: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/payments/cleanup`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  return handleResponse<{ message: string }>(response);
};

export const getPaymentStatistics = async (
  token: string, 
  period: string = 'all'
): Promise<{
  period: string;
  totalPayments: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  expiredPayments: number;
  totalRevenue: number;
  totalPaidOut: number;
  platformRevenue: number;
  averagePaymentAmount: number;
}> => {
  const url = new URL(`${API_BASE_URL}/admin/stats/payments`);
  url.searchParams.append('period', period);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

//
// ⚙️ SYSTEM CONFIG & HEALTH (ADMIN) - ALREADY CORRECT
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
  telebirr_payment_gateway: string;
  timestamp: string;
}> => {
  const response = await fetch(`${API_BASE_URL}/admin/system-health`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

// Utility function for API error handling
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
