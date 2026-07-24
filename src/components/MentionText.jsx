import "./Mentions.css";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function MentionText({ body, mentions = [], className }) {
  if (!mentions.length) return <p className={className}>{body}</p>;

  const byUsername = new Map(mentions.map((mention) => [mention.username.toLowerCase(), mention]));
  const names = [...byUsername.keys()].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(@(?:${names.map(escapeRegExp).join("|")}))`, "gi");

  return (
    <p className={className}>
      {body.split(pattern).map((part, index) => {
        const member = part.startsWith("@") ? byUsername.get(part.slice(1).toLowerCase()) : null;
        return member
          ? <span className="forum-mention" key={`${member.user_id}-${index}`}>{part}</span>
          : part;
      })}
    </p>
  );
}
