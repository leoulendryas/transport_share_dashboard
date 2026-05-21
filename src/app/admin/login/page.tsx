// src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Shield, Mail, Lock, ArrowRight, AlertCircle, Loader2, Key } from 'lucide-react';
import { extractError } from '@/lib/api/errors';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [otpMethod, setOtpMethod] = useState<'phone' | 'email' | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, verify2FA } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login({ email, password });
      if ('requires_2fa' in result) {
        setTempToken(result.temp_token);
        setOtpMethod(result.method);
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(extractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken) return;
    setError('');
    setIsLoading(true);

    try {
      await verify2FA({ temp_token: tempToken, otp });
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(extractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 transition-colors">
      <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        <div className="text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xl shadow-zinc-200 dark:shadow-none">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">gara administrative</h1>
            <p className="text-sm font-medium text-zinc-500">Secure access to the platform control center.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 animate-in shake duration-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {!tempToken ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all dark:text-zinc-100"
                      placeholder="admin@gara.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all dark:text-zinc-100"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 shadow-lg shadow-zinc-200 dark:shadow-none" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Continue to Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify2FA} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Verification Code</label>
                  <p className="text-[10px] text-zinc-500 px-1 mb-2">Sent to your {otpMethod}</p>
                  <div className="relative group">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all dark:text-zinc-100 tracking-[0.5em] font-mono"
                      placeholder="000000"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 shadow-lg shadow-zinc-200 dark:shadow-none" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Verify & Login
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
              
              <button 
                type="button"
                onClick={() => setTempToken(null)}
                className="w-full text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Proprietary System • Auth v2.1
        </p>
      </div>
    </div>
  );
}
