import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageSquarePlus, Search, Send, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useMessages } from "../notifications/MessagesContext";
import "./Messages.css";

const API = import.meta.env.VITE_API;

function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function initials(username) {
  return username?.slice(0, 2).toUpperCase() || "?";
}

export default function Messages() {
  const { conversationId } = useParams();
  const { token, user } = useAuth();
  const { socket, refreshUnreadCount } = useMessages();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [pickerSearch, setPickerSearch] = useState("");

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const activeConversation = conversations.find(
    (c) => c.conversation_id === Number(conversationId)
  );

  const loadConversations = useCallback(async () => {
    const response = await fetch(`${API}/api/messages/conversations`, { headers });
    if (response.ok) setConversations(await response.json());
    setLoadingList(false);
  }, [headers]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoadingThread(true);
    fetch(`${API}/api/messages/conversations/${conversationId}/messages`, { headers })
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setMessages(data);
        setLoadingThread(false);
        refreshUnreadCount();
        loadConversations();
      })
      .catch(() => {
        if (!cancelled) setLoadingThread(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, headers]);

  useEffect(() => {
    if (!socket || !conversationId) return;
    const idNumber = Number(conversationId);
    socket.emit("join_conversation", idNumber);

    function onNewMessage(message) {
      if (message.conversation_id !== idNumber) return;
      setMessages((current) =>
        current.some((existing) => existing.message_id === message.message_id) ? current : [...current, message]
      );
      if (message.sender_id !== user?.id) {
        fetch(`${API}/api/messages/conversations/${idNumber}/read`, {
          method: "PATCH",
          headers,
        }).then(() => refreshUnreadCount());
      }
    }
    socket.on("new_message", onNewMessage);

    return () => {
      socket.emit("leave_conversation", idNumber);
      socket.off("new_message", onNewMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, conversationId]);

  async function sendMessage(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    setError("");

    const response = await fetch(`${API}/api/messages/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const result = await response.json();
    setSending(false);

    if (!response.ok) {
      setError(result.message || "Could not send that message.");
      return;
    }
    setMessages((current) =>
      current.some((existing) => existing.message_id === result.message_id) ? current : [...current, result]
    );
    setDraft("");
    loadConversations();
  }

  async function openPicker() {
    setPickerOpen(true);
    if (allUsers.length === 0) {
      const response = await fetch(`${API}/api/users`, { headers });
      if (response.ok) setAllUsers(await response.json());
    }
  }

  async function startConversation(username) {
    const response = await fetch(`${API}/api/messages/conversations`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.message || "Could not start that conversation.");
      return;
    }
    setPickerOpen(false);
    setPickerSearch("");
    await loadConversations();
    navigate(`/messages/${result.conversation_id}`);
  }

  const pickableUsers = allUsers.filter(
    (candidate) =>
      candidate.user_id !== user?.id &&
      candidate.username?.toLowerCase().includes(pickerSearch.trim().toLowerCase())
  );

  return (
    <main className="dm-shell">
      <div className="dm-layout">
        <aside className={`dm-conversations ${conversationId ? "dm-conversations--hide-mobile" : ""}`}>
          <div className="dm-conversations-header">
            <h1>Messages</h1>
            <button className="dm-new-button" onClick={openPicker} aria-label="New message">
              <MessageSquarePlus size={18} />
            </button>
          </div>

          {loadingList && <div className="dm-empty">Loading conversations…</div>}

          {!loadingList && conversations.length === 0 && (
            <div className="dm-empty">
              <p>No conversations yet.</p>
              <button onClick={openPicker}>Start a conversation</button>
            </div>
          )}

          <div className="dm-conversation-list">
            {conversations.map((conversation) => (
              <Link
                key={conversation.conversation_id}
                to={`/messages/${conversation.conversation_id}`}
                className={`dm-conversation-row ${Number(conversationId) === conversation.conversation_id ? "is-active" : ""}`}
              >
                <div className="dm-avatar">{initials(conversation.other_username)}</div>
                <div className="dm-conversation-copy">
                  <div className="dm-conversation-top">
                    <strong>{conversation.other_username}</strong>
                    {conversation.last_message_at && <time>{timeAgo(conversation.last_message_at)}</time>}
                  </div>
                  <p>{conversation.last_message_body || "Say hello."}</p>
                </div>
                {conversation.unread_count > 0 && (
                  <span className="dm-unread-badge">{conversation.unread_count}</span>
                )}
              </Link>
            ))}
          </div>
        </aside>

        <section className={`dm-thread ${conversationId ? "" : "dm-thread--hide-mobile"}`}>
          {!conversationId && (
            <div className="dm-empty dm-empty--center">
              <p>Select a conversation, or start a new one.</p>
            </div>
          )}

          {conversationId && (
            <>
              <div className="dm-thread-header">
                <Link to="/messages" className="dm-back"><ArrowLeft size={18} /></Link>
                <div className="dm-avatar">{initials(activeConversation?.other_username)}</div>
                <strong>{activeConversation?.other_username || "Conversation"}</strong>
              </div>

              <div className="dm-messages">
                {loadingThread && <div className="dm-empty">Loading…</div>}
                {!loadingThread &&
                  messages.map((message) => (
                    <div
                      key={message.message_id}
                      className={`dm-bubble ${message.sender_id === user?.id ? "is-mine" : ""}`}
                    >
                      <p>{message.body}</p>
                      <time>{timeAgo(message.created_at)}</time>
                    </div>
                  ))}
              </div>

              {error && <p className="dm-error" role="alert">{error}</p>}

              <form className="dm-composer" onSubmit={sendMessage}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message…"
                  aria-label="Message"
                />
                <button disabled={sending || !draft.trim()} aria-label="Send">
                  <Send size={17} />
                </button>
              </form>
            </>
          )}
        </section>
      </div>

      {pickerOpen && (
        <div className="dm-modal-backdrop" role="presentation" onMouseDown={() => setPickerOpen(false)}>
          <section className="dm-picker" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <button className="dm-modal-close" onClick={() => setPickerOpen(false)} aria-label="Close"><X /></button>
            <h2>New message</h2>
            <label className="dm-picker-search">
              <Search size={16} />
              <input
                autoFocus
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search members…"
              />
            </label>
            <ul className="dm-picker-list">
              {pickableUsers.map((candidate) => (
                <li key={candidate.user_id}>
                  <button onClick={() => startConversation(candidate.username)}>
                    <div className="dm-avatar dm-avatar--small">{initials(candidate.username)}</div>
                    {candidate.username}
                  </button>
                </li>
              ))}
              {pickableUsers.length === 0 && <li className="dm-picker-empty">No members found.</li>}
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}
