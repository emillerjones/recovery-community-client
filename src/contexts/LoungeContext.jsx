/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../auth/AuthContext";
import { useNotifications } from "./NotificationsContext";

const API = import.meta.env.VITE_API;
const LoungeContext = createContext();

export function LoungeProvider({ children }) {
  const { token, user } = useAuth();
  const { socket } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [status, setStatus] = useState({
    online_count: 0,
    unread_count: 0,
    messages_last_hour: 0,
    participants_today: 0,
    last_message_at: null,
    recent_people: [],
  });
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const markRead = useCallback(() => {
    if (!token) return;
    setStatus((current) => ({ ...current, unread_count: 0 }));
    fetch(`${API}/api/lounge/read`, { method: "PATCH", headers }).catch(() => {});
  }, [headers, token]);

  const loadMessages = useCallback(async (before = null) => {
    if (!token) return;
    setLoading(true);
    try {
      const query = before ? `?before=${before}` : "";
      const response = await fetch(`${API}/api/lounge/messages${query}`, { headers });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load the Lounge.");
      setMessages((current) => before ? [...data.messages, ...current] : data.messages);
      if (!before) setMessagesLoaded(true);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
      setError("");
      if (!before) markRead();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [headers, markRead, token]);

  const openLounge = useCallback(() => {
    setIsOpen(true);
    if (!messagesLoaded) loadMessages();
    else markRead();
  }, [loadMessages, markRead, messagesLoaded]);

  const closeLounge = useCallback(() => setIsOpen(false), []);

  const sendMessage = useCallback(async (body) => {
    setSending(true);
    try {
      const response = await fetch(`${API}/api/lounge/messages`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not send that message.");
      setError("");
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setSending(false);
    }
  }, [headers]);

  const deleteMessage = useCallback(async (messageId) => {
    const response = await fetch(`${API}/api/lounge/messages/${messageId}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.message || "Could not delete that message.");
    }
  }, [headers]);

  // LOUNGE TRACE: the server counts connected member IDs, then sends this
  // event through the same authenticated socket used by notifications and DMs.
  useEffect(() => {
    if (!socket) return;

    function onPresence({ online_count }) {
      setStatus((current) => ({ ...current, online_count }));
    }

    function onMessage(message) {
      setMessages((current) => current.some((item) =>
        item.message_id === message.message_id
      ) ? current : [...current, message]);
      setStatus((current) => ({
        ...current,
        last_message_at: message.created_at,
        messages_last_hour: current.messages_last_hour + 1,
        unread_count: isOpen || message.author_id === user?.id
          ? 0
          : current.unread_count + 1,
        recent_people: [
          {
            user_id: message.author_id,
            username: message.author_username,
            avatar_url: message.avatar_url,
          },
          ...current.recent_people.filter((person) =>
            person.user_id !== message.author_id
          ),
        ].slice(0, 3),
      }));
      if (isOpen) markRead();
    }

    function onDeleted(deleted) {
      setMessages((current) => current.map((message) =>
        message.message_id === deleted.message_id
          ? { ...message, body: null, deleted_at: deleted.deleted_at }
          : message
      ));
    }

    socket.on("community_presence", onPresence);
    socket.on("lounge_message", onMessage);
    socket.on("lounge_message_deleted", onDeleted);
    socket.emit("request_community_presence");
    return () => {
      socket.off("community_presence", onPresence);
      socket.off("lounge_message", onMessage);
      socket.off("lounge_message_deleted", onDeleted);
    };
  }, [isOpen, markRead, socket, user?.id]);

  useEffect(() => {
    if (!token) {
      Promise.resolve().then(() => {
        setIsOpen(false);
        setMessages([]);
        setMessagesLoaded(false);
      });
      return;
    }
    let cancelled = false;
    fetch(`${API}/api/lounge/status`, { headers })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (!cancelled && data) setStatus(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [headers, token]);

  const value = {
    isOpen,
    openLounge,
    closeLounge,
    messages,
    status,
    loading,
    sending,
    error,
    hasMore,
    loadOlder: () => nextCursor && loadMessages(nextCursor),
    sendMessage,
    deleteMessage,
  };

  return <LoungeContext.Provider value={value}>{children}</LoungeContext.Provider>;
}

export function useLounge() {
  const context = useContext(LoungeContext);
  if (!context) throw Error("useLounge must be used within LoungeProvider");
  return context;
}
