import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || window.location.origin;

export const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestMetric, setLatestMetric] = useState(null);

  useEffect(() => {
    const newSocket = io(WS_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connecté');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket déconnecté');
      setIsConnected(false);
    });

    newSocket.on('metric-update', (data) => {
      console.log('📊 Nouvelle métrique:', data);
      setLatestMetric(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, isConnected, latestMetric };
};
