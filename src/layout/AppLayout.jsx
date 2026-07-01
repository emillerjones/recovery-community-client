import AppNav from "./AppNav";
import { Outlet } from "react-router-dom";

/**
 * Layout for logged-in app pages.
 * Same exact pattern as MarketingLayout — renders a nav, then
 * whatever page is currently active goes in <Outlet />.
 * The only difference is WHICH nav: AppNav instead of MarketingNav.
 */
export default function AppLayout() {
  return (
    <>
      <AppNav />
      <Outlet />
    </>
  );
}
