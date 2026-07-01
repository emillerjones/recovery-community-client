import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/icons/logo.png";
import "./AppNav.css";

/**
 * Nav bar for logged-in app pages (User Management, and later
 * Community, Chat, Journal, Profile, etc).
 *
 * Unlike MarketingNav, this one is ALWAYS solid — no transparency,
 * no scroll detection, no fade-in. That's intentional: these pages
 * don't have a hero photo behind them, so there's nothing for a
 * transparent nav to sit on top of.
 */
export default function AppNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="app-nav">
      <NavLink to="/" className="app-nav__logo">
        <img src={logo} alt="Recovery With The Exit Drug" className="app-nav__logo-mark" />
      </NavLink>

      <nav className="app-nav__links">
        <NavLink to="/admin/users" className="app-nav__link">Users</NavLink>
        {/* future: /community, /chat, /journal */}
      </nav>

      <div className="app-nav__actions">
        <NavLink to="/profile" className="app-nav__link">Profile</NavLink>
        <button className="app-nav__logout" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
