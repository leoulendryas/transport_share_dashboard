// src/lib/ws/useAdminSocket.ts
'use client';

import { useEffect, useRef } from 'react';
import { WS_BASE } from '@/lib/config';
import { tokenStore } from '@/lib/api/client';

export type AdminWsEvent =
  | { type: 'ride_started';      ride_id: string; message: string; timestamp: string }
  | { type: 'ride_completed';    ride_id: string; message: string; timestamp: string }
  | { type: 'ride_status_update'; rideId: string; status: string; message: string }
  | { type: 'dispute_resolved';  rideId: string; resolution: string; message: string }
  | { type: 'chat_status_update'; locked: boolean; message: string }
  | { type: 'SOS_RESOLVED';      message: string }
  | { type: 'no_show_flagged';   rideId: string; message: string }
  | { type: 'payment_refunded';  amount_percent: number; message: string }
  | { type: 'removed_from_ride'; rideId: string; message: string }
  | { type: 'added_to_ride';     rideId: string; message: string };

export function useAdminSocket(onEvent: (event: AdminWsEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!tokenStore.access) return;

    const ws = new WebSocket(`${WS_BASE}?token=${tokenStore.access}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const event: AdminWsEvent = JSON.parse(e.data);
        onEvent(event);
      } catch {
        console.warn('Unparseable WS message', e.data);
      }
    };

    ws.onerror = (e) => console.error('Admin WS error', e);

    ws.onclose = () => {
      // Reconnect after 3s unless the component unmounted
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          wsRef.current = new WebSocket(`${WS_BASE}?token=${tokenStore.access}`);
        }
      }, 3000);
    };

    return () => {
      ws.close();
    };
  }, [onEvent]);

  return wsRef.current;
}
