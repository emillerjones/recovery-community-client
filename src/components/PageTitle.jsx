import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Recovery With The Exit Drug";
const PAGE_TITLES = {
  "/": "Cannabis-Inclusive Recovery Support",
  "/login": "Log In",
  "/register": "Join the Community",
  "/verify-email": "Verify Your Email",
  "/reset-password": "Reset Your Password",
  "/stories": "Recovery Stories",
  "/ourstory": "Our Story",
  "/community": "Inside the Community",
  "/guidelines": "Community Guidelines",
  "/contact": "Contact Us",
  "/discountlinks": "Discount Links",
  "/home-test": "Home - Test",
  "/resources": "Recovery Resources",
  "/donate": "Support the Community",
  "/faq": "Frequently Asked Questions",
  "/privacy": "Privacy Policy",
  "/welcome": "Welcome",
  "/today": "Today",
  "/forum": "Community Forum",
  "/messages": "Messages",
  "/profile": "Your Profile",
  "/admin/discount-editor": "Edit Discount Links",
  "/admin/guidelines-editor": "Edit Guidelines",
  "/admin/ourstory-editor": "Edit Our Story",
  "/admin/home-test-editor": "Edit Home - Test",
  "/admin/resources-editor": "Edit Resources",
  "/admin/faq-editor": "Edit FAQ",
  "/admin/stats": "Community Stats",
  "/admin/membership": "Admissions",
  "/admin/users": "Manage Users",
  "/admin/forum-flags": "Flagged Content",
};

export default function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.replace(/\/+$/, "") || "/";
    // Private titles never include post text, names, or message contents.
    const page = PAGE_TITLES[path]
      || (/^\/forum\/[^/]+$/.test(path) ? "Community Forum" : null)
      || (/^\/messages\/[^/]+$/.test(path) ? "Messages" : null);
    document.title = page ? `${page} | ${SITE_NAME}` : SITE_NAME;
  }, [pathname]);

  return null;
}
