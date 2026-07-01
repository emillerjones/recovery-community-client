// import Navbar from "./Navbar";
import MarketingNav from "./MarketingNav";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <MarketingNav />
      <Outlet />
    </>
  );
}

