import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, Send, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useNotifications } from "../../contexts/NotificationsContext";
import MemberAvatar from "../MemberAvatar";
import "./StaffChat.css";

const API = import.meta.env.VITE_API;
const mergeMessages = (current, incoming) => [...new Map([...current, ...incoming].map(message => [message.message_id, message])).values()]
  .sort((a, b) => Number(a.message_id) - Number(b.message_id));

export default function StaffChatPanel({ onClose, onRevoke }) {
  const { token, user } = useAuth();
  const { socket } = useNotifications();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [atBottom, setAtBottom] = useState(true);
  const dialogRef = useRef(null);
  const listRef = useRef(null);
  const nearBottom = useRef(true);
  const prependScroll = useRef(null);
  const busy = useRef(false);
  const sendingRef = useRef(false);
  const alive = useRef(true);
  const loaded = useRef(false);

  const request = useCallback(async (path = "", options = {}) => {
    const response = await fetch(`${API}/api/staff-chat/messages${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) {
      onRevoke();
      throw new Error("Staff access is no longer available.");
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || "Could not connect to Staff Chat. Please try again.");
    return data;
  }, [token, onRevoke]);

  const load = useCallback(async (before = null) => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    try {
      const data = await request(before ? `?before=${before}` : "");
      if (!alive.current) return;
      if (before && listRef.current) prependScroll.current = { height: listRef.current.scrollHeight, top: listRef.current.scrollTop };
      setMessages(current => mergeMessages(current, data.messages));
      // Refreshing the latest page should not erase already-loaded history.
      if (before || !loaded.current) setHasMore(data.hasMore);
      loaded.current = true;
      setError("");
    } catch (failure) {
      if (alive.current) setError(failure.message);
    } finally {
      busy.current = false;
      if (alive.current) setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    alive.current = true;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    dialog.querySelector("button")?.focus();
    function resize() {
      const viewport = window.visualViewport;
      dialog.style.setProperty("--staff-chat-height", `${viewport?.height ?? window.innerHeight}px`);
      dialog.style.setProperty("--staff-chat-top", `${viewport?.offsetTop ?? 0}px`);
    }
    resize();
    window.visualViewport?.addEventListener("resize", resize);
    window.visualViewport?.addEventListener("scroll", resize);
    window.addEventListener("resize", resize);
    return () => {
      alive.current = false;
      document.body.style.overflow = previousOverflow;
      window.visualViewport?.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("scroll", resize);
      window.removeEventListener("resize", resize);
      dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) load(); });
    // Refresh on return from another app, and recover missed live events.
    const refresh = () => { if (!document.hidden) load(); };
    const timer = window.setInterval(refresh, 15000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [load]);

  useEffect(() => {
    if (!socket) return;
    let cancelled = false;
    const onMessage = message => setMessages(current => mergeMessages(current, [message]));
    const onDeleted = message => setMessages(current => current.map(item => item.message_id === message.message_id ? { ...item, body: null, deleted_at: message.deleted_at } : item));
    socket.on("staff_chat_message", onMessage);
    socket.on("staff_chat_message_deleted", onDeleted);
    socket.timeout(10000).emit("join_staff_chat", (failure, result) => {
      if (cancelled) return;
      if (!failure && result?.ok) load();
    });
    return () => {
      cancelled = true;
      socket.off("staff_chat_message", onMessage);
      socket.off("staff_chat_message_deleted", onDeleted);
      socket.emit("leave_staff_chat");
    };
  }, [socket, load]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (prependScroll.current) {
      list.scrollTop = prependScroll.current.top + list.scrollHeight - prependScroll.current.height;
      prependScroll.current = null;
    } else if (nearBottom.current) list.scrollTop = list.scrollHeight;
  }, [messages]);

  function scrollToLatest() {
    nearBottom.current = true;
    setAtBottom(true);
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }

  async function send(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    try {
      const message = await request("", { method: "POST", body: JSON.stringify({ body }) });
      if (!alive.current) return;
      nearBottom.current = true;
      setAtBottom(true);
      setMessages(current => mergeMessages(current, [message]));
      setDraft(current => current.trim() === body ? "" : current);
      setError("");
    } catch (failure) {
      if (alive.current) setError(failure.message);
    } finally {
      sendingRef.current = false;
      if (alive.current) setSending(false);
    }
  }

  async function remove(message) {
    if (!window.confirm("Remove this message from Staff Chat?")) return;
    try {
      const removed = await request(`/${message.message_id}`, { method: "DELETE" });
      if (alive.current) setMessages(current => current.map(item => item.message_id === removed.message_id ? { ...item, body: null, deleted_at: removed.deleted_at } : item));
    } catch (failure) {
      if (alive.current) setError(failure.message);
    }
  }

  return <dialog className="staff-chat" ref={dialogRef} aria-labelledby="staff-chat-title" onCancel={onClose}>
    <header className="staff-chat__header">
      <button type="button" onClick={onClose} aria-label="Close Staff Chat and return"><ArrowLeft size={22} /></button>
      <div><h2 id="staff-chat-title">Staff Chat</h2><p>Private · Moderators, admins & owner</p></div>
      <ShieldCheck size={24} aria-hidden="true" />
    </header>
    <div className="staff-chat__messages" ref={listRef} onScroll={event => {
      const list = event.currentTarget;
      nearBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight < 70;
      setAtBottom(nearBottom.current);
    }}>
      {hasMore && <button className="staff-chat__older" type="button" disabled={loading} onClick={() => load(messages[0]?.message_id)}>{loading ? "Loading…" : "Load earlier messages"}</button>}
      {loading && !messages.length && <p className="staff-chat__empty">Loading the conversation…</p>}
      {!loading && !messages.length && !error && <p className="staff-chat__empty">A private place for your team to check in.<br />Start the conversation below.</p>}
      {messages.map(message => {
        const own = message.author_id === user?.id;
        return <article className={`staff-chat__message ${own ? "is-own" : ""}`} key={message.message_id}>
          {!own && <MemberAvatar username={message.author_username} avatarUrl={message.avatar_url} size={32} />}
          <div className="staff-chat__bubble">
            <header><strong>{own ? "You" : message.author_username}</strong><time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time></header>
            <p>{message.deleted_at ? <em>Message removed</em> : message.body}</p>
          </div>
          {!message.deleted_at && <button type="button" className="staff-chat__delete" onClick={() => remove(message)} aria-label={`Remove message from ${message.author_username}`}><Trash2 size={16} /></button>}
        </article>;
      })}
    </div>
    {!atBottom && <button className="staff-chat__latest" type="button" onClick={scrollToLatest}><ArrowDown size={16} /> Latest messages</button>}
    {error && <div className="staff-chat__error" role="alert">{error} <button type="button" onClick={() => load()} disabled={loading}>Retry loading</button></div>}
    <form className="staff-chat__composer" onSubmit={send}>
      <textarea rows={2} maxLength={1000} value={draft} onChange={event => setDraft(event.target.value)} placeholder="Message your team…" aria-label="Staff Chat message" />
      <button type="submit" disabled={!draft.trim() || sending} aria-label={sending ? "Sending message" : "Send message"}><Send size={21} /></button>
    </form>
  </dialog>;
}
