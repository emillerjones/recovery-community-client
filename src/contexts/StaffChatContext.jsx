/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNotifications } from "./NotificationsContext";
import { useLounge } from "./LoungeContext";
import StaffChatPanel from "../components/staffChat/StaffChatPanel";

const StaffChatContext = createContext();

export function StaffChatProvider({ children }) {
  const { user, token } = useAuth();
  const { socket } = useNotifications();
  const { closeLounge } = useLounge();
  const [openFor, setOpenFor] = useState(null);
  const [revokedFor, setRevokedFor] = useState(null);
  const canAccess = Boolean(token && [1, 10, 50].includes(user?.role_id) && revokedFor !== token);
  const closeStaffChat = useCallback(() => setOpenFor(null), []);
  const revokeAccess = useCallback(() => {
    setRevokedFor(token);
    setOpenFor(null);
  }, [token]);
  const openStaffChat = useCallback(() => {
    if (!canAccess) return;
    closeLounge();
    setOpenFor(token);
  }, [canAccess, closeLounge, token]);

  useEffect(() => {
    if (!socket) return;
    socket.on("staff_chat_revoked", revokeAccess);
    return () => socket.off("staff_chat_revoked", revokeAccess);
  }, [socket, revokeAccess]);

  return <StaffChatContext.Provider value={{ canAccess, openStaffChat }}>
    {children}
    {canAccess && openFor === token && <StaffChatPanel key={token} onClose={closeStaffChat} onRevoke={revokeAccess} />}
  </StaffChatContext.Provider>;
}

export function useStaffChat() {
  return useContext(StaffChatContext);
}
