import { useEffect, useState } from "react";
import { Clock3, LockKeyhole, Pencil, Users } from "lucide-react";
import ConfirmModal from "../ConfirmModal";
import PollComposer from "./PollComposer";
import PollVotersModal from "./PollVotersModal";
import { pollDraftToRequest, pollToDraft } from "./pollDraft";
import "./ForumPoll.css";

const API = import.meta.env.VITE_API;

function closingLabel(poll, isClosed) {
  if (isClosed) return "Poll closed";
  if (!poll.closes_at) return "No deadline";
  const milliseconds = new Date(poll.closes_at).getTime() - Date.now();
  const minutes = Math.max(1, Math.ceil(milliseconds / 60000));
  if (minutes < 60) return `Closes in ${minutes}m`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 48) return `Closes in ${hours}h`;
  return `Closes in ${Math.ceil(hours / 24)}d`;
}

export default function ForumPoll({ initialPoll, postId, token, canManage = false, socket = null }) {
  const [poll, setPoll] = useState(initialPoll);
  const [selected, setSelected] = useState(() => initialPoll.my_option_ids.map(String));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [voterOption, setVoterOption] = useState(null);
  const [clock, setClock] = useState(() => Date.now());
  const isClosed = poll.is_closed
    || Boolean(poll.closes_at && new Date(poll.closes_at).getTime() <= clock);
  const totalVoters = Number(poll.total_voters || 0);

  useEffect(() => {
    if (!poll.closes_at || isClosed) return undefined;
    const intervalId = window.setInterval(() => setClock(Date.now()), 30000);
    return () => window.clearInterval(intervalId);
  }, [isClosed, poll.closes_at]);

  useEffect(() => {
    if (!socket) return undefined;
    let cancelled = false;
    function refreshPoll(payload) {
      if (Number(payload.post_id) !== Number(postId)) return;
      fetch(`${API}/api/forum/posts/${postId}/poll`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.ok ? response.json() : null)
        .then((result) => {
          if (!result || cancelled) return;
          setPoll(result);
          setSelected(result.my_option_ids.map(String));
        })
        .catch(() => {});
    }
    socket.on("poll_updated", refreshPoll);
    return () => {
      cancelled = true;
      socket.off("poll_updated", refreshPoll);
    };
  }, [postId, socket, token]);

  function choose(optionId) {
    if (isClosed || submitting) return;
    const id = String(optionId);
    if (!poll.allow_multiple) return setSelected([id]);
    setSelected((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id]);
  }

  async function updateVote(method) {
    if (method === "PUT" && selected.length === 0) return setError("Choose an option first.");
    setSubmitting(true);
    setError("");
    const response = await fetch(`${API}/api/forum/posts/${postId}/poll/vote`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(method === "PUT" ? { "Content-Type": "application/json" } : {}),
      },
      body: method === "PUT" ? JSON.stringify({ option_ids: selected }) : undefined,
    });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok) return setError(result.message || "Could not update your vote.");
    setPoll(result);
    setSelected(result.my_option_ids.map(String));
  }

  function startEditing() {
    setEditDraft(pollToDraft(poll));
    setEditing(true);
    setError("");
  }

  async function saveEdit(event) {
    event.preventDefault();
    let requestPoll;
    try {
      requestPoll = pollDraftToRequest(editDraft);
    } catch (err) {
      return setError(err.message);
    }
    setSubmitting(true);
    setError("");
    const response = await fetch(`${API}/api/forum/posts/${postId}/poll`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ poll: requestPoll }),
    });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok) return setError(result.message || "Could not update this poll.");
    setPoll(result);
    setSelected(result.my_option_ids.map(String));
    setEditing(false);
  }

  async function closePoll() {
    setConfirmingClose(false);
    setSubmitting(true);
    setError("");
    const response = await fetch(`${API}/api/forum/posts/${postId}/poll/close`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok) return setError(result.message || "Could not close this poll.");
    setPoll(result);
    setSelected(result.my_option_ids.map(String));
  }

  if (editing) {
    return (
      <form className="forum-poll forum-poll--editing" onSubmit={saveEdit} onClick={(event) => event.stopPropagation()}>
        <PollComposer value={editDraft} onChange={setEditDraft} editing />
        {error && <p className="forum-poll__error" role="alert">{error}</p>}
        <div className="forum-poll__actions">
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          <button className="forum-poll__primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save poll"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <section className="forum-poll" aria-labelledby={`poll-question-${poll.poll_id}`} onClick={(event) => event.stopPropagation()}>
      <div className="forum-poll__heading">
        <div>
          <p>Community poll</p>
          <h3 id={`poll-question-${poll.poll_id}`}>{poll.question}</h3>
        </div>
        <span>{poll.allow_multiple ? "Choose any that apply" : "Choose one"}</span>
      </div>

      <div className="forum-poll__options">
        {poll.options.map((option) => {
          const checked = selected.includes(String(option.option_id));
          const showResults = poll.can_view_results;
          return (
            <div
              key={option.option_id}
              className={`forum-poll__option ${checked ? "is-selected" : ""}`}
              style={{ "--poll-progress": `${showResults ? option.percentage : 0}%` }}
            >
              <label>
                <input
                  type={poll.allow_multiple ? "checkbox" : "radio"}
                  name={`poll-${poll.poll_id}`}
                  checked={checked}
                  disabled={isClosed || submitting}
                  onChange={() => choose(option.option_id)}
                />
                <span>{option.option_text}</span>
              </label>
              {showResults && (
                <button
                  type="button"
                  className="forum-poll__result"
                  disabled={!poll.can_view_voters || Number(option.vote_count) === 0}
                  onClick={() => poll.can_view_voters && setVoterOption(option)}
                  aria-label={poll.can_view_voters ? `View voters for ${option.option_text}` : undefined}
                >
                  <strong>{option.percentage}%</strong>
                  <small>{option.vote_count} {Number(option.vote_count) === 1 ? "vote" : "votes"}</small>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!poll.can_view_results && (
        <p className="forum-poll__hidden-results">
          {poll.results_visibility === "after_close"
            ? "Results will appear when the poll closes."
            : "Vote to see the results."}
        </p>
      )}
      {error && <p className="forum-poll__error" role="alert">{error}</p>}

      <div className="forum-poll__actions">
        {!isClosed && (
          <button
            type="button"
            className="forum-poll__primary"
            disabled={submitting || selected.length === 0}
            onClick={() => updateVote("PUT")}
          >
            {submitting ? "Saving…" : poll.has_voted ? "Update vote" : "Vote"}
          </button>
        )}
        {!isClosed && poll.has_voted && (
          <button type="button" disabled={submitting} onClick={() => updateVote("DELETE")}>Remove vote</button>
        )}
        <span className="forum-poll__meta"><Users size={14} /> {totalVoters} {totalVoters === 1 ? "voter" : "voters"}</span>
        <span className="forum-poll__meta"><Clock3 size={14} /> {closingLabel(poll, isClosed)}</span>
        {poll.voter_visibility === "private" && (
          <span className="forum-poll__meta"><LockKeyhole size={14} /> Private votes</span>
        )}
      </div>

      {canManage && !isClosed && (
        <div className="forum-poll__manage">
          {!poll.voting_started && <button type="button" onClick={startEditing}><Pencil size={14} /> Edit poll</button>}
          <button type="button" onClick={() => setConfirmingClose(true)}>End poll now</button>
        </div>
      )}

      <ConfirmModal
        open={confirmingClose}
        title="End this poll?"
        message="Voting will stop immediately. This cannot be undone."
        confirmLabel="End poll"
        danger
        onConfirm={closePoll}
        onCancel={() => setConfirmingClose(false)}
      />
      {voterOption && (
        <PollVotersModal
          key={voterOption.option_id}
          postId={postId}
          option={voterOption}
          token={token}
          onClose={() => setVoterOption(null)}
        />
      )}
    </section>
  );
}
