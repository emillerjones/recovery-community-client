import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/icons/logo.png";
import "./Navbar.css";

export default function Navbar() {
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

  return (
    <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
      <NavLink to="/" className="site-logo">
        <img src={logo} alt="Recovery With The Exit Drug" className="site-logo__mark" />
        <span className="site-logo__text">
          Recovery With<br />The Exit Drug
        </span>
      </NavLink>

      <nav className="main-nav">
        <NavLink to="/" className="main-nav__link">About</NavLink>
        <NavLink to="/stories" className="main-nav__link">Stories</NavLink>
        <NavLink to="/resources" className="main-nav__link">Resources</NavLink>
        <NavLink to="/events" className="main-nav__link">Events</NavLink>
        <NavLink to="/community" className="main-nav__link">Community</NavLink>
      </nav>

      <div className="site-header__actions">
        {token ? (
          <>
            <NavLink to="/profile" className="nav-link-soft">Profile</NavLink>
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
