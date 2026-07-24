import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import MarketingNav from "./MarketingNav";
import AuthPanel from "../auth/AuthPanel";
import MarketingFooter from "./MarketingFooter";
import ScrollToTop from "./ScrollToTop";

/**
 * Layout — wraps every marketing page.
 * Owns the auth panel state so it can slide in over any page.
 * Watches the URL on mount: if someone visits /login or /register
 * directly, the panel opens automatically.
 */
export default function MarketingLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState(() => {
    if (location.pathname === "/login") return "login";
    if (location.pathname === "/register") return "register";
    return null;
  }); // null | "login" | "register"

  function openLogin() {
    setAuthMode("login");
    window.history.replaceState(null, "", "/login");
  }

  function openRegister() {
    // Registration now includes application questions and agreements, so it
    // uses a dedicated mobile-friendly page instead of the small login drawer.
    setAuthMode(null);
    navigate("/register");
  }

  function closePanel() {
    setAuthMode(null);
    window.history.replaceState(null, "", "/");
  }

  return (
    <>
      <ScrollToTop /> 
      <MarketingNav onLogin={openLogin} onRegister={openRegister} />

      {/* Page content — blurs slightly when panel is open */}
      <div className={authMode ? "layout-blurred" : ""}>
        <Outlet context={{ onRegister: openRegister, onLogin: openLogin }} />
        <MarketingFooter />
      </div>

      {/* Slide-in auth panel */}
      {authMode && (
        <AuthPanel
          mode={authMode}
          onClose={closePanel}
          onSwitchMode={(m) => {
            if (m === "register") {
              setAuthMode(null);
              navigate("/register");
            } else {
              setAuthMode(m);
              window.history.replaceState(null, "", `/${m}`);
            }
          }}
        />
      )}
    </>
  );
}
