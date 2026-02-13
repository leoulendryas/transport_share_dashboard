'use client';

import { useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useNotifications } from '@/context/NotificationContext';

export default function RealTimeListener() {
  const { socket } = useSocket();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!socket) return;

    // Listen for SOS alerts
    socket.on('sos_alert', (data: any) => {
      addNotification(
        'sos',
        '🚨 EMERGENCY SIGNAL',
        `An SOS alert has been triggered by ${data.user_name || 'a user'} on ride #${data.ride_id}.`
      );
      
      // Play alert sound if available
      const audio = new Audio('/alert.mp3');
      audio.play().catch(e => console.log('Audio play failed'));
    });

    // Listen for new reports
    socket.on('new_report', (data: any) => {
      addNotification(
        'warning',
        'New Incident Reported',
        `A new report has been filed regarding ride #${data.ride_id}.`
      );
    });

    return () => {
      socket.off('sos_alert');
      socket.off('new_report');
    };
  }, [socket, addNotification]);

  return null;
}
