import MarketingNav from "./MarketingNav";
import { Outlet, useLocation } from "react-router-dom";
import LoungeDock from "../components/lounge/LoungeDock";
import useVisibleActionBar from "../hooks/useVisibleActionBar";

/** Layout for logged-in pages using the shared site navigation. */
export default function AppLayout() {
  const { pathname } = useLocation();
  const hideLoungeDock = pathname === "/messages" || pathname.startsWith("/messages/");
  const hideMobileLaunchers = useVisibleActionBar();

  return (
    <>
      <MarketingNav />
      <Outlet />
      {!hideLoungeDock && <LoungeDock hideMobileLauncher={hideMobileLaunchers} />}
    </>
  );
}
