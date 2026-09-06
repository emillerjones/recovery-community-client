import MarketingNav from "./MarketingNav";
import { Outlet, useLocation } from "react-router-dom";
import LoungeDock from "../components/lounge/LoungeDock";

/** Layout for logged-in pages using the shared site navigation. */
export default function AppLayout() {
  const { pathname } = useLocation();
  const hideLoungeDock = pathname === "/messages" || pathname.startsWith("/messages/");

  return (
    <>
      <MarketingNav />
      <Outlet />
      {!hideLoungeDock && <LoungeDock />}
    </>
  );
}
