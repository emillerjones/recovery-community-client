import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MarketingNav from "./MarketingNav";
import AuthPanel from "../auth/AuthPanel";
import MarketingFooter from "./MarketingFooter";

/**
 * Layout — wraps every marketing page.
 * Owns the auth panel state so it can slide in over any page.
 * Watches the URL on mount: if someone visits /login or /register
 * directly, the panel opens automatically.
 */
export default function MarketingLayout() {
  const location = useLocation();
  const [authMode, setAuthMode] = useState(null); // null | "login" | "register"

  // Open panel automatically for direct URL visits
  useEffect(() => {
    if (location.pathname === "/login") setAuthMode("login");
    else if (location.pathname === "/register") setAuthMode("register");
  }, []);

  function openLogin() {
    setAuthMode("login");
    window.history.replaceState(null, "", "/login");
  }

  function openRegister() {
    setAuthMode("register");
    window.history.replaceState(null, "", "/register");
  }

  function closePanel() {
    setAuthMode(null);
    window.history.replaceState(null, "", "/");
  }

  return (
    <>
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
            setAuthMode(m);
            window.history.replaceState(null, "", `/${m}`);
          }}
        />
      )}
    </>
  );
}
