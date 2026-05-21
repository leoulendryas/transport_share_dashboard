// src/lib/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE } from '@/lib/config';

// ─── Token store (works for both browser and SSR) ───────────────────────────

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
      
      // Mirror access token to cookie for middleware
      document.cookie = `gara_access=${tokens.access_token}; path=/; SameSite=Strict; Secure`;
    }
  },

  clear() {
    accessToken  = null;
    refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gara_access');
      localStorage.removeItem('gara_refresh');
      localStorage.removeItem('admin'); // Clear legacy admin data too
      
      // Clear cookie
      document.cookie = 'gara_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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
            if (typeof window !== 'undefined') {
              window.location.href = '/admin/login';
            }
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
