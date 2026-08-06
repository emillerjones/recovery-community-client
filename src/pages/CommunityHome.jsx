import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Flame,
  HeartHandshake,
  LayoutGrid,
  Megaphone,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import MemberAvatar from "../components/MemberAvatar";
import { useLounge } from "../contexts/LoungeContext";
import { useMessages } from "../contexts/MessagesContext";
import { useNotifications } from "../contexts/NotificationsContext";
import { getLoungeActivity } from "../utils/loungeActivity";
import "./CommunityHome.css";

const API = import.meta.env.VITE_API;

function timeAgo(value) {
  if (!value) return "";
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function notificationCopy(notification) {
  const actor = notification.actor_username || "Someone";
  const title = notification.post_title ? ` “${notification.post_title}”` : "";
  if (notification.type === "pending_membership_application") return `${actor} is awaiting membership review`;
  if (notification.type === "new_forum_post") return `${actor} started${title}`;
  if (notification.type?.includes("mention")) return `${actor} mentioned you in${title}`;
  if (notification.type?.includes("reaction")) return `${actor} reacted in${title}`;
  if (notification.type === "reply_to_comment") return `${actor} replied to you in${title}`;
  return `${actor} added to${title || " a conversation"}`;
}

function notificationPath(notification) {
  if (notification.type === "pending_membership_application") return "/admin/membership";
  if (!notification.post_id) return "/forum";
  return `/forum/${notification.post_id}${notification.comment_id ? `#comment-${notification.comment_id}` : ""}`;
}

export default function CommunityHome() {
  const { token, user } = useAuth();
  const { status: loungeStatus, openLounge } = useLounge();
  const { unreadCount: unreadMessages } = useMessages();
  const {
    unreadCount: unreadNotifications,
    notifications,
    fetchNotifications,
  } = useNotifications();
  const [announcements, setAnnouncements] = useState([]);
  const [followedPosts, setFollowedPosts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loungeActivity = getLoungeActivity(loungeStatus);

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadHome() {
      setLoading(true);
      try {
        const [announcementResponse, followedResponse, conversationResponse] = await Promise.all([
          fetch(`${API}/api/forum/posts?section=announcements&scope=all&order=recent&page=0`, { headers }),
          fetch(`${API}/api/forum/posts?section=community&scope=following&order=recent&page=0`, { headers }),
          fetch(`${API}/api/messages/conversations`, { headers }),
        ]);

        if (!announcementResponse.ok || !followedResponse.ok || !conversationResponse.ok) {
          throw new Error("Some community updates could not be loaded.");
        }

        const [announcementData, followedData, conversationData] = await Promise.all([
          announcementResponse.json(),
          followedResponse.json(),
          conversationResponse.json(),
        ]);

        if (!cancelled) {
          setAnnouncements(announcementData.posts.slice(0, 2));
          setFollowedPosts(followedData.posts.slice(0, 3));
          setConversations(conversationData.slice(0, 3));
          setError("");
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHome();
    fetchNotifications();
    return () => { cancelled = true; };
  }, [fetchNotifications, headers]);

  const recentNotifications = notifications.slice(0, 3);
  const totalUnread = unreadMessages + unreadNotifications + Number(loungeStatus.unread_count || 0);

  return (
    <main className="community-home">
      <section className="community-home__hero" data-nav-theme="light">
        <div className="community-home__hero-glow" aria-hidden="true" />
        <div className="community-home__inner community-home__hero-inner">
          <div>
            <p className="community-home__eyebrow">Community home</p>
            <h1>{greeting()}, <span>{user?.username}.</span></h1>
            <p>Here is what is happening in your community today.</p>
          </div>
          <div className="community-home__pulse" aria-label={`${totalUnread} unread community updates`}>
            <strong>{totalUnread}</strong>
            <span>unread<br />updates</span>
          </div>
        </div>
      </section>

      <div className="community-home__inner community-home__body">
        {error && <p className="community-home__error">{error} You can still use the links below.</p>}

        <section className={`community-home__lounge lounge-activity--${loungeActivity.level}`}>
          <div className="community-home__lounge-fire"><Flame size={27} /></div>
          <div className="community-home__lounge-copy">
            <p className="community-home__eyebrow">Happening now</p>
            <h2>{loungeActivity.label}</h2>
            <p>{loungeActivity.detail}. Drop in for a quick conversation or simply listen for a while.</p>
          </div>
          <div className="community-home__lounge-people">
            <div>
              {loungeStatus.recent_people.map((person) => (
                <MemberAvatar
                  key={person.user_id}
                  username={person.username}
                  avatarUrl={person.avatar_url}
                  size={38}
                />
              ))}
            </div>
            <span>{loungeStatus.participants_today || 0} participated today</span>
          </div>
          <button type="button" onClick={openLounge}>Open Lounge <ArrowRight size={17} /></button>
        </section>

        <div className="community-home__grid">
          <section className="community-home__panel community-home__panel--conversations">
            <header>
              <div><p className="community-home__eyebrow">For you</p><h2>Your conversations</h2></div>
              <Link to="/forum">Open forum <ArrowRight size={15} /></Link>
            </header>

            <div className="community-home__summary-row">
              <Link to="/messages"><MessageCircle size={18} /><strong>{unreadMessages}</strong><span>unread messages</span></Link>
              <Link to="/forum"><Bell size={18} /><strong>{unreadNotifications}</strong><span>new notifications</span></Link>
            </div>

            <div className="community-home__activity-list">
              {recentNotifications.map((notification) => (
                <Link to={notificationPath(notification)} key={notification.notification_id} className={!notification.read_at ? "is-unread" : undefined}>
                  <span className="community-home__activity-icon"><Bell size={15} /></span>
                  <span><strong>{notificationCopy(notification)}</strong><small>{timeAgo(notification.created_at)}</small></span>
                  <ArrowRight size={15} />
                </Link>
              ))}
              {!loading && recentNotifications.length === 0 && (
                <p className="community-home__empty">Nothing new yet. New replies and mentions will appear here.</p>
              )}
            </div>

            {followedPosts.length > 0 && (
              <div className="community-home__followed">
                <h3>Conversations you follow</h3>
                {followedPosts.map((post) => (
                  <Link to={`/forum/${post.post_id}`} key={post.post_id}>
                    <span>{post.is_unread ? "New" : timeAgo(post.latest_activity_at)}</span>
                    <strong>{post.title}</strong>
                    <small>{post.comment_count} {post.comment_count === 1 ? "reply" : "replies"}</small>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <aside className="community-home__side">
            <section className="community-home__panel community-home__announcements">
              <header>
                <div><p className="community-home__eyebrow">From the team</p><h2>Announcements</h2></div>
                <Megaphone size={21} />
              </header>
              {announcements.map((post) => (
                <Link to={`/forum/${post.post_id}`} key={post.post_id}>
                  <small>{timeAgo(post.latest_activity_at)}</small>
                  <strong>{post.title}</strong>
                  <span>{post.body}</span>
                </Link>
              ))}
              {!loading && announcements.length === 0 && <p className="community-home__empty">No announcements right now.</p>}
              <Link className="community-home__text-link" to="/forum?view=announcements">All announcements <ArrowRight size={14} /></Link>
            </section>

            <section className="community-home__panel community-home__messages">
              <header>
                <div><p className="community-home__eyebrow">Private connection</p><h2>Recent messages</h2></div>
              </header>
              {conversations.map((conversation) => (
                <Link to={`/messages/${conversation.conversation_id}`} key={conversation.conversation_id}>
                  <MemberAvatar username={conversation.other_username} avatarUrl={conversation.other_avatar_url} size={38} />
                  <span><strong>{conversation.other_username}</strong><small>{conversation.last_message_body || "Say hello."}</small></span>
                  {conversation.unread_count > 0 && <b>{conversation.unread_count}</b>}
                </Link>
              ))}
              {!loading && conversations.length === 0 && <p className="community-home__empty">No private conversations yet.</p>}
              <Link className="community-home__text-link" to="/messages">Open messages <ArrowRight size={14} /></Link>
            </section>
          </aside>
        </div>

        <section className="community-home__paths">
          <Link to="/forum"><LayoutGrid /><span><strong>Join a conversation</strong><small>Read, reply, or start a forum post.</small></span><ArrowRight /></Link>
          <button type="button" onClick={openLounge}><HeartHandshake /><span><strong>Talk in real time</strong><small>Open the member Lounge.</small></span><ArrowRight /></button>
          <Link to="/profile"><UserRound /><span><strong>Make it yours</strong><small>Update your profile and avatar.</small></span><ArrowRight /></Link>
        </section>
      </div>
    </main>
  );
}
