import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/**
 * Wraps a page and only renders it if the logged-in user's role_id
 * is allowed in. Otherwise, redirects them away.
 *
 * Usage in App.jsx:
 *   <Route
 *     path="admin/users"
 *     element={
 *       <RequireRole maxRoleId={1}>
 *         <UserManagement />
 *       </RequireRole>
 *     }
 *   />
 *
 * maxRoleId is the HIGHEST role_id number allowed through — since
 * lower role_id = higher authority, "maxRoleId={1}" means only the
 * owner (role_id 1) gets in. "maxRoleId={10}" would let both Owners
 * and Administrators through, etc.
 */
export default function RequireRole({ maxRoleId, children }) {
  const { user } = useAuth();

  // Not logged in at all, or doesn't meet the required role
  if (!user || user.role_id > maxRoleId) {
    return <Navigate to="/" replace />;
  }

  return children;
}
