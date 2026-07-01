import { useEffect, useState, user  } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/icons/logo.png";
import "./MarketingNav.css";

/**
 * MarketingNav — now accepts onLogin / onRegister props so clicking
 * those actions opens the slide-in panel instead of navigating away.
 * If the user is already logged in, shows Profile / Users / Log out
 * as before (no panel needed).
 */
export default function MarketingNav({ onLogin, onRegister }) {
  const { token, logout, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    logout();
    window.location.href = "/";
  }

  const headerClass = [
    "site-header",
    "site-header--fade-in",
    scrolled ? "site-header--scrolled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClass}>
      <NavLink to="/" className="site-logo">
        <img src={logo} alt="Recovery With The Exit Drug" className="site-logo__mark" />
        <span className="site-logo__text">
          Recovery With<br />The Exit Drug
        </span>
      </NavLink>

      <nav className="main-nav">
        <NavLink to="/" className="main-nav__link">Home1</NavLink>
        <NavLink to="/Home2" className="main-nav__link">Home2</NavLink>
        <NavLink to="/Home3" className="main-nav__link">Home3</NavLink>
        <NavLink to="/Home4" className="main-nav__link">Home4</NavLink>
        <NavLink to="/home5" className="main-nav__link">Home5</NavLink>

        <NavLink to="/about" className="main-nav__link">About</NavLink>
        <NavLink to="/community" className="main-nav__link">Community</NavLink>
        <NavLink to="/resources" className="main-nav__link">Resources</NavLink>
        <NavLink to="/faq" className="main-nav__link">FAQ</NavLink>
      </nav>

      <div className="site-header__actions">
        {token ? (
          <>
            <NavLink to="/profile" className="nav-link-soft">Profile</NavLink>
            {user?.role_id <= 99 && (
              <NavLink to="/admin/users" className="main-nav__link">Users</NavLink>
            )}
            <button className="nav-button" onClick={handleLogout}>Log out</button>
          </>
          
        ) : (
          <>
            {/* Use buttons instead of NavLinks — no navigation, panel opens */}
            <button className="nav-link-soft" onClick={onLogin}>Log In</button>
            <button className="nav-button" onClick={onRegister}>Join Community</button>
          </>
        )}
      </div>
    </header>
  );
}
