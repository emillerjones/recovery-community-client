import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/icons/logo.png";
import "./MarketingNav.css";

const PUBLIC_LINKS = [
  { to: "/", label: "Home" },
  { to: "/Home2", label: "Home2" },
  { to: "/Home3", label: "Home3" },
  { to: "/Home4", label: "Home4" },
  { to: "/Home5", label: "Home5" },
  { to: "/About", label: "About" },
  { to: "/community", label: "Community" },
  { to: "/resources", label: "Resources" },
  { to: "/faq", label: "FAQ" },
];

export default function MarketingNav({ onLogin, onRegister }) {
  const { token, logout, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("mobile-nav-open", menuOpen);
    return () => document.body.classList.remove("mobile-nav-open");
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogin() {
    closeMenu();
    onLogin?.();
  }

  function handleRegister() {
    closeMenu();
    onRegister?.();
  }

  function handleLogout() {
    closeMenu();
    logout();
    window.location.href = "/";
  }

  const headerClass = [
    "site-header",
    "site-header--fade-in",
    scrolled || menuOpen ? "site-header--scrolled" : "",
    menuOpen ? "site-header--menu-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClass}>
      <NavLink to="/" className="site-logo" onClick={closeMenu}>
        <img src={logo} alt="Recovery With The Exit Drug" className="site-logo__mark" />
        <span className="site-logo__text">
          Recovery With<br />The Exit Drug
        </span>
      </NavLink>

      <nav className="main-nav" aria-label="Primary navigation">
        {PUBLIC_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} className="main-nav__link">
            {link.label}
          </NavLink>
        ))}
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
            <button className="nav-link-soft nav-action-login" onClick={handleLogin}>Log In</button>
            <button className="nav-button" onClick={handleRegister}>Join Community</button>
          </>
        )}

        <button
          className="mobile-menu-button"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className="mobile-nav-panel" aria-hidden={!menuOpen}>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {PUBLIC_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className="mobile-nav__link" onClick={closeMenu}>
              {link.label}
            </NavLink>
          ))}

          <div className="mobile-nav__actions">
            {token ? (
              <>
                <NavLink to="/profile" className="mobile-nav__link" onClick={closeMenu}>Profile</NavLink>
                {user?.role_id <= 99 && (
                  <NavLink to="/admin/users" className="mobile-nav__link" onClick={closeMenu}>Users</NavLink>
                )}
                <button className="mobile-nav__button" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <button className="mobile-nav__link mobile-nav__link-button" onClick={handleLogin}>Log In</button>
                <button className="mobile-nav__button" onClick={handleRegister}>Join Community</button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
