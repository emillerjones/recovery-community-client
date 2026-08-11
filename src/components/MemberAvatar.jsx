import { lazy, Suspense } from "react";
import { memberInitials } from "./memberAvatarUtils";
import { useAuth } from "../auth/AuthContext";
import ProtectedImage from "./forumPhotos/ProtectedImage";
import "./MemberAvatar.css";

// The full Phosphor preset renderer is deliberately split into a separate
// download. Members without a chosen icon still get an instant initials avatar.
const PresetAvatar = lazy(() => import("./PresetAvatar"));

export default function MemberAvatar({ username, avatarUrl, size = 38, className = "" }) {
  const { token } = useAuth();
  const fallback = memberInitials(username);
  const uploadedAvatar = /^media:(\d+)$/.exec(avatarUrl || "");

  return (
    <span
      className={`member-avatar ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-label={`${username || "Member"}'s avatar`}
      role="img"
    >
      {uploadedAvatar ? (
        <ProtectedImage mediaId={uploadedAvatar[1]} token={token} variant="avatar" fallback={fallback} className="member-avatar__photo" alt="" />
      ) : avatarUrl?.startsWith("preset:") ? (
        <Suspense fallback={fallback}>
          <PresetAvatar value={avatarUrl} fallback={fallback} size={size} />
        </Suspense>
      ) : fallback}
    </span>
  );
}
