import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotifications } from "../notifications/NotificationsContext";
import "./NotificationBell.css";

function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function describe(notification) {
  if (notification.type === "reply_to_comment") {
    return `${notification.actor_username} replied to your comment on "${notification.post_title}"`;
  }
  return `${notification.actor_username} replied to your post "${notification.post_title}"`;
}

export default function NotificationBell() {
  const { unreadCount, notifications, fetchNotifications, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    fetchNotifications();
  }, [open, fetchNotifications]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function openNotification(notification) {
    if (!notification.read_at) await markRead(notification.notification_id);
    setOpen(false);
    navigate(`/forum/${notification.post_id}`);
  }

  return (
    <div className="notif-bell" ref={containerRef}>
      <button
        className="notif-bell__button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && <span className="notif-bell__badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-bell__panel" role="menu">
          <div className="notif-bell__header">
            <p>Notifications</p>
            {notifications.some((n) => !n.read_at) && (
              <button onClick={markAllRead}>Mark all read</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="notif-bell__empty">Nothing yet. Replies to your posts will show up here.</p>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li key={notification.notification_id}>
                  <button
                    className={notification.read_at ? "" : "is-unread"}
                    onClick={() => openNotification(notification)}
                  >
                    <span>{describe(notification)}</span>
                    <time>{timeAgo(notification.created_at)}</time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
