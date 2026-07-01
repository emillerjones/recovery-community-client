import "./RoleBadge.css";

/**
 * A small colored pill showing a user's role name.
 * Keeping this as its own tiny component means the color logic for
 * each role lives in exactly one place, instead of being repeated
 * everywhere a role needs to be displayed.
 */

// Maps a role_id to a label and a CSS class for its color.
// If you add more roles later, just add another entry here.
const ROLE_STYLES = {
  1: { label: "Owner", className: "role-badge--owner" },
  10: { label: "Administrator", className: "role-badge--admin" },
  50: { label: "Moderator", className: "role-badge--moderator" },
  100: { label: "Member", className: "role-badge--member" },
};

export default function RoleBadge({ roleId }) {
  // Fallback in case a role_id shows up that isn't in our map above.
  const style = ROLE_STYLES[roleId] ?? {
    label: "Unknown",
    className: "role-badge--unknown",
  };

  return (
    <span className={`role-badge ${style.className}`}>{style.label}</span>
  );
}
