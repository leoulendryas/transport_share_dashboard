'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, X, Bell, Info, CheckCircle2 } from 'lucide-react';

export type NotificationType = 'sos' | 'info' | 'success' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

interface NotificationContextType {
  addNotification: (type: NotificationType, title: string, message: string) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((type: NotificationType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, title, message }]);

    // Auto-remove non-SOS notifications after 5 seconds
    if (type !== 'sos') {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      
      {/* Notification Toast Container */}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-4 max-w-md w-full pointer-events-none">
        {notifications.map((n) => (
          <div 
            key={n.id}
            className={`pointer-events-auto animate-in slide-in-from-right-10 duration-500 rounded-[2rem] p-6 shadow-2xl border-2 flex items-start gap-4 ${
              n.type === 'sos' 
                ? 'bg-white border-rose-100 ring-4 ring-rose-50' 
                : n.type === 'success'
                ? 'bg-white border-emerald-100'
                : 'bg-white border-slate-100'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              n.type === 'sos' ? 'bg-rose-600 text-white' : 
              n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
              'bg-blue-100 text-blue-600'
            }`}>
              {n.type === 'sos' ? <AlertTriangle className="w-6 h-6 animate-pulse" /> : 
               n.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : 
               <Bell className="w-6 h-6" />}
            </div>
            
            <div className="flex-1">
              <h4 className={`text-sm font-black uppercase tracking-widest ${
                n.type === 'sos' ? 'text-rose-600' : 'text-slate-900'
              }`}>{n.title}</h4>
              <p className="text-sm font-bold text-slate-500 mt-1">{n.message}</p>
              {n.type === 'sos' && (
                <button 
                  onClick={() => removeNotification(n.id)}
                  className="mt-3 px-4 py-1.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
                >
                  Acknowledge
                </button>
              )}
            </div>

            <button 
              onClick={() => removeNotification(n.id)}
              className="text-slate-300 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
