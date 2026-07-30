import MarketingNav from "./MarketingNav";
import { Outlet } from "react-router-dom";
import LoungeDock from "../components/lounge/LoungeDock";

/** Layout for logged-in pages using the shared site navigation. */
export default function AppLayout() {
  return (
    <>
      <MarketingNav />
      <Outlet />
      <LoungeDock />
    </>
  );
}
