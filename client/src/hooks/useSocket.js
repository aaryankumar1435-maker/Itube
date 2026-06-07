import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useWatchPartySocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('/watch-party', {
      withCredentials: true,
      transports: ['websocket'],
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef;
};
