'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useNotifications } from './NotificationContext';

const SocketContext = createContext(undefined);

export function SocketProvider({ children, userId }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const { addNotification } = useNotifications();

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io({
      path: '/api/socketio',
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      setConnected(true);
      console.log('[Socket] connected:', socket.id);
      if (userId) {
        socket.emit('join', userId);
      }
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      console.log('[Socket] disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] connection error:', err.message);
    });

    // Real-time notifications
    socket.on('notification', (data) => {
      addNotification(data);
    });

    socket.connect();
    socketRef.current = socket;
  }, [userId, addNotification]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  // Auto-connect when userId is available (i.e. user is authenticated)
  useEffect(() => {
    if (userId) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  /**
   * Emit a custom event through the socket.
   */
  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  /**
   * Subscribe to a custom event. Returns an unsubscribe function.
   */
  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
    return () => {
      socketRef.current?.off(event, handler);
    };
  }, []);

  const value = {
    socket: socketRef.current,
    connected,
    connect,
    disconnect,
    emit,
    on,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;
