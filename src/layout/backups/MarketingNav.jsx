import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/icons/logo.png";
import "./MarketingNav.css";

/**
 * Nav bar for logged-out / marketing pages (Home, Home2, Stories, etc).
 * Transparent over a hero image, turns solid once the user scrolls.
 * Always fades in gently on load (no prop needed — it's just how
 * this nav behaves everywhere it's used).
 */
export default function MarketingNav() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
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
    navigate("/");
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
        
        <NavLink to="/about" className="main-nav__link">About</NavLink>
        {/* <NavLink to="/stories" className="main-nav__link">Stories</NavLink> */}
        <NavLink to="/resources" className="main-nav__link">Resources</NavLink>
        <NavLink to="/faq" className="main-nav__link">FAQ</NavLink>
        {/* <NavLink to="/community" className="main-nav__link">Community</NavLink> */}
      </nav>

      <div className="site-header__actions">
        {token ? (
          <>

            <NavLink to="/profile" className="nav-link-soft">Profile</NavLink>
            <NavLink to="admin/users" className="main-nav__link">Users</NavLink>
            <button className="nav-button" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="nav-link-soft">Log In</NavLink>
            <NavLink to="/register" className="nav-button">Join Community</NavLink>
          </>
        )}
      </div>
    </header>
  );
}
