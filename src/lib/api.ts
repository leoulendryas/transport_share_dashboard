import axios from 'axios';
import adminApi from './adminApi';
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

const handleResponse = <T>(response: any): T => {
  return response.data;
};

// --- AUTH ---

export const adminLogin = async (emailOrPhone: { email?: string; phone_number?: string }, password: string): Promise<AdminLoginResponse> => {
  const response = await adminApi.post('/login', { ...emailOrPhone, password });
  return handleResponse<AdminLoginResponse>(response);
};

export const verify2FA = async (tempToken: string, otp: string): Promise<AdminLoginResponse> => {
  const response = await adminApi.post('/verify-2fa', { temp_token: tempToken, otp });
  return handleResponse<AdminLoginResponse>(response);
};

export const googleSignIn = async (idToken: string): Promise<AdminLoginResponse> => {
  const response = await adminApi.post('/google-signin', { id_token: idToken });
  return handleResponse<AdminLoginResponse>(response);
};

export const linkGoogle = async (idToken: string): Promise<{ message: string }> => {
  const response = await adminApi.post('/link-google', { id_token: idToken });
  return handleResponse(response);
};

export const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  const response = await adminApi.post('/refresh', { refresh_token: refreshToken });
  return handleResponse<RefreshTokenResponse>(response);
};

// --- USERS ---

export const getUsers = async (
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
  const params: any = { page, limit };
  if (search) params.search = search;
  if (banned !== undefined) params.banned = banned;
  if (verificationStatus) params.verification_status = verificationStatus;
  if (isAdmin !== undefined) params.is_admin = isAdmin;

  const response = await adminApi.get('/users', { params });
  return handleResponse(response);
};

export const getUserById = async (userId: number): Promise<DetailedUser> => {
  const response = await adminApi.get(`/users/${userId}`);
  return handleResponse<DetailedUser>(response);
};

export const getUserAuditLogs = async (userId: number): Promise<any[]> => {
  const response = await adminApi.get(`/users/${userId}/audit-logs`);
  return handleResponse(response);
};

export const banUser = async (userId: number): Promise<{ message: string }> => {
  const response = await adminApi.post(`/users/${userId}/ban`);
  return handleResponse(response);
};

export const unbanUser = async (userId: number): Promise<{ message: string }> => {
  const response = await adminApi.post(`/users/${userId}/unban`);
  return handleResponse(response);
};

export const suspendUser = async (userId: number, days: number, reason: string): Promise<{ message: string }> => {
  const response = await adminApi.post(`/users/${userId}/suspend`, { days, reason });
  return handleResponse(response);
};

export const unsuspendUser = async (userId: number): Promise<{ message: string }> => {
  const response = await adminApi.post(`/users/${userId}/unsuspend`);
  return handleResponse(response);
};

export const toggleAdminStatus = async (userId: number, isAdmin: boolean): Promise<{ message: string }> => {
  const response = await adminApi.post(`/users/${userId}/toggle-admin`, { is_admin: isAdmin });
  return handleResponse(response);
};

export const updateMemberLevel = async (userId: number, memberLevel: string): Promise<{ message: string }> => {
  const response = await adminApi.post(`/users/${userId}/member-level`, { member_level: memberLevel });
  return handleResponse(response);
};

// --- VERIFICATIONS ---

export const getPendingVerifications = async (page: number = 1, limit: number = 10): Promise<{ results: User[]; pagination: { page: number; limit: number; total: number } }> => {
  const response = await adminApi.get('/verifications', { params: { page, limit } });
  return handleResponse(response);
};

export const verifyUserID = async (userId: number): Promise<{ message: string }> => {
  const response = await adminApi.post(`/users/${userId}/verify-id/approve`);
  return handleResponse(response);
};

export const rejectVerification = async (userId: number, reason?: string): Promise<{ message: string }> => {
  const response = await adminApi.post(`/users/${userId}/verify-id/reject`, { reason });
  return handleResponse(response);
};

export const getPendingLicenses = async (page: number = 1, limit: number = 10): Promise<{ results: User[]; pagination: { page: number; limit: number; total: number } }> => {
  const response = await adminApi.get('/licenses', { params: { page, limit } });
  return handleResponse(response);
};

export const approveLicense = async (userId: number): Promise<{ message: string }> => {
  const response = await adminApi.post(`/users/${userId}/license/approve`);
  return handleResponse(response);
};

export const rejectLicense = async (userId: number, reason: string): Promise<{ message: string }> => {
  const response = await adminApi.post(`/users/${userId}/license/reject`, { reason });
  return handleResponse(response);
};

export const getPendingVehicles = async (page: number = 1, limit: number = 10): Promise<{ results: Vehicle[]; pagination: { page: number; limit: number; total: number } }> => {
  const response = await adminApi.get('/vehicles/pending', { params: { page, limit } });
  return handleResponse(response);
};

export const approveVehicle = async (vehicleId: number): Promise<{ message: string }> => {
  const response = await adminApi.post(`/vehicles/${vehicleId}/approve`);
  return handleResponse(response);
};

export const rejectVehicle = async (vehicleId: number, reason?: string): Promise<{ message: string }> => {
  const response = await adminApi.post(`/vehicles/${vehicleId}/reject`, { reason });
  return handleResponse(response);
};

// --- RIDES ---

export const getRides = async (
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: string,
    start_date?: string,
    end_date?: string,
    company_id?: number,
    from_lat?: number,
    from_lng?: number,
    to_lat?: number,
    to_lng?: number,
    radius?: number,
    min_price?: number,
    max_price?: number
  }
): Promise<{ results: Ride[]; pagination: { page: number; limit: number; total: number } }> => {
  const params: any = { page, limit, ...filters };
  const response = await adminApi.get('/rides', { params });
  return handleResponse(response);
};

export const getRideById = async (rideId: number): Promise<Ride> => {
  const response = await adminApi.get(`/rides/${rideId}`);
  return handleResponse<Ride>(response);
};

export const getRideHistory = async (rideId: number): Promise<any[]> => {
  const response = await adminApi.get(`/rides/${rideId}/history`);
  return handleResponse(response);
};

export const getRideParticipants = async (rideId: number): Promise<any[]> => {
  const response = await adminApi.get(`/rides/${rideId}/participants`);
  return handleResponse(response);
};

export const getRideVerifications = async (rideId: number): Promise<any[]> => {
  const response = await adminApi.get(`/rides/${rideId}/verifications`);
  return handleResponse(response);
};

export const adminCancelRide = async (rideId: number): Promise<{ message: string }> => {
  const response = await adminApi.post(`/rides/${rideId}/cancel`);
  return handleResponse(response);
};

export const getRideMessages = async (rideId: number): Promise<Message[]> => {
  const response = await adminApi.get(`/rides/${rideId}/messages`);
  return handleResponse<Message[]>(response);
};

export const updateRideStatus = async (rideId: number, status: string, notes?: string): Promise<{ message: string }> => {
  const response = await adminApi.post(`/rides/${rideId}/status`, { status, notes });
  return handleResponse(response);
};

export const forceFinalizeRide = async (rideId: number, notes?: string): Promise<{ message: string }> => {
  const response = await adminApi.post(`/rides/${rideId}/finalize`, { notes });
  return handleResponse(response);
};

export const toggleRideChat = async (rideId: number, lock: boolean): Promise<{ message: string }> => {
  const response = await adminApi.post(`/rides/${rideId}/toggle-chat`, { lock });
  return handleResponse(response);
};

// --- SOS & REPORTS ---

export const getSosAlerts = async (page: number = 1, limit: number = 10, status?: string): Promise<SOSAlert[]> => {
  const params: any = { page, limit };
  if (status) params.status = status;
  const response = await adminApi.get('/sos', { params });
  return handleResponse(response);
};

export const resolveSos = async (sosId: number, notes?: string, authorityDispatch: boolean = false): Promise<{ message: string }> => {
  const response = await adminApi.post(`/sos/${sosId}/resolve`, { notes, authority_dispatch: authorityDispatch });
  return handleResponse(response);
};

export const getReports = async (page: number = 1, limit: number = 10, status?: string): Promise<{ results: Report[]; pagination: { page: number; limit: number; total: number } }> => {
  const params: any = { page, limit };
  if (status) params.status = status;
  const response = await adminApi.get('/reports', { params });
  return handleResponse(response);
};

export const resolveReport = async (reportId: number, status: string = 'resolved', notes?: string, penalty: number = 0.5): Promise<{ message: string }> => {
  const response = await adminApi.post(`/reports/${reportId}/resolve`, { status, notes, penalty });
  return handleResponse(response);
};

// --- REVIEWS ---

export const getReviews = async (page: number = 1, limit: number = 10, minRating?: number): Promise<Review[]> => {
  const params: any = { page, limit };
  if (minRating) params.min_rating = minRating;
  const response = await adminApi.get('/reviews', { params });
  return handleResponse(response);
};

export const deleteReview = async (id: number): Promise<{ message: string }> => {
  const response = await adminApi.delete(`/reviews/${id}`);
  return handleResponse(response);
};

// --- MESSAGES ---

export const getAllMessages = async (params: { page?: number, limit?: number, search?: string, userId?: number, rideId?: number }): Promise<Message[]> => {
  const response = await adminApi.get('/messages', { params });
  return handleResponse(response);
};

export const deleteMessage = async (id: number, reason: string): Promise<{ message: string }> => {
  const response = await adminApi.delete(`/messages/${id}`, { data: { reason } });
  return handleResponse(response);
};

// --- COMPANIES ---

export const getCompanies = async (): Promise<Company[]> => {
  const response = await adminApi.get('/companies');
  return handleResponse(response);
};

export const getCompanyStats = async (): Promise<any[]> => {
  const response = await adminApi.get('/companies/stats');
  return handleResponse(response);
};

export const createCompany = async (name: string): Promise<Company> => {
  const response = await adminApi.post('/companies', { name });
  return handleResponse(response);
};

export const updateCompany = async (id: number, data: { name?: string; is_active?: boolean }): Promise<Company> => {
  const response = await adminApi.put(`/companies/${id}`, data);
  return handleResponse(response);
};

export const deleteCompany = async (id: number): Promise<{ message: string }> => {
  const response = await adminApi.delete(`/companies/${id}`);
  return handleResponse(response);
};

// --- PAYMENTS ---

export const getPayments = async (
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: string,
    released?: boolean,
    start_date?: string,
    end_date?: string
  }
): Promise<{ results: Payment[]; pagination: { page: number; limit: number; total: number } }> => {
  const params: any = { page, limit, ...filters };
  const response = await adminApi.get('/payments', { params });
  return handleResponse(response);
};

export const updatePaymentStatus = async (paymentId: number, status?: string, releasedToDriver?: boolean): Promise<{ message: string }> => {
  const response = await adminApi.post(`/payments/${paymentId}/update-status`, { status, released_to_driver: releasedToDriver });
  return handleResponse(response);
};

export const refundPayment = async (paymentId: number, amountPercent: number = 1.0, reason: string): Promise<{ message: string }> => {
  const response = await adminApi.post(`/payments/${paymentId}/refund`, { amount_percent: amountPercent, reason });
  return handleResponse(response);
};

export const verifyPaymentManual = async (txRef: string): Promise<{ message: string; data?: any }> => {
  const response = await adminApi.post(`/payments/${txRef}/verify-manual`);
  return handleResponse(response);
};

export const releasePayoutManual = async (paymentId: number): Promise<{ message: string }> => {
  const response = await adminApi.post(`/payments/${paymentId}/release-manual`);
  return handleResponse(response);
};

// --- CONFIG ---

export const getConfig = async (): Promise<any> => {
  const response = await adminApi.get('/settings');
  return handleResponse(response);
};

export const updateConfig = async (config: any): Promise<{ message: string }> => {
  const response = await adminApi.put('/settings', { settings: config });
  return handleResponse(response);
};

// --- DASHBOARD ---

export const getDashboardStats = async (): Promise<Stats> => {
  const response = await adminApi.get('/stats/dashboard');
  return handleResponse<Stats>(response);
};

export const getGrowthStats = async (): Promise<any> => {
  const response = await adminApi.get('/stats/growth');
  return handleResponse(response);
};

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.response?.data?.message || error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

// --- SUPPORT ---

export const fetchSupportMessages = async (page: number = 1, limit: number = 20): Promise<{ results: any[]; pagination: { page: number; limit: number; total: number } }> => {
  const response = await adminApi.get('/support', { params: { page, limit } });
  return handleResponse(response);
};

export const replyToSupport = async (messageId: number, reply: string): Promise<{ message: string }> => {
  const response = await adminApi.post(`/support/${messageId}/reply`, { reply });
  return handleResponse(response);
};
