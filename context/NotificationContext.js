'use client';

import { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const NotificationContext = createContext(undefined);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  /**
   * Fetch notifications from the backend.
   * Safe to call multiple times (de-duped by id).
   */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : data.notifications ?? []);
      }
    } catch (err) {
      console.error('[NotificationContext] fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a single notification to the top of the list.
   * Designed to be called from the SocketContext when a
   * real-time 'notification' event arrives.
   */
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => {
      // Prevent duplicates by id
      if (notification._id && prev.some((n) => n._id === notification._id)) {
        return prev;
      }
      return [notification, ...prev];
    });
  }, []);

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      console.error('[NotificationContext] markAsRead failed:', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' });
    } catch (err) {
      console.error('[NotificationContext] markAllRead failed:', err);
    }
  }, []);

  // Only fetch when user is authenticated
  const { status } = useSession();
  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotifications();
    }
  }, [status, fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllRead,
    fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
