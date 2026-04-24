'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Shield, ArrowRight, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

export default function HomePage() {
  const { admin, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading && admin) {
      router.push('/admin/dashboard');
    }
  }, [admin, loading, router]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 transition-colors selection:bg-zinc-950 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950">
      
      {/* Floating Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="fixed top-8 right-8 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-zinc-200 dark:shadow-none transition-all hover:scale-110 active:scale-95"
      >
        {theme === 'light' ? <Moon className="w-5 h-5 fill-zinc-950" /> : <Sun className="w-5 h-5 fill-white" />}
      </button>

      <div className="w-full max-w-[600px] text-center space-y-10 animate-in fade-in zoom-in duration-1000">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-2xl shadow-zinc-200 dark:shadow-none mb-4">
          <Shield className="w-8 h-8" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-zinc-950 dark:text-white tracking-tighter leading-tight">
            The platform for <br />
            <span className="text-zinc-400">modern transport.</span>
          </h1>
          <p className="text-lg font-medium text-zinc-500 max-w-md mx-auto leading-relaxed">
            Manage rides, verifications, and platform security with precision and clarity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/admin/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full h-14 px-8 shadow-xl shadow-zinc-200 dark:shadow-none">
              Access Admin Panel
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-8 bg-transparent border-none">
            Documentation
          </Button>
        </div>

        <div className="pt-20 grid grid-cols-3 gap-8 border-t border-zinc-200 dark:border-zinc-900">
          <div>
            <p className="text-xl font-black text-zinc-950 dark:text-white">99.9%</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Uptime</p>
          </div>
          <div>
            <p className="text-xl font-black text-zinc-950 dark:text-white">256-bit</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Security</p>
          </div>
          <div>
            <p className="text-xl font-black text-zinc-950 dark:text-white">v2.4.0</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Version</p>
          </div>
        </div>
      </div>
    </div>
  );
}
