import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Community from "./pages/Community";
import DiscountLinks from "./pages/DiscountLinks";
import Guidelines from "./pages/Guidelines";
import Stories from "./pages/Stories";
import MyStory from "./pages/MyStory";
import Contact from "./pages/Contact";

import Login from "./pages/Login";
import Register from "./pages/Register";



import UserManagement from "./pages/admin/UserManagement";
import ForumFlags from "./pages/admin/ForumFlags";
import RequireRole from "./components/RequireRole";
import MarketingLayout from "./layout/MarketingLayout";
import AppLayout from "./layout/AppLayout";
import About from "./pages/About";
import Resources from "./pages/Resources";
import FAQ from "./pages/FAQ";
import Community2 from "./pages/Community2";
import FAQ2 from "./pages/FAQ2";
import DiscountLinks3 from "./pages/DiscountLinks3";
import Forum from "./pages/Forum";
import ForumThread from "./pages/ForumThread";
import Forum2 from "./pages/Forum2";
import ForumThread2 from "./pages/ForumThread2";
import RequireAuth from "./components/RequireAuth";




export default function App() {
  return (
    <Routes>
      {/* Marketing/logged-out routes — transparent hero nav */}
      <Route path="/" element={<MarketingLayout />}>
        <Route index element={<Home />} />
        <Route path="stories" element={<Stories />} />
        <Route path="mystory" element={<MyStory />} />
        <Route path="community" element={<Community />} />
        <Route path="guidelines" element={<Guidelines />} />
        <Route path="contact" element={<Contact />} />
        <Route path="discountlinks" element={<DiscountLinks />} />
        <Route path="about" element={<About />} />
        <Route path="resources" element={<Resources />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="community2" element={<Community2 />} />
        <Route path="faq2" element={<FAQ2 />} />
        <Route path="discountlinks3" element={<DiscountLinks3 />} />
        {/* <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} /> */}
      </Route>

      {/* App/logged-in routes — solid utility nav */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/:postId" element={<ForumThread />} />
        <Route path="/forum2" element={<Forum2 />} />
        <Route path="/forum2/:postId" element={<ForumThread2 />} />
        <Route
          path="/admin/users"
          element={
            <RequireRole maxRoleId={9}>
              <UserManagement />
            </RequireRole>
          }
        />
        <Route
          path="/admin/forum-flags"
          element={
            <RequireRole maxRoleId={50}>
              <ForumFlags />
            </RequireRole>
          }
        />
        {/* future: /community, /chat, /journal, /profile */}
      </Route>
    </Routes>
  );
}
