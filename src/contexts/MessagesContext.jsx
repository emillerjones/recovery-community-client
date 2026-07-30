/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNotifications } from "./NotificationsContext";

const API = import.meta.env.VITE_API;

const MessagesContext = createContext();

export function MessagesProvider({ children }) {
  const { token } = useAuth();
  const { socket } = useNotifications();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;
    fetch(`${API}/api/messages/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data) setUnreadCount(data.count);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    function onDmNotification() {
      setUnreadCount((count) => count + 1);
    }
    socket.on("dm_notification", onDmNotification);

    return () => {
      socket.off("dm_notification", onDmNotification);
    };
  }, [socket]);

  const refreshUnreadCount = useCallback(async () => {
    if (!token) return;
    const response = await fetch(`${API}/api/messages/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      setUnreadCount(data.count);
    }
  }, [token]);

  const clearUnreadFor = useCallback(
    (amount) => {
      setUnreadCount((count) => Math.max(0, count - amount));
    },
    []
  );

  const value = { unreadCount, refreshUnreadCount, clearUnreadFor, socket };
  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (!context) throw Error("useMessages must be used within MessagesProvider");
  return context;
}
