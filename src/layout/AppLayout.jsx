import MarketingNav from "./MarketingNav";
import { Outlet, useLocation } from "react-router-dom";
import LoungeDock from "../components/lounge/LoungeDock";

/** Layout for logged-in pages using the shared site navigation. */
export default function AppLayout() {
  const { pathname } = useLocation();
  const hideLoungeDock = pathname === "/messages" || pathname.startsWith("/messages/");
  const isForumThread = /^\/forum\/[^/]+\/?$/.test(pathname);

  return (
    <>
      <MarketingNav />
      <Outlet />
      {!hideLoungeDock && <LoungeDock hideMobileLauncher={isForumThread} />}
    </>
  );
}
