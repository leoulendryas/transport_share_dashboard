// src/components/admin/RealTimeListener.tsx
'use client';

import { useAdminSocket, AdminWsEvent } from '@/lib/ws/useAdminSocket';
import { useNotifications } from '@/context/NotificationContext';
import { useCallback } from 'react';

export default function RealTimeListener() {
  const { addNotification } = useNotifications();

  const handleEvent = useCallback((event: AdminWsEvent) => {
    switch (event.type) {
      case 'ride_started':
        addNotification(
          'info',
          'Ride Started',
          `Ride #${event.ride_id} has officially started.`
        );
        break;
      
      case 'ride_completed':
        addNotification(
          'success',
          'Ride Completed',
          `Ride #${event.ride_id} has been successfully completed.`
        );
        break;

      case 'no_show_flagged':
        addNotification(
          'warning',
          'Passenger No-Show',
          `A no-show has been flagged on ride #${event.rideId}.`
        );
        break;

      case 'payment_refunded':
        addNotification(
          'info',
          'Refund Processed',
          `A refund of ${event.amount_percent * 100}% has been processed.`
        );
        break;

      case 'SOS_RESOLVED':
        addNotification(
          'success',
          'SOS Resolved',
          'An emergency signal has been successfully resolved.'
        );
        break;

      // Add more handlers as needed based on the integration guide
    }
  }, [addNotification]);

  useAdminSocket(handleEvent);

  return null;
}
