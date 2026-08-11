import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BadgePercent, BarChart3, BookHeart, BookOpen, ChevronRight, CircleHelp, Flag, Flame, Heart, HeartHandshake, LayoutGrid, LogOut, Mail, MessageCircle, ScrollText, ShieldCheck, ShoppingBag, UserCheck, UsersRound } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import NotificationBell from "../components/NotificationBell";
import MessagesBell from "../components/MessagesBell";
import MemberAvatar from "../components/MemberAvatar";
import { useLounge } from "../contexts/LoungeContext";
import { getLoungeActivity } from "../utils/loungeActivity";
import logo from "../assets/icons/logo.png";
import "./MarketingNav.css";

const HOME_LINKS = [
  { to: "/", label: "Home" },
];

const COMMUNITY_LINKS = [
  { to: "/community", label: "Inside the Community", description: "Meet the mission and member space", icon: UsersRound },
  { to: "/guidelines", label: "Guidelines", description: "Shared values and community guidelines", icon: ScrollText },
  { to: "/stories", label: "Stories", description: "Member experiences and recovery stories", icon: BookHeart },
];

const LEARN_LINKS = [
  { to: "/resources", label: "Resources", description: "Practical recovery information", icon: BookOpen },
  { to: "/faq", label: "FAQ", description: "Answers to common questions", icon: CircleHelp },
  { to: "/privacy", label: "Privacy", description: "How we handle and protect your information", icon: ShieldCheck },
];

const SUPPORT_LINKS = [
  { to: "/donate", label: "Donate - Inactive", description: "Future community giving", icon: Heart },
  { to: "https://www.etsy.com/shop/TheExitDrugRecovery", label: "Merch", description: "Shop Recovery With The Exit Drug merchandise", icon: ShoppingBag, external: true },
  { to: "/discountlinks", label: "Discount", description: "Community partner savings", icon: BadgePercent },
];

const ABOUT_LINKS = [
  { to: "/about", label: "Our Mission", description: "Why this community exists", icon: HeartHandshake },
  { to: "/mystory", label: "My Story", description: "Lainie Ruth's personal journey", icon: BookHeart },
  { to: "/contact", label: "Contact Us", description: "Reach the organization", icon: Mail },
];


const OTHER_LINKS = [
  { to: "/about", label: "Our Philosophy" },
  { to: "/mystory", label: "My Story" },
];



const ALL_LINKS = [...HOME_LINKS, ...COMMUNITY_LINKS, ...LEARN_LINKS, ...SUPPORT_LINKS, ...ABOUT_LINKS];

const ROLE_LABELS = {
  1: "Owner",
  10: "Administrator",
  50: "Moderator",
  100: "Member",
};

const ADMIN_LINKS = [
  { to: "/admin/stats", label: "Stats", description: "Private community activity", icon: BarChart3, ownerOnly: true },
  { to: "/admin/users", label: "Users", description: "Roles and member accounts", icon: UsersRound },
  { to: "/admin/membership", label: "Admissions", description: "Applications and invite codes", icon: UserCheck },
  { to: "/admin/forum-flags", label: "Flagged", description: "Review reported forum content", icon: Flag },
];

const MOBILE_EXPLORE_GROUPS = [
  { label: "Community", links: COMMUNITY_LINKS },
  { label: "Learn", links: LEARN_LINKS },
  { label: "Support", links: SUPPORT_LINKS },
  { label: "About", links: ABOUT_LINKS },
];

const MEMBER_MORE_GROUPS = [
  { label: "Community", links: COMMUNITY_LINKS },
  { label: "Help and information", links: [...LEARN_LINKS.filter((link) => link.to !== "/resources"), ABOUT_LINKS.find((link) => link.to === "/contact")] },
  { label: "Support the mission", links: SUPPORT_LINKS },
  { label: "About", links: ABOUT_LINKS.filter((link) => link.to !== "/contact") },
];

// Set to true to give the desktop and mobile navbar a solid background after scrolling.
const ENABLE_SOLID_NAV_ON_SCROLL = false;

function NavigationLink({ link, children, ...props }) {
  if (link.external) {
    return <a href={link.to} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
  }

  return <NavLink to={link.to} {...props}>{children}</NavLink>;
}

function NavDropdown({ label, links, closeMenu, align = "left", icon: TriggerIcon }) {
  return (
    <div className={`main-nav__dropdown ${align === "right" ? "main-nav__dropdown--right" : ""}`}>
      <button type="button" className={`main-nav__link main-nav__link--trigger ${TriggerIcon ? "main-nav__link--icon-trigger" : ""}`} aria-haspopup="true">
        {TriggerIcon && <TriggerIcon size={16} />}
        {label}
        <svg className="main-nav__chevron" width="10" height="10" viewBox="0 0 10 10">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="main-nav__dropdown-panel">
        {links.map((link) => (
          <NavigationLink key={link.to} link={link} className={`main-nav__dropdown-link ${link.icon ? "main-nav__dropdown-link--rich" : ""}`} onClick={closeMenu}>
            {link.icon && <link.icon size={17} />}
            <span><strong>{link.label}</strong>{link.description && <small>{link.description}</small>}</span>
          </NavigationLink>
        ))}
      </div>
    </div>
  );
}

function MemberMoreDropdown({ closeMenu }) {
  return (
    <div className="main-nav__dropdown member-more">
      <button type="button" className="main-nav__link main-nav__link--trigger" aria-haspopup="true">
        More
        <svg className="main-nav__chevron" width="10" height="10" viewBox="0 0 10 10"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <div className="main-nav__dropdown-panel member-more__panel">
        {MEMBER_MORE_GROUPS.map((group) => (
          <section key={group.label} className="member-more__group">
            <span className="member-more__heading">{group.label}</span>
            {group.links.map((link) => {
              const Icon = link.icon;
              return <NavigationLink key={link.to} link={link} className="member-more__link" onClick={closeMenu}>
                <Icon size={17} />
                <span><strong>{link.label}</strong><small>{link.description}</small></span>
              </NavigationLink>;
            })}
          </section>
        ))}
      </div>
    </div>
  );
}

export default function MarketingNav({ onLogin, onRegister }) {
  const { token, logout, user } = useAuth();
  const { status: loungeStatus, openLounge } = useLounge();
  const loungeActivity = getLoungeActivity(loungeStatus);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [navTextTheme, setNavTextTheme] = useState("light");
  const headerRef = useRef(null);
  const location = useLocation();
  const visibleAdminLinks = ADMIN_LINKS.filter((link) => !link.ownerOnly || user?.role_id === 1);
  const loungeAvailable = ["/today", "/forum", "/messages", "/profile", "/admin"].some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`),
  );

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
    setMobileExpanded(null);
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
        {token ? (
          <>
            <NavLink to="/today" className="main-nav__link main-nav__link--forum">Today</NavLink>
            <NavLink to="/forum" className="main-nav__link main-nav__link--forum">Forum</NavLink>
            <NavLink to="/resources" className="main-nav__link">Resources</NavLink>
            <MemberMoreDropdown closeMenu={closeMenu} />
          </>
        ) : (
          <>
            <NavDropdown label="Community" links={COMMUNITY_LINKS} closeMenu={closeMenu} />
            <NavDropdown label="Learn" links={LEARN_LINKS} closeMenu={closeMenu} />
            <NavDropdown label="Support" links={SUPPORT_LINKS} closeMenu={closeMenu} />
            <NavDropdown label="About" links={ABOUT_LINKS} closeMenu={closeMenu} />
          </>
        )}
        {/* {OTHER_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} className="main-nav__link">
            {link.label}
          </NavLink>
        ))} */}
      </nav>

      <div className="site-header__actions">
        {token ? (
          <>
            {loungeAvailable && (
              <button type="button" className={`nav-online lounge-activity--${loungeActivity.level}`} onClick={openLounge}>
                <Flame size={14} /> {loungeActivity.shortLabel}
              </button>
            )}
            {user?.role_id <= 10 && (
              <NavDropdown label="Admin" links={visibleAdminLinks} closeMenu={closeMenu} align="right" icon={ShieldCheck} />
            )}
            <MessagesBell />
            <NotificationBell />
            <div className="nav-account main-nav__dropdown main-nav__dropdown--right">
              <button type="button" className="nav-account__trigger" aria-haspopup="true" aria-label={`Account menu for ${user?.username}`}>
                <MemberAvatar className="nav-identity__avatar" username={user?.username} avatarUrl={user?.avatar_url} size={34} />
                <span>{user?.username}</span>
                <ChevronRight size={14} className="nav-account__chevron" />
              </button>
              <div className="nav-account__panel main-nav__dropdown-panel">
                <div className="nav-account__summary"><strong>{user?.username}</strong><small>{ROLE_LABELS[user?.role_id] || "Member"}</small></div>
                <NavLink to="/profile" onClick={closeMenu}>My profile</NavLink>
                <button type="button" onClick={handleLogout}><LogOut size={15} /> Log out</button>
              </div>
            </div>
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
          {token ? (
            <>
              <NavLink to="/profile" className="mobile-nav__identity" onClick={closeMenu} aria-label={`Signed in as ${user?.username}; open profile`}>
                <MemberAvatar className="nav-identity__avatar" username={user?.username} avatarUrl={user?.avatar_url} size={48} />
                <span className="mobile-nav__identity-copy"><small>My profile</small><strong>{user?.username}</strong><em>{ROLE_LABELS[user?.role_id] || "Member"}</em></span>
                <ChevronRight size={19} className="mobile-nav__identity-arrow" aria-hidden="true" />
              </NavLink>

              <div className="mobile-nav__member-shortcuts">
                <NavLink to="/today" className="mobile-nav__member-home" onClick={closeMenu}><Flame size={21} /><strong>Today</strong><small>Your community home</small></NavLink>
                <NavLink to="/forum" onClick={closeMenu}><LayoutGrid size={21} /><strong>Forum</strong><small>Community posts</small></NavLink>
                <NavLink to="/messages" className="mobile-nav__member-messages" onClick={closeMenu}><MessageCircle size={21} /><strong>Messages</strong><small>Private conversations</small></NavLink>
              </div>

              {loungeAvailable && (
                <button type="button" className={`mobile-nav__lounge lounge-activity--${loungeActivity.level}`} onClick={() => {
                  closeMenu();
                  openLounge();
                }}>
                  <span><Flame size={13} /> {loungeActivity.label}</span>
                  <strong>Open Community Lounge</strong>
                  <ChevronRight size={18} />
                </button>
              )}

              {user?.role_id <= 10 && (
                <section className={`mobile-nav__admin ${mobileExpanded === "Admin" ? "is-open" : ""}`}>
                  <button type="button" className="mobile-nav__section-trigger" onClick={() => setMobileExpanded((current) => current === "Admin" ? null : "Admin")} aria-expanded={mobileExpanded === "Admin"}>
                    <span className="mobile-nav__section-icon"><ShieldCheck size={20} /></span>
                    <span><strong>Admin tools</strong><small>Users, admissions, and flagged content</small></span>
                    <ChevronRight size={18} />
                  </button>
                  {mobileExpanded === "Admin" && <div className="mobile-nav__section-links">{visibleAdminLinks.map((link) => <NavLink key={link.to} to={link.to} onClick={closeMenu}>{link.label}<ChevronRight size={16} /></NavLink>)}</div>}
                </section>
              )}
            </>
          ) : (
            <div className="mobile-nav__guest-actions"><button onClick={handleLogin}>Log In</button><button onClick={handleRegister}>Join Community</button></div>
          )}

          <section className="mobile-nav__explore" aria-label="Explore the website">
            <span className="mobile-nav__eyebrow">Explore the website</span>
            <NavLink to="/" className="mobile-nav__explore-home" onClick={closeMenu}>Home<ChevronRight size={18} /></NavLink>
            {MOBILE_EXPLORE_GROUPS.map((group) => {
              const isOpen = mobileExpanded === group.label;
              return <div className={`mobile-nav__explore-group ${isOpen ? "is-open" : ""}`} key={group.label}>
                <button type="button" onClick={() => setMobileExpanded((current) => current === group.label ? null : group.label)} aria-expanded={isOpen}>{group.label}<ChevronRight size={18} /></button>
                {isOpen && <div>{group.links.map((link) => <NavigationLink key={link.to} link={link} onClick={closeMenu}>{link.label}</NavigationLink>)}</div>}
              </div>;
            })}
          </section>

          {token && <button className="mobile-nav__logout" onClick={handleLogout}><LogOut size={16} /> Log out</button>}
        </nav>
      </div>

    </header>
  );
}
