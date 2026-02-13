'use client';

import { useAuth } from '@/context/AuthContext';

import { SocketProvider } from '@/context/SocketContext';

import RealTimeListener from '@/components/admin/RealTimeListener';

import { useRouter } from 'next/navigation';

import { useEffect } from 'react';



export default function AdminLayout({

  children,

}: {

  children: React.ReactNode;

}) {

  const { admin, loading } = useAuth();

  const router = useRouter();



  useEffect(() => {

    if (!loading && !admin) {

      router.push('/admin/login');

    }

  }, [admin, loading, router]);



  if (loading) {

    return (

      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">

        <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />

        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Authenticating</p>

      </div>

    );

  }



  if (!admin) return null;



  return (

    <SocketProvider>

      <RealTimeListener />

      {children}

    </SocketProvider>

  );

}
