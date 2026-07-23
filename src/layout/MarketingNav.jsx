import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import NotificationBell from "../components/NotificationBell";
import logo from "../assets/icons/logo.png";
import "./MarketingNav.css";

const HOME_LINKS = [
  { to: "/", label: "Home" },
];

const COMMUNITY_LINKS = [
  { to: "/community", label: "Inside the Community" },
  { to: "/community2", label: "Inside the Community 2" },
  { to: "/guidelines", label: "Culture" },
  { to: "/stories", label: "Stories" },
];

const LEARN_LINKS = [
  { to: "/resources", label: "Resources" },
  { to: "/faq", label: "FAQ" },
  { to: "/faq2", label: "FAQ 2" },
];

const SUPPORT_LINKS = [
  { to: "/donate", label: "Donate - Inactive" },
  { to: "/merch", label: "Merch  - Inactive" },
  { to: "/discountlinks", label: "Discount" },
  { to: "/discountlinks3", label: "Discount 3 — Spatial Rail" },
];

const ABOUT_LINKS = [
  { to: "/about", label: "Our Mission" },
  { to: "/mystory", label: "My Story" },
  { to: "/contact", label: "Contact Us" },
];


const OTHER_LINKS = [
  { to: "/about", label: "Our Philosophy" },
  { to: "/mystory", label: "My Story" },
];



const ALL_LINKS = [...HOME_LINKS, ...COMMUNITY_LINKS, ...LEARN_LINKS, ...SUPPORT_LINKS, ...ABOUT_LINKS];

// Set to true to give the desktop and mobile navbar a solid background after scrolling.
const ENABLE_SOLID_NAV_ON_SCROLL = false;

function NavDropdown({ label, links, closeMenu }) {
  return (
    <div className="main-nav__dropdown">
      <button type="button" className="main-nav__link main-nav__link--trigger">
        {label}
        <svg className="main-nav__chevron" width="10" height="10" viewBox="0 0 10 10">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="main-nav__dropdown-panel">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className="main-nav__dropdown-link" onClick={closeMenu}>
            {link.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function MarketingNav({ onLogin, onRegister }) {
  const { token, logout, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navTextTheme, setNavTextTheme] = useState("light");
  const headerRef = useRef(null);
  const location = useLocation();

  /*
    Nav theme by page.

    transparent = white text, clear background
    solid       = dark text, cream/glass background

    Add more routes here later as you build pages.
  */
  const solidNavPages = [
    // "/about",
    // "/faq",
    "/donate",
    "/merch",
  ];

  const pageWantsSolidNav = solidNavPages.includes(location.pathname);


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

  useEffect(() => {
    let frameId;

    function updateNavTextTheme() {
      const header = headerRef.current;
      const sampleY = Math.min((header?.getBoundingClientRect().height || 72) / 2, window.innerHeight - 1);
      const sampleX = window.innerWidth / 2;
      const elementBehindNav = document
        .elementsFromPoint(sampleX, sampleY)
        .find((element) => !header?.contains(element));
      const themedSection = elementBehindNav?.closest?.("[data-nav-theme]");

      setNavTextTheme(themedSection?.dataset.navTheme === "light" ? "light" : "dark");
    }

    function queueThemeUpdate() {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateNavTextTheme);
    }

    queueThemeUpdate();
    window.addEventListener("scroll", queueThemeUpdate, { passive: true });
    window.addEventListener("resize", queueThemeUpdate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", queueThemeUpdate);
      window.removeEventListener("resize", queueThemeUpdate);
    };
  }, [location.pathname]);

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

    // Force solid nav on light-background pages.
    pageWantsSolidNav ? "site-header--solid" : "",

    menuOpen || pageWantsSolidNav
      ? "site-header--dark-text"
      : `site-header--${navTextTheme}-text`,

    // Keep both desktop and mobile transparent on scroll when the switch is off.
    (ENABLE_SOLID_NAV_ON_SCROLL && scrolled) || menuOpen
      ? "site-header--scrolled"
      : "",
    menuOpen ? "site-header--menu-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClass} ref={headerRef}>
      <NavLink to="/" className="site-logo" onClick={closeMenu}>
        <img src={logo} alt="Recovery With The Exit Drug" className="site-logo__mark" />
        <span className="site-logo__text">
          Recovery With<br />The Exit Drug
        </span>
      </NavLink>

      <nav className="main-nav" aria-label="Primary navigation">
        <NavDropdown label="Home" links={HOME_LINKS} closeMenu={closeMenu} />
        <NavDropdown label="Community" links={COMMUNITY_LINKS} closeMenu={closeMenu} />
        {token && <NavLink to="/forum" className="main-nav__link">Forum</NavLink>}
        {token && <NavLink to="/forum2" className="main-nav__link">Forum 2</NavLink>}
        <NavDropdown label="Learn" links={LEARN_LINKS} closeMenu={closeMenu} />
        <NavDropdown label="Support" links={SUPPORT_LINKS} closeMenu={closeMenu} />
        <NavDropdown label="About" links={ABOUT_LINKS} closeMenu={closeMenu} />
        {/* {OTHER_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} className="main-nav__link">
            {link.label}
          </NavLink>
        ))} */}
      </nav>

      <div className="site-header__actions">
        {token ? (
          <>
            <NotificationBell />
            <NavLink to="/profile" className="nav-link-soft">Profile</NavLink>
            {user?.role_id <= 99 && (
              <NavLink to="/admin/users" className="main-nav__link">Users</NavLink>
            )}
            {user?.role_id <= 50 && (
              <NavLink to="/admin/forum-flags" className="main-nav__link">Flagged</NavLink>
            )}
            <button className="nav-button" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <button className="nav-link-soft nav-action-login" onClick={handleLogin}>Log In</button>
            <button className="nav-button nav-action-register" onClick={handleRegister}>Join Community</button>
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
          {[
            { label: "Home", links: HOME_LINKS },
            { label: "Community", links: COMMUNITY_LINKS },
            { label: "Learn", links: LEARN_LINKS },
            { label: "Support", links: SUPPORT_LINKS },
            { label: "About", links: ABOUT_LINKS },
          ].map((group) => (
            <div key={group.label}>
              <span className="mobile-nav__group-label">{group.label}</span>
              {group.links.map((link) => (
                <NavLink key={link.to} to={link.to} className="mobile-nav__link" onClick={closeMenu}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}

          <div className="mobile-nav__actions">
            {token ? (
              <>
                <NavLink to="/forum" className="mobile-nav__link" onClick={closeMenu}>Forum</NavLink>
                <NavLink to="/forum2" className="mobile-nav__link" onClick={closeMenu}>Forum 2</NavLink>
                <NavLink to="/profile" className="mobile-nav__link" onClick={closeMenu}>Profile</NavLink>
                {user?.role_id <= 99 && (
                  <NavLink to="/admin/users" className="mobile-nav__link" onClick={closeMenu}>Users</NavLink>
                )}
                {user?.role_id <= 50 && (
                  <NavLink to="/admin/forum-flags" className="mobile-nav__link" onClick={closeMenu}>Flagged</NavLink>
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
