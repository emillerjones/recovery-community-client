import MarketingNav from "./MarketingNav";
import { Outlet } from "react-router-dom";

/** Layout for logged-in pages using the shared site navigation. */
export default function AppLayout() {
  return (
    <>
      <MarketingNav />
      <Outlet />
    </>
  );
}
