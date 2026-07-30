import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getAnalyticsSessionId } from "../utils/analytics";

const API = import.meta.env.VITE_API;

function pageKeyFor(pathname) {
  if (/^\/forum\/\d+$/.test(pathname)) return "forum_thread";
  if (/^\/messages(?:\/\d+)?$/.test(pathname)) return "messages";

  return {
    "/": "home",
    "/login": "login",
    "/register": "register",
    "/verify-email": "verify_email",
    "/stories": "stories",
    "/mystory": "stories",
    "/community": "community",
    "/community2": "community",
    "/guidelines": "guidelines",
    "/contact": "contact",
    "/discountlinks": "discount_links",
    "/discountlinks3": "discount_links",
    "/about": "about",
    "/resources": "resources",
    "/faq": "faq",
    "/faq2": "faq",
    "/forum": "forum",
    "/profile": "profile",
    "/admin/membership": "admin_membership",
    "/admin/users": "admin_users",
    "/admin/forum-flags": "admin_forum_flags",
    "/admin/stats": "admin_stats",
  }[pathname] || null;
}

export default function AnalyticsTracker() {
  const location = useLocation();
  const { token } = useAuth();
  const lastPath = useRef(null);

  useEffect(() => {
    const pageKey = pageKeyFor(location.pathname);
    if (!pageKey || lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;

    // PAGE VIEW TRACE: React Router tells us a named main page was reached.
    // The server attaches the user when logged in and derives device/location.
    fetch(`${API}/api/analytics/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        eventType: "page_view",
        pageKey,
        sessionId: getAnalyticsSessionId(),
      }),
      keepalive: true,
    }).catch(() => {});
  }, [location.pathname, token]);

  return null;
}
