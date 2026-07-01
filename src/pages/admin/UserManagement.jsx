import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import RoleBadge from "../../components/RoleBadge";
import ConfirmModal from "../../components/ConfirmModal";
import { Toast, useToast } from "../../components/Toast";
import "./UserManagement.css";

const API = import.meta.env.VITE_API;

// The four roles, in order from highest authority to lowest.
// role_id 1 (Owner) is intentionally left OUT of this list — it's
// never something you can assign to someone through this page.
const ASSIGNABLE_ROLES = [
  { role_id: 10, label: "Administrator" },
  { role_id: 50, label: "Moderator" },
  { role_id: 100, label: "Member" },
];

const OWNER_ROLE_ID = 1;

// All known role labels, keyed by role_id — used for the stats
// summary row, so it can show a friendly breakdown like
// "3 Owners · 1 Administrator · 6 Members" instead of raw numbers.
const ROLE_LABELS = {
  1: "Owner",
  10: "Administrator",
  50: "Moderator",
  100: "Member",
};

// A small set of colors to cycle through for avatar circles, so
// rows are visually distinguishable from one another at a glance.
const AVATAR_COLORS = ["#C97B5E", "#5E83A8", "#7B6CA8", "#5E8C6A", "#C9A05E"];

// Turns "jane_doe" into "JD" for the avatar circle, and picks a
// color based on the user's id so the same person always gets the
// same color across renders.
function getInitials(username) {
  if (!username) return "?";
  return username.slice(0, 2).toUpperCase();
}
function getAvatarColor(userId) {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
}

export default function UserManagement() {
  const { token, user: currentUser } = useAuth();
  const { toast, showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Tracks which confirm modal (if any) is currently open, and which
  // user + action it's for. When this is null, no modal is showing.
  const [pendingAction, setPendingAction] = useState(null);
  // Shape: { type: "role" | "deactivate" | "reactivate" | "delete", user, newRoleId? }

  async function fetchUsers() {
    setLoading(true);
    const response = await fetch(`${API}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Returns true if the logged-in admin is allowed to manage this
  // particular user, based on our role hierarchy rule: you can only
  // act on someone with a HIGHER role_id number (= lower authority)
  // than your own.
  function canManage(targetUser) {
    return targetUser.role_id > currentUser.role_id;
  }

  // Filters the user list by the search box, matching username or email
  const visibleUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.username?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });

  // Builds the little "3 Owners · 1 Administrator · ..." summary.
  // We count from the FULL user list (not the filtered/searched
  // one), so these numbers always reflect the whole community,
  // not just whatever the search box currently matches.
  const activeCount = users.filter((u) => u.active).length;
  const roleCounts = users.reduce((counts, u) => {
    counts[u.role_id] = (counts[u.role_id] || 0) + 1;
    return counts;
  }, {});

  // ---------- Role change ----------

  function askToChangeRole(targetUser, newRoleId) {
    setPendingAction({ type: "role", user: targetUser, newRoleId });
  }

  async function confirmRoleChange() {
    const { user: targetUser, newRoleId } = pendingAction;

    const response = await fetch(`${API}/api/users/${targetUser.user_id}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role_id: newRoleId }),
    });

    if (response.ok) {
      const updated = await response.json();
      setUsers((prev) =>
        prev.map((u) => (u.user_id === updated.user_id ? updated : u))
      );
      const newRoleLabel = ASSIGNABLE_ROLES.find((r) => r.role_id === newRoleId)?.label;
      showToast(`${targetUser.username} is now ${newRoleLabel}`);
    } else {
      showToast("Something went wrong changing that role.");
    }

    setPendingAction(null);
  }

  // ---------- Activate / deactivate ----------

  function askToToggleActive(targetUser) {
    setPendingAction({
      type: targetUser.active ? "deactivate" : "reactivate",
      user: targetUser,
    });
  }

  async function confirmActiveToggle() {
    const { user: targetUser, type } = pendingAction;
    const newActiveValue = type === "reactivate";

    const response = await fetch(`${API}/api/users/${targetUser.user_id}/active`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ active: newActiveValue }),
    });

    if (response.ok) {
      const updated = await response.json();
      setUsers((prev) =>
        prev.map((u) => (u.user_id === updated.user_id ? updated : u))
      );
      showToast(
        newActiveValue
          ? `${targetUser.username} has been reactivated`
          : `${targetUser.username} has been deactivated`
      );
    } else {
      showToast("Something went wrong updating that account.");
    }

    setPendingAction(null);
  }

  // ---------- Soft delete ----------

  function askToDelete(targetUser) {
    setPendingAction({ type: "delete", user: targetUser });
  }

  async function confirmDelete() {
    const { user: targetUser } = pendingAction;

    const response = await fetch(`${API}/api/users/${targetUser.user_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      // Remove the deleted user from the visible list entirely,
      // rather than trying to show a "deleted" state for them.
      setUsers((prev) => prev.filter((u) => u.user_id !== targetUser.user_id));
      showToast(`${targetUser.username} has been deleted`);
    } else {
      showToast("Something went wrong deleting that user.");
    }

    setPendingAction(null);
  }

  // Decides which confirm function to run based on pendingAction.type
  function handleConfirm() {
    if (!pendingAction) return;
    if (pendingAction.type === "role") return confirmRoleChange();
    if (pendingAction.type === "delete") return confirmDelete();
    return confirmActiveToggle(); // covers "deactivate" and "reactivate"
  }

  return (
    <div className="user-management">
        <div className="user-management__header">
          <div>
            <h1>User Management</h1>
            <p className="user-management__subtitle">
              Manage roles, access, and account status across the community.
            </p>
          </div>
          <input
            className="user-management__search"
            type="text"
            placeholder="Search by username or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Quick-glance stats: total + active members, and a count
            per role. Helps this feel like a real dashboard rather
            than just a bare list. */}
        {!loading && (
          <div className="user-stats">
            <div className="user-stats__item">
              <span className="user-stats__number">{users.length}</span>
              <span className="user-stats__label">Total Members</span>
            </div>
            <div className="user-stats__item">
              <span className="user-stats__number">{activeCount}</span>
              <span className="user-stats__label">Active</span>
            </div>
            <div className="user-stats__breakdown">
              {Object.entries(roleCounts).map(([roleId, count]) => (
                <span key={roleId} className="user-stats__breakdown-item">
                  {count} {ROLE_LABELS[roleId] ?? "Unknown"}
                  {count !== 1 ? "s" : ""}
                </span>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <p className="user-management__loading">Loading users…</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((u) => {
                const isOwner = u.role_id === OWNER_ROLE_ID;
                const isSelf = u.user_id === currentUser.user_id;
                const manageable = canManage(u) && !isSelf;

                return (
                  <tr key={u.user_id} className={!u.active ? "user-row--inactive" : ""}>
                    <td>
                      <div className="user-cell">
                        <span
                          className="user-cell__avatar"
                          style={{ background: getAvatarColor(u.user_id) }}
                        >
                          {getInitials(u.username)}
                        </span>
                        <div className="user-cell__text">
                          <span className="user-cell__name">{u.username}</span>
                          <span className="user-cell__email">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {isOwner || !manageable ? (
                        // Owners (and anyone you're not allowed to manage)
                        // just show a static badge, no dropdown at all.
                        <RoleBadge roleId={u.role_id} />
                      ) : (
                        <select
                          className="role-select"
                          value={u.role_id}
                          onChange={(e) =>
                            askToChangeRole(u, Number(e.target.value))
                          }
                        >
                          {ASSIGNABLE_ROLES
                            // Only show roles that this admin is actually
                            // allowed to assign (must be below their own rank)
                            .filter((r) => r.role_id > currentUser.role_id)
                            .map((r) => (
                              <option key={r.role_id} value={r.role_id}>
                                {r.label}
                              </option>
                            ))}
                        </select>
                      )}
                    </td>

                    <td>
                      <span
                        className={`status-pill ${u.active ? "status-pill--active" : "status-pill--inactive"}`}
                      >
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="user-cell__date">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td>
                      {manageable && !isOwner && (
                        <div className="user-actions">
                          <button
                            className="user-actions__button"
                            onClick={() => askToToggleActive(u)}
                          >
                            {u.active ? "Deactivate" : "Reactivate"}
                          </button>
                          <button
                            className="user-actions__button user-actions__button--danger"
                            onClick={() => askToDelete(u)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* One shared confirm modal, reused for every action. The
            title/message/button text just change based on what
            pendingAction currently holds. */}
        <ConfirmModal
          open={pendingAction !== null}
          title={
            pendingAction?.type === "role"
              ? "Change this user's role?"
              : pendingAction?.type === "deactivate"
                ? "Deactivate this user?"
                : pendingAction?.type === "reactivate"
                  ? "Reactivate this user?"
                  : "Delete this user?"
          }
          message={
            pendingAction?.type === "role"
              ? `${pendingAction.user.username} will become ${ASSIGNABLE_ROLES.find((r) => r.role_id === pendingAction.newRoleId)?.label}.`
              : pendingAction?.type === "deactivate"
                ? `${pendingAction.user.username} will no longer be able to log in until reactivated.`
                : pendingAction?.type === "reactivate"
                  ? `${pendingAction.user.username} will be able to log in again.`
                  : `${pendingAction?.user.username} will be removed from the community. This can be reversed by a developer if needed, but not from this screen.`
          }
          confirmLabel={
            pendingAction?.type === "role"
              ? "Change Role"
              : pendingAction?.type === "deactivate"
                ? "Deactivate"
                : pendingAction?.type === "reactivate"
                  ? "Reactivate"
                  : "Delete"
          }
          danger={pendingAction?.type === "delete" || pendingAction?.type === "deactivate"}
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
        />

        <Toast toast={toast} />
    </div>
  );
}
