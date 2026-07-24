import { useEffect, useState } from "react";
import { MoreHorizontal, X } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import RoleBadge from "../../components/RoleBadge";
import ConfirmModal from "../../components/ConfirmModal";
import { Toast, useToast } from "../../components/Toast";
import MemberAvatar from "../../components/MemberAvatar";
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

export default function UserManagement() {
  const { token, user: currentUser } = useAuth();
  const { toast, showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");

  // Tracks which confirm modal (if any) is currently open, and which
  // user + action it's for. When this is null, no modal is showing.
  const [pendingAction, setPendingAction] = useState(null);
  const [mobileActionUser, setMobileActionUser] = useState(null);
  // Shape: { type: "role" | "deactivate" | "reactivate" | "delete", user, newRoleId? }

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Users could not be loaded.");
        return data;
      })
      .then((data) => { if (!cancelled) setUsers(data); })
      .catch((error) => { if (!cancelled) showToast(error.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, showToast]);

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
    const matchesSearch = (
      u.username?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
    const matchesFilter = memberFilter === "all"
      || (memberFilter === "active" && u.active)
      || (memberFilter === "inactive" && !u.active)
      || (memberFilter === "staff" && u.role_id <= 50)
      || (memberFilter === "members" && u.role_id === 100);
    return matchesSearch && matchesFilter;
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

  // ---------- Permanent test-account deletion ----------

  async function hardDeleteTestAccount(targetUser) {
    const confirmation = window.prompt(
      `Testing only: permanently delete ${targetUser.username} and its signup records?\n\nType the username exactly to continue.`
    );
    if (confirmation !== targetUser.username) {
      if (confirmation !== null) showToast("Username did not match. Nothing was deleted.");
      return;
    }

    const response = await fetch(`${API}/api/users/${targetUser.user_id}/hard`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await response.text();
    let result = {};
    try { result = text ? JSON.parse(text) : {}; } catch { result = { message: text }; }

    if (!response.ok) {
      showToast(result.message || "That test account could not be permanently deleted.");
      return;
    }

    setUsers((previous) => previous.filter((u) => u.user_id !== targetUser.user_id));
    showToast(`${targetUser.username} and its signup records were permanently deleted.`);
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

        {!loading && <div className="user-mobile-filters" aria-label="Filter members">
          {[{ key: "all", label: "All" }, { key: "active", label: "Active" }, { key: "inactive", label: "Inactive" }, { key: "staff", label: "Staff" }, { key: "members", label: "Members" }].map((filter) => <button type="button" key={filter.key} className={memberFilter === filter.key ? "is-selected" : ""} onClick={() => setMemberFilter(filter.key)}>{filter.label}</button>)}
        </div>}

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
                    <td className="user-card__identity">
                      <div className="user-cell">
                        <MemberAvatar className="user-cell__avatar" username={u.username} avatarUrl={u.avatar_url} size={38} />
                        <div className="user-cell__text">
                          <span className="user-cell__name">{u.username}</span>
                          <span className="user-cell__email">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="user-card__role" data-label="Role">
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

                    <td className="user-card__status">
                      <span
                        className={`status-pill ${u.active ? "status-pill--active" : "status-pill--inactive"}`}
                      >
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="user-cell__date" data-label="Joined">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="user-card__actions">
                      {manageable && !isOwner && (
                        <>
                        <div className="user-actions user-actions--desktop">
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
                          {currentUser.role_id === OWNER_ROLE_ID && u.role_id === 100 && (
                            <button
                              className="user-actions__button user-actions__button--hard-delete"
                              onClick={() => hardDeleteTestAccount(u)}
                              title="Testing only: permanently remove an unused signup"
                            >
                              Hard delete test
                            </button>
                          )}
                        </div>
                        <button type="button" className="user-actions__mobile-trigger" onClick={() => setMobileActionUser(u)}><MoreHorizontal size={18} /> Manage</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visibleUsers.length === 0 && <tr className="user-table__empty"><td colSpan="5">No members match this search and filter.</td></tr>}
            </tbody>
          </table>
        )}

        {/* MOBILE USER ACTIONS: destructive controls stay out of each card.
            Hard delete is intentionally absent from this mobile sheet. */}
        {mobileActionUser && (
          <div className="user-mobile-actions-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileActionUser(null); }}>
            <section className="user-mobile-actions" role="dialog" aria-modal="true" aria-labelledby="mobile-user-actions-title">
              <header><div><small>Manage member</small><h2 id="mobile-user-actions-title">{mobileActionUser.username}</h2></div><button type="button" onClick={() => setMobileActionUser(null)} aria-label="Close member actions"><X size={21} /></button></header>
              <button type="button" onClick={() => { const target = mobileActionUser; setMobileActionUser(null); askToToggleActive(target); }}>{mobileActionUser.active ? "Deactivate account" : "Reactivate account"}</button>
              <button type="button" className="is-danger" onClick={() => { const target = mobileActionUser; setMobileActionUser(null); askToDelete(target); }}>Delete account</button>
              <button type="button" className="is-cancel" onClick={() => setMobileActionUser(null)}>Cancel</button>
            </section>
          </div>
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
