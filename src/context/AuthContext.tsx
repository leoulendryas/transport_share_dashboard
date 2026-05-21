'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, refreshToken } from '@/lib/api';
import { User } from '@/types/user';

interface Admin {
  id: number;
  name: string;
  role: string;
}

interface AuthContextType {
  admin: Admin | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  refreshAuthToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    const token = sessionStorage.getItem('access_token');
    
    if (storedAdmin && token) {
      setAdmin(JSON.parse(storedAdmin));
    } else if (!window.location.pathname.includes('/login')) {
      // If no token and not on login page, we might want to logout or just stay as is
      // depending on how protected routes are handled.
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await adminLogin(email, password);
      
      const adminData: Admin = {
        id: response.user.id,
        name: `${response.user.first_name} ${response.user.last_name}`,
        role: 'admin',
      };
      
      setAdmin(adminData);
      sessionStorage.setItem('access_token', response.access_token);
      sessionStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('admin', JSON.stringify(adminData));
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setAdmin(null);
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  const refreshAuthToken = async (): Promise<string | null> => {
    const currentRefreshToken = sessionStorage.getItem('refresh_token');
    if (!currentRefreshToken) return null;
    
    try {
      const response = await refreshToken(currentRefreshToken);
      
      sessionStorage.setItem('access_token', response.access_token);
      sessionStorage.setItem('refresh_token', response.refresh_token);
      
      return response.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      admin, 
      login, 
      logout, 
      loading,
      refreshAuthToken
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

