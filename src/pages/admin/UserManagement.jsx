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
  const [memberFilter, setMemberFilter] = useState("active");

  // Tracks which confirm modal (if any) is currently open, and which
  // user + action it's for. When this is null, no modal is showing.
  const [pendingAction, setPendingAction] = useState(null);
  const [mobileActionUser, setMobileActionUser] = useState(null);
  // Shape: { type: "role" | "deactivate" | "reactivate", user, newRoleId? }

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

  // Filter first, then put owners first while preserving everyone else's order.
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
  }).sort((a, b) => Number(b.role_id === OWNER_ROLE_ID) - Number(a.role_id === OWNER_ROLE_ID));

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
        prev.map((u) => (u.user_id === updated.user_id ? { ...u, ...updated } : u))
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
        prev.map((u) => (u.user_id === updated.user_id ? { ...u, ...updated } : u))
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

  // Decides which confirm function to run based on pendingAction.type
  function handleConfirm() {
    if (!pendingAction) return;
    if (pendingAction.type === "role") return confirmRoleChange();
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

        {!loading && <div className="user-filters" aria-label="Filter members">
          {[{ key: "all", label: "All" }, { key: "active", label: "Active" }, { key: "inactive", label: "Inactive" }, { key: "staff", label: "Staff" }, { key: "members", label: "Members" }].map((filter) => <button type="button" key={filter.key} aria-pressed={memberFilter === filter.key} className={memberFilter === filter.key ? "is-selected" : ""} onClick={() => setMemberFilter(filter.key)}>{filter.label}</button>)}
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
                <th title="Most recent recorded login, page visit, or logout">Last activity</th>
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
                          aria-label={`Role for ${u.username}`}
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
                      {manageable && !isOwner && <button type="button" className="user-actions__mobile-trigger" onClick={() => setMobileActionUser(u)} aria-label={`Manage ${u.username}`}><MoreHorizontal size={19} /><span>Manage</span></button>}
                    </td>

                    <td className="user-cell__date" data-label="Joined">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="user-cell__activity" data-label="Last activity">
                      {u.last_activity_at && !Number.isNaN(new Date(u.last_activity_at).getTime()) ? (
                        <time dateTime={u.last_activity_at} title={new Date(u.last_activity_at).toLocaleString()}>
                          {new Date(u.last_activity_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          <span>{new Date(u.last_activity_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
                        </time>
                      ) : <span className="user-cell__activity-empty">Not recorded</span>}
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
                        </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visibleUsers.length === 0 && <tr className="user-table__empty"><td colSpan="6">No members match this search and filter.</td></tr>}
            </tbody>
          </table>
        )}

        {/* MOBILE USER ACTIONS: destructive controls stay out of each card. */}
        {mobileActionUser && (
          <div className="user-mobile-actions-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileActionUser(null); }}>
            <section className="user-mobile-actions" role="dialog" aria-modal="true" aria-labelledby="mobile-user-actions-title">
              <header><div><small>Manage member</small><h2 id="mobile-user-actions-title">{mobileActionUser.username}</h2></div><button type="button" onClick={() => setMobileActionUser(null)} aria-label="Close member actions"><X size={21} /></button></header>
              <button type="button" onClick={() => { const target = mobileActionUser; setMobileActionUser(null); askToToggleActive(target); }}>{mobileActionUser.active ? "Deactivate account" : "Reactivate account"}</button>
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
                : "Reactivate this user?"
          }
          message={
            pendingAction?.type === "role"
              ? `${pendingAction.user.username} will become ${ASSIGNABLE_ROLES.find((r) => r.role_id === pendingAction.newRoleId)?.label}.`
              : pendingAction?.type === "deactivate"
                ? `${pendingAction.user.username} will no longer be able to log in until reactivated.`
                : pendingAction ? `${pendingAction.user.username} will be able to log in again.` : ""
          }
          confirmLabel={
            pendingAction?.type === "role"
              ? "Change Role"
              : pendingAction?.type === "deactivate"
                ? "Deactivate"
                : "Reactivate"
          }
          danger={pendingAction?.type === "deactivate"}
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
        />

        <Toast toast={toast} />
    </div>
  );
}
