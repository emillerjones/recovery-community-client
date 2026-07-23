/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../auth/AuthContext";

const API = import.meta.env.VITE_API;

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (cancelled) return null;
        setUnreadCount(0);
        setNotifications([]);
        return fetch(`${API}/api/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((response) => {
        if (!response?.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (!cancelled && data) setUnreadCount(data.count);
      })
      .catch(() => {});

    const newSocket = io(API, { auth: { token } });
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("notification", (notification) => {
      setUnreadCount((count) => count + 1);
      setNotifications((current) => [notification, ...current]);
    });

    return () => {
      cancelled = true;
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    const response = await fetch(`${API}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) setNotifications(await response.json());
  }, [token]);

  const markRead = useCallback(
    async (notificationId) => {
      const response = await fetch(`${API}/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return false;

      setNotifications((current) =>
        current.map((n) => (n.notification_id === notificationId ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      return true;
    },
    [token]
  );

  const markAllRead = useCallback(async () => {
    const response = await fetch(`${API}/api/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return false;

    setNotifications((current) => current.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    setUnreadCount(0);
    return true;
  }, [token]);

  const value = { unreadCount, notifications, fetchNotifications, markRead, markAllRead, socket };
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw Error("useNotifications must be used within NotificationsProvider");
  return context;
}
