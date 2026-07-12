import { Routes, Route } from "react-router-dom";
import Home1 from "./pages/Home";
import Home2 from "./pages/Home2";
import Home3 from "./pages/Home3";
import Home4 from "./pages/Home4";
import Home5 from "./pages/Home5";
import Home6 from "./pages/Home6";
import Home7 from "./pages/Home7";
import Home8 from "./pages/Home8";
import Home9 from "./pages/Home9";
import Home10 from "./pages/Home10";
import Home11 from "./pages/Home11";
import Home12 from "./pages/Home12";
import Community from "./pages/Community";
import CommunityHome from "./pages/CommunityHome";
import DiscountLinks from "./pages/DiscountLinks";
import Guidelines from "./pages/Guidelines";
import Stories from "./pages/Stories";
import Stories3 from "./pages/Stories3";
import Stories4 from "./pages/Stories4";
import Stories5 from "./pages/Stories5";
import Stories6 from "./pages/Stories6";
import Stories9 from "./pages/Stories9";
import Stories10 from "./pages/Stories10";
import MyStory from "./pages/MyStory";
import Contact from "./pages/Contact";

import Login from "./pages/Login";
import Register from "./pages/Register";



import UserManagement from "./pages/admin/UserManagement";
import RequireRole from "./components/RequireRole";
import MarketingLayout from "./layout/MarketingLayout";
import AppLayout from "./layout/AppLayout";
import About from "./pages/About";
import Resources from "./pages/Resources";
import FAQ from "./pages/FAQ";




export default function App() {
  return (
    <Routes>
      {/* Marketing/logged-out routes — transparent hero nav */}
      <Route path="/" element={<MarketingLayout />}>
        <Route index element={<Home5 />} />
        <Route path="home1" element={<Home1 />} />
        <Route path="home2" element={<Home2 />} />
        <Route path="home3" element={<Home3 />} />
        <Route path="home4" element={<Home4 />} />
        <Route path="home5" element={<Home5 />} />
        <Route path="home6" element={<Home6 />} />
        <Route path="home7" element={<Home7 />} />
        <Route path="home8" element={<Home8 />} />
        <Route path="home9" element={<Home9 />} />
        <Route path="home10" element={<Home10 />} />
        <Route path="home11" element={<Home11 />} />
        <Route path="home12" element={<Home12 />} />
        <Route path="stories" element={<Stories />} />
        <Route path="stories3" element={<Stories3 />} />
        <Route path="stories4" element={<Stories4 />} />
        <Route path="stories5" element={<Stories5 />} />
        <Route path="stories6" element={<Stories6 />} />
        <Route path="stories9" element={<Stories9 />} />
        <Route path="stories10" element={<Stories10 />} />
        <Route path="mystory" element={<MyStory />} />
        <Route path="community" element={<Community />} />
        <Route path="guidelines" element={<Guidelines />} />
        <Route path="contact" element={<Contact />} />
        <Route path="communityhome" element={<CommunityHome />} />
        <Route path="discountlinks" element={<DiscountLinks />} />
        <Route path="about" element={<About />} />
        <Route path="resources" element={<Resources />} />
        <Route path="faq" element={<FAQ />} />
        {/* <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} /> */}
      </Route>

      {/* App/logged-in routes — solid utility nav */}
      <Route element={<AppLayout />}>
        <Route
          path="/admin/users"
          element={
            <RequireRole maxRoleId={9}>
              <UserManagement />
            </RequireRole>
          }
        />
        {/* future: /community, /chat, /journal, /profile */}
      </Route>
    </Routes>
  );
}
