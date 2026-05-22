// src/lib/api/auth.ts
import { api, tokenStore } from './client';
import type {
  LoginPayload, LoginResponse, TwoFARequiredResponse,
  Verify2FAPayload, AdminUser, GoogleSignInPayload
} from '@/types/admin';

type LoginResult = LoginResponse | TwoFARequiredResponse;

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResult> {
    const { data } = await api.post<LoginResult>('login', payload);
    if (!('requires_2fa' in data)) tokenStore.set(data);
    return data;
  },

  async verify2FA(payload: Verify2FAPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('verify-2fa', payload);
    tokenStore.set(data);
    return data;
  },

  async googleSignIn(payload: GoogleSignInPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('google-signin', payload);
    tokenStore.set(data);
    return data;
  },

  async linkGoogle(payload: GoogleSignInPayload): Promise<{ message: string; user: AdminUser }> {
    const { data } = await api.post('link-google', payload);
    return data;
  },

  logout() {
    tokenStore.clear();
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }
};
