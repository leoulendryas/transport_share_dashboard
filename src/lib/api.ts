import {
  User,
  DetailedUser,
  Stats,
  AdminLoginResponse,
  Ride,
  Report,
  Payment,
  RefreshTokenResponse,
  Review,
  SOSAlert,
  Vehicle,
  Company,
  Message
} from '@/types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return response.json();
};

const getHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// --- AUTH ---

export const adminLogin = async (email: string, password: string): Promise<AdminLoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AdminLoginResponse>(response);
};

export const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return handleResponse<RefreshTokenResponse>(response);
};

// --- USERS ---

export const getUsers = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
  banned?: boolean,
  verificationStatus?: 'pending_id' | 'pending_license',
  isAdmin?: boolean
): Promise<{ 
  results: User[]; 
  pagination: { page: number; limit: number; total: number } 
}> => {
  const url = new URL(`${API_BASE_URL}/admin/users`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  if (search) url.searchParams.append('search', search);
  if (banned !== undefined) url.searchParams.append('banned', banned.toString());
  if (verificationStatus) url.searchParams.append('verification_status', verificationStatus);
  if (isAdmin !== undefined) url.searchParams.append('is_admin', isAdmin.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

export const getUserById = async (token: string, userId: number): Promise<DetailedUser> => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse<DetailedUser>(response);
};

export const banUser = async (token: string, userId: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/ban`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

export const unbanUser = async (token: string, userId: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/unban`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

export const toggleAdminStatus = async (token: string, userId: number, isAdmin: boolean): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-admin`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ is_admin: isAdmin }),
  });
  return handleResponse(response);
};

export const updateMemberLevel = async (token: string, userId: number, memberLevel: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/member-level`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ member_level: memberLevel }),
  });
  return handleResponse(response);
};

// --- VERIFICATIONS ---

export const getPendingVerifications = async (token: string, page: number = 1, limit: number = 10): Promise<{ results: User[]; pagination: { page: number; limit: number; total: number } }> => {
  const url = new URL(`${API_BASE_URL}/admin/verifications`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  const response = await fetch(url.toString(), { headers: getHeaders(token) });
  return handleResponse(response);
};

export const verifyUserID = async (token: string, userId: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/verifications/${userId}/verify`, { method: 'POST', headers: getHeaders(token) });
  return handleResponse(response);
};

export const rejectVerification = async (token: string, userId: number, reason?: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/verifications/${userId}/reject`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ reason }),
  });
  return handleResponse(response);
};

export const getPendingLicenses = async (token: string, page: number = 1, limit: number = 10): Promise<User[]> => {
  const url = new URL(`${API_BASE_URL}/admin/verifications/licenses/pending`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  const response = await fetch(url.toString(), { headers: getHeaders(token) });
  return handleResponse(response);
};

export const approveLicense = async (token: string, userId: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/verifications/${userId}/license/approve`, { method: 'POST', headers: getHeaders(token) });
  return handleResponse(response);
};

export const getPendingVehicles = async (token: string, page: number = 1, limit: number = 10): Promise<Vehicle[]> => {
  const url = new URL(`${API_BASE_URL}/admin/vehicles/pending`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  const response = await fetch(url.toString(), { headers: getHeaders(token) });
  return handleResponse(response);
};

export const approveVehicle = async (token: string, vehicleId: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/vehicles/${vehicleId}/verify`, { method: 'POST', headers: getHeaders(token) });
  return handleResponse(response);
};

export const rejectVehicle = async (token: string, vehicleId: number, reason?: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/vehicles/${vehicleId}/reject`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ reason }),
  });
  return handleResponse(response);
};

// --- RIDES ---

export const getRides = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  status?: string,
  startDate?: string,
  endDate?: string,
  companyId?: number
): Promise<{ results: Ride[]; pagination: { page: number; limit: number; total: number } }> => {
  const url = new URL(`${API_BASE_URL}/admin/rides`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  if (status) url.searchParams.append('status', status);
  if (startDate) url.searchParams.append('start_date', startDate);
  if (endDate) url.searchParams.append('end_date', endDate);
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString(), { headers: getHeaders(token) });
  return handleResponse(response);
};

export const getRideById = async (token: string, rideId: number): Promise<Ride> => {
  const response = await fetch(`${API_BASE_URL}/admin/rides/${rideId}`, { headers: getHeaders(token) });
  return handleResponse<Ride>(response);
};

export const adminCancelRide = async (token: string, rideId: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/rides/${rideId}/cancel`, { method: 'POST', headers: getHeaders(token) });
  return handleResponse(response);
};

export const getRideMessages = async (token: string, rideId: number): Promise<Message[]> => {
  const response = await fetch(`${API_BASE_URL}/admin/rides/${rideId}/messages`, { headers: getHeaders(token) });
  return handleResponse<Message[]>(response);
};

// --- SOS & REPORTS ---

export const getSosAlerts = async (token: string, page: number = 1, limit: number = 10, status?: string): Promise<SOSAlert[]> => {
  const url = new URL(`${API_BASE_URL}/admin/sos`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  if (status) url.searchParams.append('status', status);
  const response = await fetch(url.toString(), { headers: getHeaders(token) });
  return handleResponse(response);
};

export const resolveSos = async (token: string, sosId: number, notes?: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/sos/${sosId}/resolve`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ notes }),
  });
  return handleResponse(response);
};

export const getReports = async (token: string, page: number = 1, limit: number = 10, status?: string): Promise<{ results: Report[]; pagination: { page: number; limit: number; total: number } }> => {
  const url = new URL(`${API_BASE_URL}/admin/reports`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  if (status) url.searchParams.append('status', status);
  const response = await fetch(url.toString(), { headers: getHeaders(token) });
  return handleResponse(response);
};

export const resolveReport = async (token: string, reportId: number, status: string = 'resolved', notes?: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/resolve`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ status, notes }),
  });
  return handleResponse(response);
};

// --- REVIEWS ---

export const getReviews = async (token: string, page: number = 1, limit: number = 10, minRating?: number): Promise<Review[]> => {
  const url = new URL(`${API_BASE_URL}/admin/reviews`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  if (minRating) url.searchParams.append('min_rating', minRating.toString());
  const response = await fetch(url.toString(), { headers: getHeaders(token) });
  return handleResponse(response);
};

export const deleteReview = async (token: string, id: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, { method: 'DELETE', headers: getHeaders(token) });
  return handleResponse(response);
};

// --- COMPANIES ---

export const getCompanies = async (token: string): Promise<Company[]> => {
  const response = await fetch(`${API_BASE_URL}/admin/companies`, { headers: getHeaders(token) });
  return handleResponse(response);
};

export const createCompany = async (token: string, name: string): Promise<Company> => {
  const response = await fetch(`${API_BASE_URL}/admin/companies`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
};

export const deleteCompany = async (token: string, id: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/companies/${id}`, { method: 'DELETE', headers: getHeaders(token) });
  return handleResponse(response);
};

// --- PAYMENTS ---

export const getPayments = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  status?: string,
  released?: boolean,
  startDate?: string,
  endDate?: string
): Promise<{ results: Payment[]; pagination: { page: number; limit: number; total: number } }> => {
  const url = new URL(`${API_BASE_URL}/admin/payments`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  if (status) url.searchParams.append('status', status);
  if (released !== undefined) url.searchParams.append('released', released.toString());
  if (startDate) url.searchParams.append('start_date', startDate);
  if (endDate) url.searchParams.append('end_date', endDate);

  const response = await fetch(url.toString(), { headers: getHeaders(token) });
  return handleResponse(response);
};

export const updatePaymentStatus = async (token: string, paymentId: number, status?: string, releasedToDriver?: boolean): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}/update-status`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ status, released_to_driver: releasedToDriver }),
  });
  return handleResponse(response);
};

// --- CONFIG ---

export const getConfig = async (token: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/admin/config`, { headers: getHeaders(token) });
  return handleResponse(response);
};

export const updateConfig = async (token: string, config: any): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/config`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(config),
  });
  return handleResponse(response);
};

// --- DASHBOARD ---

export const getDashboardStats = async (token: string): Promise<Stats> => {
  const response = await fetch(`${API_BASE_URL}/admin/stats/dashboard`, { headers: getHeaders(token) });
  return handleResponse<Stats>(response);
};

export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

// --- SUPPORT ---

export const fetchSupportMessages = async (token: string, page: number = 1, limit: number = 20): Promise<{ results: any[]; pagination: { page: number; limit: number; total: number } }> => {
  const url = new URL(`${API_BASE_URL}/admin/support`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  const response = await fetch(url.toString(), { headers: getHeaders(token) });
  return handleResponse(response);
};

export const replyToSupport = async (token: string, messageId: number, reply: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/admin/support/${messageId}/reply`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ reply }),
  });
  return handleResponse(response);
};
