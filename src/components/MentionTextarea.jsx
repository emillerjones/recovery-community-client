import { useEffect, useRef, useState } from "react";
import "./Mentions.css";

const API = import.meta.env.VITE_API;
const MAX_MENTIONS = 5;

export default function MentionTextarea({
  token,
  value,
  onChange,
  mentions,
  onMentionsChange,
  rows,
  placeholder,
  autoFocus = false,
}) {
  const textareaRef = useRef(null);
  const [query, setQuery] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (query === null || !token) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      // MENTION TRACE STEP 2: Text after @ becomes `q` in this authenticated
      // request. Continue at MENTION TRACE STEP 3 in server/api/users.js.
      fetch(`${API}/api/users/mention-search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
        .then((response) => response.ok ? response.json() : [])
        .then((members) => {
          setSuggestions(members);
          setActiveIndex(0);
        })
        .catch((error) => {
          if (error.name !== "AbortError") setSuggestions([]);
        });
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, token]);

  function updateQuery(text, caret) {
    // MENTION TRACE STEP 1: Every textarea change checks the text immediately
    // before the cursor. A trailing @name fragment opens the member search.
    const beforeCaret = text.slice(0, caret);
    const match = beforeCaret.match(/(?:^|\s)@([a-zA-Z0-9_.-]{0,30})$/);
    const nextQuery = match ? match[1] : null;
    setQuery(nextQuery);
    if (nextQuery === null) setSuggestions([]);
  }

  function handleChange(event) {
    const nextValue = event.target.value;
    onChange(nextValue);

    // If someone deletes a selected @username from the text, release its slot
    // so another member can be selected without exceeding the five-person cap.
    const lowerBody = nextValue.toLowerCase();
    onMentionsChange(mentions.filter((member) => lowerBody.includes(`@${member.username.toLowerCase()}`)));
    updateQuery(nextValue, event.target.selectionStart);
  }

  function selectMember(member) {
    if (!mentions.some((item) => item.user_id === member.user_id) && mentions.length >= MAX_MENTIONS) return;

    const textarea = textareaRef.current;
    const caret = textarea.selectionStart;
    const mentionStart = caret - query.length - 1;
    const nextValue = `${value.slice(0, mentionStart)}@${member.username} ${value.slice(caret)}`;
    const nextCaret = mentionStart + member.username.length + 2;

    // MENTION TRACE STEP 5: Choosing a suggestion inserts the visible
    // @username and also remembers its real user_id. When the form submits,
    // Forum.jsx or ForumThread.jsx sends both pieces to the forum API.
    onChange(nextValue);
    if (!mentions.some((item) => item.user_id === member.user_id)) {
      onMentionsChange([...mentions, member]);
    }
    setQuery(null);
    setSuggestions([]);

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCaret, nextCaret);
    });
  }

  function handleKeyDown(event) {
    if (query === null || !suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      selectMember(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setQuery(null);
      setSuggestions([]);
    }
  }

  return (
    <div className="mention-input">
      <textarea
        ref={textareaRef}
        autoFocus={autoFocus}
        required
        rows={rows}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={(event) => updateQuery(value, event.currentTarget.selectionStart)}
        onBlur={() => {
          setQuery(null);
          setSuggestions([]);
        }}
        placeholder={placeholder}
      />
      <small className="mention-input__hint">Type @ to mention a member · up to 5</small>
      {query !== null && suggestions.length > 0 && (
        <div className="mention-picker" role="listbox" aria-label="Mention a member">
          {suggestions.map((member, index) => (
            <button
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              key={member.user_id}
              disabled={mentions.length >= MAX_MENTIONS && !mentions.some((item) => item.user_id === member.user_id)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectMember(member)}
            >
              <span>{member.username.slice(0, 2).toUpperCase()}</span>
              <strong>@{member.username}</strong>
            </button>
          ))}
          <small>{mentions.length}/{MAX_MENTIONS} selected</small>
        </div>
      )}
    </div>
  );
}
