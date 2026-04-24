'use client';

import { useAuth } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import RealTimeListener from '@/components/admin/RealTimeListener';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors">
        <LoadingSpinner />
        <p className="mt-4 text-zinc-400 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Establishing Secure Session</p>
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
