/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNotifications } from "./NotificationsContext";
import { useLounge } from "./LoungeContext";
import StaffChatPanel from "../components/staffChat/StaffChatPanel";

const API = import.meta.env.VITE_API;
const StaffChatContext = createContext();

export function StaffChatProvider({ children }) {
  const { user, token } = useAuth();
  const { socket } = useNotifications();
  const { closeLounge } = useLounge();
  const [openFor, setOpenFor] = useState(null);
  const [revokedFor, setRevokedFor] = useState(null);
  const [chatUnread, setChatUnread] = useState(0);
  const [announcementsUnread, setAnnouncementsUnread] = useState(0);
  const canAccess = Boolean(token && [1, 10, 50].includes(user?.role_id) && revokedFor !== token);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const closeStaffChat = useCallback(() => setOpenFor(null), []);
  const revokeAccess = useCallback(() => {
    setRevokedFor(token);
    setOpenFor(null);
  }, [token]);

  const markChatRead = useCallback(() => {
    if (!canAccess) return;
    setChatUnread(0);
    fetch(`${API}/api/staff-chat/read`, { method: "PATCH", headers }).catch(() => {});
  }, [canAccess, headers]);

  const openStaffChat = useCallback(() => {
    if (!canAccess) return;
    closeLounge();
    setOpenFor(token);
    markChatRead();
  }, [canAccess, closeLounge, markChatRead, token]);

  const refreshAnnouncementsUnread = useCallback(() => {
    if (!canAccess) return;
    fetch(`${API}/api/forum/staff/unread-count`, { headers })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => { if (data) setAnnouncementsUnread(data.count); })
      .catch(() => {});
  }, [canAccess, headers]);

  // Announcements are infrequent, so the badge refreshes on login/thread-read
  // rather than over a live socket event — see Staff Chat for the live case.
  useEffect(() => {
    if (!canAccess) {
      setChatUnread(0);
      setAnnouncementsUnread(0);
      return;
    }
    let cancelled = false;
    fetch(`${API}/api/staff-chat/unread-count`, { headers })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => { if (!cancelled && data) setChatUnread(data.count); })
      .catch(() => {});
    refreshAnnouncementsUnread();
    return () => { cancelled = true; };
  }, [canAccess, headers, refreshAnnouncementsUnread]);

  useEffect(() => {
    if (!socket || !canAccess) return;
    function onMessage(message) {
      if (openFor === token || message.author_id === user?.id) return;
      setChatUnread((count) => count + 1);
    }
    socket.on("staff_chat_message", onMessage);
    return () => socket.off("staff_chat_message", onMessage);
  }, [socket, canAccess, openFor, token, user?.id]);

  useEffect(() => {
    if (!socket) return;
    socket.on("staff_chat_revoked", revokeAccess);
    return () => socket.off("staff_chat_revoked", revokeAccess);
  }, [socket, revokeAccess]);

  const value = {
    canAccess,
    openStaffChat,
    chatUnread,
    announcementsUnread,
    refreshAnnouncementsUnread,
  };

  return <StaffChatContext.Provider value={value}>
    {children}
    {canAccess && openFor === token && <StaffChatPanel key={token} onClose={closeStaffChat} onRevoke={revokeAccess} />}
  </StaffChatContext.Provider>;
}

export function useStaffChat() {
  return useContext(StaffChatContext);
}
