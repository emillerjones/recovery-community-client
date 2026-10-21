import { useId } from "react";
import { ChevronDown } from "lucide-react";
import MemberAvatar from "../../components/MemberAvatar";

// The draft belongs to the composer, so changing identity never clears its text.
export default function ReplyIdentity({ user, identity, onChange, disabled }) {
  const id = useId();
  const name = identity.importing ? identity.name.trim() || "Another name" : user.username;
  return (
    <div className="forum-reply-identity">
      <label htmlFor={`${id}-choice`}>Replying as</label>
      <div className="forum-reply-identity__select">
        <MemberAvatar username={name} avatarUrl={identity.importing ? null : user.avatar_url} size={26} />
        <select id={`${id}-choice`} value={identity.importing ? "another" : "myself"} disabled={disabled}
          onChange={event => onChange({ ...identity, importing: event.target.value === "another" })}>
          <option value="myself">{user.username} (Myself)</option>
          <option value="another">{identity.name.trim() || "Another name"}</option>
        </select>
        <ChevronDown size={14} aria-hidden="true" />
      </div>
      {identity.importing && (
        <label className="forum-reply-identity__name" htmlFor={`${id}-name`}>
          <span>Display name</span>
          <input id={`${id}-name`} type="text" value={identity.name} required maxLength={80}
            autoComplete="off" placeholder="e.g. Participant A" disabled={disabled}
            onChange={event => onChange({ ...identity, name: event.target.value })} />
        </label>
      )}
    </div>
  );
}
