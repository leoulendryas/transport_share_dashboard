import { User, Stats, Admin, Ride, RideStats, IDVerificationData } from '@/types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper function to handle responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Request failed');
  }
  return response.json();
};

// Set up headers
const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Set up headers for FormData (file upload)
const getFormDataHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Admin login
export const adminLogin = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

// Submit ID verification (for regular users)
export const submitIDVerification = async (
  token: string,
  data: IDVerificationData,
  file: File
): Promise<{ message: string; verification_status: string }> => {
  const formData = new FormData();
  
  // Append form fields
  formData.append('first_name', data.first_name);
  formData.append('last_name', data.last_name);
  formData.append('age', data.age.toString());
  formData.append('gender', data.gender);
  formData.append('id_type', data.id_type);
  
  // Append file
  formData.append('id_image', file);
  
  const response = await fetch(`${API_BASE_URL}/auth/verify-identity`, {
    method: 'POST',
    headers: getFormDataHeaders(token),
    body: formData,
  });
  
  return handleResponse(response);
};

// Admin verify user ID
export const adminVerifyUserID = async (token: string, userId: number) => {
  const response = await fetch(`${API_BASE_URL}/auth/admin/verify-id`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ userId }),
  });
  return handleResponse(response);
};

// Get all users
export const getUsers = async (token: string): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/auth/admin/users`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

// Get pending verifications
export const getPendingVerifications = async (token: string): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/auth/admin/pending-verifications`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

// Verify user ID
export const verifyUserID = async (token: string, userId: number) => {
  const response = await fetch(`${API_BASE_URL}/auth/admin/verify-id`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ userId }),
  });
  return handleResponse(response);
};

// Ban/unban user
export const banUser = async (token: string, userId: number, banned: boolean) => {
  const response = await fetch(`${API_BASE_URL}/auth/admin/ban-user`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ userId, banned }),
  });
  return handleResponse(response);
};

// Reject verification
export const rejectVerification = async (token: string, userId: number) => {
  const response = await fetch(`${API_BASE_URL}/auth/admin/reject-verification`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ userId }),
  });
  return handleResponse(response);
};

// Refresh token
export const refreshToken = async (refreshToken: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return handleResponse(response);
};

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
export const getRideById = async (
  token: string,
  rideId: number
): Promise<Ride> => {
  const response = await fetch(`${API_BASE_URL}/rides/admin/rides/${rideId}`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

// Cancel a ride (admin)
export const adminCancelRide = async (
  token: string,
  rideId: number
) => {
  const response = await fetch(`${API_BASE_URL}/rides/admin/rides/cancel`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ rideId }),
  });
  return handleResponse(response);
};

// Get ride statistics
export const getRideStatistics = async (
  token: string
): Promise<RideStats> => {
  const response = await fetch(`${API_BASE_URL}/rides/admin/stats/rides`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

// Get dashboard stats
export const getDashboardStats = async (token: string): Promise<Stats> => {
  const response = await fetch(`${API_BASE_URL}/rides/admin/stats/dashboard`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};