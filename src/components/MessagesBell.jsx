import { NavLink } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useMessages } from "../notifications/MessagesContext";
import "./NotificationBell.css";

export default function MessagesBell() {
  const { unreadCount } = useMessages();

  return (
    <NavLink to="/messages" className="notif-bell__button" aria-label="Messages">
      <MessageCircle size={19} />
      {unreadCount > 0 && <span className="notif-bell__badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
    </NavLink>
  );
}
