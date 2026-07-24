import { lazy, Suspense } from "react";
import { memberInitials } from "./memberAvatarUtils";
import "./MemberAvatar.css";

// The full Phosphor preset renderer is deliberately split into a separate
// download. Members without a chosen icon still get an instant initials avatar.
const PresetAvatar = lazy(() => import("./PresetAvatar"));

export default function MemberAvatar({ username, avatarUrl, size = 38, className = "" }) {
  const fallback = memberInitials(username);

  return (
    <span
      className={`member-avatar ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-label={`${username || "Member"}'s avatar`}
      role="img"
    >
      {avatarUrl?.startsWith("preset:") ? (
        <Suspense fallback={fallback}>
          <PresetAvatar value={avatarUrl} fallback={fallback} size={size} />
        </Suspense>
      ) : fallback}
    </span>
  );
}
