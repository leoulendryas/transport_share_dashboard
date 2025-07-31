'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, refreshToken } from '@/lib/api';
import { Admin } from '@/types/user';

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  refreshAuthToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    if (storedAdmin) {
      const adminData = JSON.parse(storedAdmin);
      setAdmin(adminData);
      setToken(adminData.token);
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
        token: response.access_token,
        refreshToken: response.refresh_token
      };
      
      setAdmin(adminData);
      setToken(response.access_token);
      localStorage.setItem('admin', JSON.stringify(adminData));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  const refreshAuthToken = async (): Promise<string | null> => {
    if (!admin?.refreshToken) return null;
    
    try {
      const response = await refreshToken(admin.refreshToken);
      
      const adminData = {
        ...admin,
        token: response.access_token,
        refreshToken: response.refresh_token
      };
      
      setAdmin(adminData);
      setToken(response.access_token);
      localStorage.setItem('admin', JSON.stringify(adminData));
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
      token,
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