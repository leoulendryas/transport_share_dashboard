'use client';

import { useAuth } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import RealTimeListener from '@/components/admin/RealTimeListener';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && !admin && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [admin, loading, router, isLoginPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Authenticating</p>
      </div>
    );
  }

  // If it's the login page, just render it without SocketProvider
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!admin) return null;

  return (
    <SocketProvider>
      <RealTimeListener />
      {children}
    </SocketProvider>
  );
}
