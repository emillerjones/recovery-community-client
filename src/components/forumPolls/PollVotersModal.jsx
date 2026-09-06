import { useEffect, useState } from "react";
import { X } from "lucide-react";
import MemberAvatar from "../MemberAvatar";

const API = import.meta.env.VITE_API;

export default function PollVotersModal({ postId, option, token, onClose }) {
  const [voters, setVoters] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/forum/posts/${postId}/poll/voters?optionId=${option.option_id}&page=0`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Could not load voters.");
        return result;
      })
      .then((result) => {
        if (cancelled) return;
        setVoters(result.voters);
        setHasMore(result.has_more);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [option.option_id, postId, token]);

  async function loadMore() {
    const nextPage = page + 1;
    setLoading(true);
    const response = await fetch(
      `${API}/api/forum/posts/${postId}/poll/voters?optionId=${option.option_id}&page=${nextPage}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const result = await response.json();
    setLoading(false);
    if (!response.ok) return setError(result.message || "Could not load more voters.");
    setVoters((current) => [...current, ...result.voters]);
    setPage(nextPage);
    setHasMore(result.has_more);
  }

  return (
    <div className="poll-voters-modal" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="poll-voters-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="poll-voters-modal__close" onClick={onClose} aria-label="Close voter list">
          <X size={20} />
        </button>
        <p>Votes for</p>
        <h2 id="poll-voters-title">{option.option_text}</h2>
        {error && <p className="poll-voters-modal__error" role="alert">{error}</p>}
        {!loading && voters.length === 0 && <p>No votes for this choice yet.</p>}
        <div className="poll-voters-modal__list">
          {voters.map((voter) => (
            <div key={voter.user_id}>
              <MemberAvatar username={voter.username} avatarUrl={voter.avatar_url} size={38} />
              <strong>{voter.username}</strong>
            </div>
          ))}
        </div>
        {loading && <p>Loading voters…</p>}
        {hasMore && !loading && <button onClick={loadMore}>Load more</button>}
      </section>
    </div>
  );
}
