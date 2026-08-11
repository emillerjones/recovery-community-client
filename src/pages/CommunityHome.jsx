import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Activity,
  Bell,
  Camera,
  Flame,
  LayoutGrid,
  Megaphone,
  MessageCircle,
  Plus,
  Radio,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import MemberAvatar from "../components/MemberAvatar";
import { useLounge } from "../contexts/LoungeContext";
import { useMessages } from "../contexts/MessagesContext";
import { useNotifications } from "../contexts/NotificationsContext";
import ForumComposerModal from "./forum/ForumComposerModal";
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
  const { unreadCount: unreadNotifications, notifications, fetchNotifications } = useNotifications();
  const [announcements, setAnnouncements] = useState([]);
  const [pulse, setPulse] = useState({ summary: {}, week: [], activity: [] });
  const [followedPosts, setFollowedPosts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loungeActivity = getLoungeActivity(loungeStatus);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    let cancelled = false;
    async function loadHome() {
      setLoading(true);
      try {
        const responses = await Promise.all([
          fetch(`${API}/api/forum/posts?section=announcements&scope=all&order=recent&page=0`, { headers }),
          fetch(`${API}/api/forum/posts?section=community&scope=following&order=recent&page=0`, { headers }),
          fetch(`${API}/api/messages/conversations`, { headers }),
          fetch(`${API}/api/forum/categories`, { headers }),
          fetch(`${API}/api/forum/tags`, { headers }),
          fetch(`${API}/api/lounge/pulse`, { headers }),
        ]);
        if (responses.some((response) => !response.ok)) throw new Error("Some community updates could not be loaded.");
        const [announcementData, followedData, conversationData, categoryData, tagData, pulseData] = await Promise.all(responses.map((response) => response.json()));
        if (!cancelled) {
          setAnnouncements(announcementData.posts.slice(0, 2));
          setFollowedPosts(followedData.posts.slice(0, 3));
          setConversations(conversationData.slice(0, 3));
          setCategories(categoryData);
          setTags(tagData);
          setPulse(pulseData);
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

  const mainCategory = categories.find((category) => category.slug === "general-recovery")
    || categories.find((category) => !["announcements", "success-stories"].includes(category.slug));
  const onlineMembers = loungeStatus.online_members || [];
  const recentNotifications = notifications.slice(0, 3);
  const totalUnread = unreadMessages + unreadNotifications + Number(loungeStatus.unread_count || 0);
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const pulseSummary = pulse.summary || {};
  const contributionsToday = Number(pulseSummary.posts_today || 0) + Number(pulseSummary.replies_today || 0);
  const busiestDay = Math.max(1, ...pulse.week.map((day) => Number(day.total || 0)));

  function activityCopy(activity) {
    if (activity.activity_type === "post") return "started a conversation";
    if (activity.activity_type === "reply") return "joined a conversation";
    return "sent support";
  }

  return (
    <main className="community-home" data-nav-theme="dark">
      <div className="community-home__shell">
        <section className="community-home__welcome">
          <div className="community-home__welcome-copy">
            <p className="community-home__eyebrow"><span /> Member home · {today}</p>
            <h1>{greeting()}, {user?.username}.</h1>
            <p>This is your place to see who is here, catch up, and join what matters today.</p>
            <div className="community-home__welcome-actions">
              <button type="button" onClick={() => setComposerOpen(true)}><Plus size={17} /> Share something</button>
              <button type="button" className="is-secondary" onClick={openLounge}><Flame size={17} /> Open Lounge</button>
            </div>
          </div>
          <div className="community-home__welcome-presence">
            <div className="community-home__avatar-stack">
              {onlineMembers.slice(0, 5).map((member) => (
                <MemberAvatar key={member.user_id} username={member.username} avatarUrl={member.avatar_url} size={45} />
              ))}
              {!onlineMembers.length && <MemberAvatar username={user?.username} avatarUrl={user?.avatar_url} size={45} />}
            </div>
            <span><strong>{loungeStatus.online_count || "…"}</strong><small>{loungeStatus.online_count ? `${Number(loungeStatus.online_count) === 1 ? "member is" : "members are"} here now` : "checking who’s here"}</small></span>
            <i aria-hidden="true" />
          </div>
        </section>

        {error && <p className="community-home__error">{error} You can still use the community links.</p>}

        <section className="community-home__pulse" aria-label="Your community updates">
          <Link to="/messages"><MessageCircle /><span><strong>{unreadMessages}</strong><small>Unread messages</small></span></Link>
          <Link to="/forum"><Bell /><span><strong>{unreadNotifications}</strong><small>Notifications</small></span></Link>
          <button type="button" onClick={openLounge}><Flame /><span><strong>{loungeStatus.unread_count || 0}</strong><small>Lounge updates</small></span></button>
          <span className="community-home__caught-up">{totalUnread ? `${totalUnread} things waiting for you` : "You’re all caught up"}</span>
        </section>

        <div className="community-home__layout">
          <div className="community-home__feed">
            <button className="community-home__composer" type="button" onClick={() => setComposerOpen(true)}>
              <MemberAvatar username={user?.username} avatarUrl={user?.avatar_url} size={46} />
              <span><strong>What would you like to share?</strong><small>A thought, a photo, a question, or simply where you are today.</small></span>
              <i><Camera size={17} /> Add a post</i>
            </button>

            <section className="community-home__pulse-board">
              <header className="community-home__feed-heading">
                <div><p>Community Pulse</p><h2>The community at a glance</h2></div>
                <span className="community-home__live-label"><i /> Live overview</span>
              </header>

              <div className="community-home__pulse-visual">
                <div className="community-home__orbit" aria-hidden="true"><i /><i /><i /></div>
                <div className="community-home__pulse-center"><Activity size={25} /><strong>{contributionsToday}</strong><small>contributions today</small></div>
                <div className="community-home__pulse-stat stat-posts"><strong>{pulseSummary.posts_today || 0}</strong><span>new conversations</span></div>
                <div className="community-home__pulse-stat stat-replies"><strong>{pulseSummary.replies_today || 0}</strong><span>replies shared</span></div>
                <div className="community-home__pulse-stat stat-support"><strong>{pulseSummary.reactions_today || 0}</strong><span>supportive reactions</span></div>
                <div className="community-home__pulse-stat stat-people"><strong>{pulseSummary.participants_today || 0}</strong><span>people participating</span></div>
              </div>

              <div className="community-home__week">
                <header><span><strong>Last seven days</strong><small>Posts, replies, and support</small></span><Sparkles size={17} /></header>
                <div className="community-home__week-chart">
                  {pulse.week.map((day) => {
                    const date = new Date(`${String(day.day).slice(0, 10)}T12:00:00`);
                    return <div key={day.day} title={`${day.total} contributions`}><span><i style={{ height: `${Math.max(5, (Number(day.total) / busiestDay) * 100)}%` }} /></span><small>{date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1)}</small></div>;
                  })}
                </div>
              </div>
            </section>

            <section className="community-home__activity-stream">
              <header className="community-home__feed-heading"><div><p>Right now</p><h2>The community is moving</h2></div><Link to="/forum">Open Forum <ArrowRight size={15} /></Link></header>
              <div>
                {pulse.activity.map((activity, index) => (
                  <Link to={`/forum/${activity.post_id}`} key={`${activity.activity_type}-${activity.actor_id}-${activity.created_at}-${index}`}>
                    <span className="community-home__timeline-mark"><i /></span>
                    <MemberAvatar username={activity.username} avatarUrl={activity.avatar_url} size={38} />
                    <span><strong>{activity.username} {activityCopy(activity)}</strong><small>{activity.title} · {timeAgo(activity.created_at)}</small></span>
                    <ArrowRight size={14} />
                  </Link>
                ))}
                {!loading && !pulse.activity.length && <p className="community-home__empty">The community is quiet right now. Your contribution can begin the day.</p>}
              </div>
            </section>
          </div>

          <aside className="community-home__rail">
            <section className="community-home__card community-home__online">
              <header><div><p>Community room</p><h2>Who’s here</h2></div><Radio size={19} /></header>
              <p className="community-home__online-intro">People currently connected to the members area.</p>
              <div className="community-home__people">
                {onlineMembers.map((member) => (
                  <div key={member.user_id}>
                    <span className="community-home__person-avatar"><MemberAvatar username={member.username} avatarUrl={member.avatar_url} size={42} /><i /></span>
                    <span><strong>{member.user_id === user?.id ? "You" : member.username}</strong><small>Here now</small></span>
                  </div>
                ))}
                {!onlineMembers.length && <p className="community-home__empty">You’re the first one here. Others will appear as they arrive.</p>}
              </div>
              <div className="community-home__connect-actions">
                <button type="button" onClick={openLounge}>Say hello in the Lounge</button>
                <Link to="/messages">Message a member</Link>
              </div>
            </section>

            <section className={`community-home__card community-home__lounge lounge-activity--${loungeActivity.level}`}>
              <header><div><p>Live conversation</p><h2>{loungeActivity.label}</h2></div><Flame size={20} /></header>
              <p>{loungeActivity.detail}. Drop in, say hello, or listen for a while.</p>
              <footer><span>{loungeStatus.participants_today || 0} participated today</span><button type="button" onClick={openLounge}>Open Lounge <ArrowRight size={15} /></button></footer>
            </section>

            <section className="community-home__card community-home__announcements">
              <header><div><p>From the team</p><h2>Announcements</h2></div><Megaphone size={20} /></header>
              {announcements.map((post) => <Link to={`/forum/${post.post_id}`} key={post.post_id}><small>{timeAgo(post.latest_activity_at)}</small><strong>{post.title}</strong><span>{post.body}</span></Link>)}
              {!loading && !announcements.length && <p className="community-home__empty">No announcements right now.</p>}
              <Link className="community-home__text-link" to="/forum?view=announcements">All announcements <ArrowRight size={14} /></Link>
            </section>

            <section className="community-home__card community-home__for-you">
              <header><div><p>Your connections</p><h2>For you</h2></div><UsersRound size={20} /></header>
              {recentNotifications.map((notification) => <Link to={notificationPath(notification)} key={notification.notification_id}><Bell size={14} /><span><strong>{notificationCopy(notification)}</strong><small>{timeAgo(notification.created_at)}</small></span></Link>)}
              {!loading && !recentNotifications.length && followedPosts.map((post) => <Link to={`/forum/${post.post_id}`} key={post.post_id}><LayoutGrid size={14} /><span><strong>{post.title}</strong><small>{timeAgo(post.latest_activity_at)}</small></span></Link>)}
              {!loading && !recentNotifications.length && !followedPosts.length && <p className="community-home__empty">Replies, mentions, and followed conversations will appear here.</p>}
            </section>

            <section className="community-home__card community-home__messages">
              <header><div><p>Private</p><h2>Recent messages</h2></div></header>
              {conversations.map((conversation) => <Link to={`/messages/${conversation.conversation_id}`} key={conversation.conversation_id}><MemberAvatar username={conversation.other_username} avatarUrl={conversation.other_avatar_url} size={38} /><span><strong>{conversation.other_username}</strong><small>{conversation.last_message_body || "Say hello."}</small></span>{conversation.unread_count > 0 && <b>{conversation.unread_count}</b>}</Link>)}
              {!loading && !conversations.length && <p className="community-home__empty">No private conversations yet.</p>}
              <Link className="community-home__text-link" to="/messages">Open messages <ArrowRight size={14} /></Link>
            </section>
          </aside>
        </div>
      </div>

      <ForumComposerModal open={composerOpen} user={user} token={token} categoryId={mainCategory?.category_id} canPublish composingAnnouncement={false} tags={tags} onClose={() => setComposerOpen(false)} />
    </main>
  );
}
