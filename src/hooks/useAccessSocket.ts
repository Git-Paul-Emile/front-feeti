import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getPreferredBackendBaseUrl } from '../utils/backendConfig';
import type { ZoneTracking } from '../services/api/AccessAPI';

export function useAccessSocket(
  eventId: string,
  onZoneUpdate: (zone: ZoneTracking) => void
) {
  const onUpdateRef = useRef(onZoneUpdate);
  onUpdateRef.current = onZoneUpdate;

  useEffect(() => {
    if (!eventId) return;

    const socket: Socket = io(getPreferredBackendBaseUrl(), {
      query: { eventId },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      path: '/socket.io',
    });

    socket.on('zone:update', (data: ZoneTracking) => {
      onUpdateRef.current(data);
    });

    return () => { socket.disconnect(); };
  }, [eventId]);
}
