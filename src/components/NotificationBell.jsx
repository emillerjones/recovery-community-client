import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotifications } from "../contexts/NotificationsContext";
import "./NotificationBell.css";

function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function describe(notification) {
  if (notification.type === "flagged_comment") {
    return `${notification.actor_username} flagged a reply in "${notification.post_title}" for staff review`;
  }
  if (notification.type === "flagged_post") {
    return `${notification.actor_username} flagged "${notification.post_title}" for staff review`;
  }
  if (notification.type === "new_forum_post") {
    return `${notification.actor_username} posted a new conversation: "${notification.post_title}"`;
  }
  if (notification.type === "comment_on_participated_post") {
    return `${notification.actor_username} commented on a conversation you participated in: "${notification.post_title}"`;
  }
  if (notification.type === "reaction_on_participated_post") {
    return `${notification.actor_username} reacted to a conversation you participated in: "${notification.post_title}"`;
  }
  if (notification.type === "mention_in_comment") {
    return `${notification.actor_username} mentioned you in a reply on "${notification.post_title}"`;
  }
  if (notification.type === "mention_in_post") {
    return `${notification.actor_username} mentioned you in "${notification.post_title}"`;
  }
  if (notification.type === "reaction_to_post" || notification.type === "reaction_to_comment") {
    const count = Number(notification.reaction_count || 1);
    const target = notification.type === "reaction_to_comment" ? "your reply" : "your post";
    if (count > 1) {
      return `${notification.actor_username} and ${count - 1} ${count === 2 ? "other" : "others"} reacted to ${target} in "${notification.post_title}"`;
    }
    return `${notification.actor_username} reacted to ${target} in "${notification.post_title}"`;
  }
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
    // MENTION TRACE STEP 11: A reply-level alert carries comment_id. Add it as
    // a hash so ForumThread can scroll directly to #comment-that-id.
    const commentHash = notification.comment_id ? `#comment-${notification.comment_id}` : "";
    navigate(`/forum/${notification.post_id}${commentHash}`);
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
            <p className="notif-bell__empty">Nothing yet. New conversations, replies, mentions, and reactions will show up here.</p>
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
