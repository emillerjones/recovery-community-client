import { useEffect, useRef, useState } from "react";
import { Flame, Send, Trash2, X } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useLounge } from "../../contexts/LoungeContext";
import MemberAvatar from "../MemberAvatar";
import "./LoungeDock.css";

function relativeActivity(status) {
  if (status.messages_last_hour >= 3) {
    return `${status.messages_last_hour} messages this hour`;
  }
  if (status.last_message_at) {
    const minutes = Math.max(
      0,
      Math.floor((Date.now() - new Date(status.last_message_at)) / 60000)
    );
    if (minutes < 1) return "Active just now";
    if (minutes < 60) return `Active ${minutes}m ago`;
  }
  if (status.participants_today > 0) {
    return `${status.participants_today} chatted today`;
  }
  return "Leave a message by the fire";
}

function messageTime(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LoungeDock() {
  const { user } = useAuth();
  const {
    isOpen,
    openLounge,
    closeLounge,
    messages,
    status,
    loading,
    sending,
    error,
    hasMore,
    loadOlder,
    sendMessage,
    deleteMessage,
  } = useLounge();
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [isOpen, messages.length]);

  async function submitMessage(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    if (await sendMessage(body)) setDraft("");
  }

  return (
    <>
      {isOpen && <button
        type="button"
        className="lounge-backdrop"
        aria-label="Close Community Lounge"
        onClick={closeLounge}
      />}

      <aside className={`lounge-panel ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
        <header className="lounge-panel__header">
          <span className="lounge-panel__fire"><Flame size={21} /></span>
          <div>
            <h2>Community Lounge</h2>
            <p><i /> {status.online_count} online across the community</p>
          </div>
          <button type="button" onClick={closeLounge} aria-label="Close Lounge"><X /></button>
        </header>

        <div className="lounge-panel__people">
          <div className="lounge-panel__avatars">
            {status.recent_people.map((person) => (
              <MemberAvatar
                key={person.user_id}
                username={person.username}
                avatarUrl={person.avatar_url}
                size={30}
              />
            ))}
          </div>
          <span>{relativeActivity(status)}</span>
        </div>

        <div className="lounge-messages" ref={listRef} aria-live="polite">
          {hasMore && <button
            type="button"
            className="lounge-messages__older"
            onClick={loadOlder}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load earlier messages"}
          </button>}

          {loading && messages.length === 0 && <p className="lounge-messages__empty">Gathering the conversation...</p>}
          {!loading && messages.length === 0 && <p className="lounge-messages__empty">The fire is quiet. You can be the first to say hello.</p>}

          {messages.map((message) => {
            const ownMessage = message.author_id === user?.id;
            const canDelete = ownMessage || user?.role_id <= 50;
            return (
              <article className={`lounge-message ${ownMessage ? "is-own" : ""}`} key={message.message_id}>
                <MemberAvatar
                  username={message.author_username}
                  avatarUrl={message.avatar_url}
                  size={34}
                />
                <div>
                  <header>
                    <strong>{message.author_username}</strong>
                    <time dateTime={message.created_at}>{messageTime(message.created_at)}</time>
                  </header>
                  {message.deleted_at ? (
                    <p className="lounge-message__deleted">Message removed</p>
                  ) : (
                    <p>{message.body}</p>
                  )}
                </div>
                {canDelete && !message.deleted_at && <button
                  type="button"
                  className="lounge-message__delete"
                  onClick={() => deleteMessage(message.message_id)}
                  aria-label="Delete Lounge message"
                ><Trash2 size={14} /></button>}
              </article>
            );
          })}
        </div>

        {error && <p className="lounge-panel__error">{error}</p>}
        <form className="lounge-composer" onSubmit={submitMessage}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={1000}
            placeholder="Write to the Lounge..."
            aria-label="Lounge message"
          />
          <button type="submit" disabled={!draft.trim() || sending} aria-label="Send message">
            <Send size={19} />
          </button>
        </form>
      </aside>

      {!isOpen && <button type="button" className="lounge-dock" onClick={openLounge}>
        <span className="lounge-dock__icon"><Flame size={20} /></span>
        <span className="lounge-dock__copy">
          <strong>Community Lounge</strong>
          <small><i /> {status.online_count} online · {relativeActivity(status)}</small>
        </span>
        {status.unread_count > 0 && <span className="lounge-dock__badge">
          {status.unread_count > 99 ? "99+" : status.unread_count}
        </span>}
      </button>}
    </>
  );
}
