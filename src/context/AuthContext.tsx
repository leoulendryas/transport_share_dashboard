// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { tokenStore } from '@/lib/api/client';
import type { AdminUser, LoginPayload, Verify2FAPayload, LoginResponse, TwoFARequiredResponse } from '@/types/admin';

interface AuthContextType {
  admin: AdminUser | null;
  login: (payload: LoginPayload) => Promise<LoginResponse | TwoFARequiredResponse>;
  verify2FA: (payload: Verify2FAPayload) => Promise<LoginResponse>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    if (storedAdmin && tokenStore.access) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch {
        tokenStore.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (payload: LoginPayload) => {
    const result = await authApi.login(payload);
    if (!('requires_2fa' in result)) {
      setAdmin(result.user);
      localStorage.setItem('admin', JSON.stringify(result.user));
    }
    return result;
  };

  const verify2FA = async (payload: Verify2FAPayload) => {
    const response = await authApi.verify2FA(payload);
    setAdmin(response.user);
    localStorage.setItem('admin', JSON.stringify(response.user));
    return response;
  };

  const logout = () => {
    setAdmin(null);
    authApi.logout();
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ 
      admin, 
      login, 
      verify2FA,
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
