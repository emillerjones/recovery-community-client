import { Navigate, Routes, Route } from "react-router-dom";
import Home from "./pages/marketing/Home";
import Community from "./pages/marketing/Community";
import DiscountLinks from "./pages/marketing/DiscountLinks";
import Guidelines from "./pages/marketing/Guidelines";
import Stories from "./pages/marketing/Stories";
import MyStory from "./pages/marketing/MyStory";
import Contact from "./pages/marketing/Contact";

import Register from "./pages/auth/Register";



import UserManagement from "./pages/admin/UserManagement";
import ForumFlags from "./pages/admin/ForumFlags";
import RequireRole from "./components/RequireRole";
import MarketingLayout from "./layout/MarketingLayout";
import AppLayout from "./layout/AppLayout";
import About from "./pages/marketing/About";
import Resources from "./pages/marketing/Resources";
import FAQ from "./pages/marketing/FAQ";
import Community2 from "./pages/marketing/Community2";
import DiscountLinks3 from "./pages/marketing/DiscountLinks3";
import Forum from "./pages/forum/Forum";
import ForumThread from "./pages/forumthread/ForumThread";
import Messages from "./pages/Messages";
import RequireAuth from "./components/RequireAuth";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ResetPassword from "./pages/auth/ResetPassword";
import MembershipAdmin from "./pages/admin/MembershipAdmin";
import Profile from "./pages/profile/Profile";
import AnalyticsAdmin from "./pages/admin/AnalyticsAdmin";




export default function App() {
  return (
    <Routes>
      {/* Registration is a full application, so it gets room to breathe instead
          of using the compact login drawer. All three signup flows use it. */}
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Marketing/logged-out routes — transparent hero nav */}
      <Route path="/" element={<MarketingLayout />}>
        <Route index element={<Home />} />
        {/* Direct /login visits show the homepage behind the login drawer. */}
        <Route path="login" element={<Home />} />
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
        <Route path="discountlinks3" element={<DiscountLinks3 />} />
      </Route>

      {/* App/logged-in routes — solid utility nav */}
      {/* Full-bleed, no site nav — this is a one-time ceremonial screen, not a
          normal app page. */}
      <Route
        path="/welcome"
        element={<RequireAuth><Navigate to="/forum?welcome=1" replace /></RequireAuth>}
      />

      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/:postId" element={<ForumThread />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:conversationId" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/admin/stats"
          element={
            <RequireRole maxRoleId={1}>
              <AnalyticsAdmin />
            </RequireRole>
          }
        />
        <Route
          path="/admin/membership"
          element={
            <RequireRole maxRoleId={10}>
              <MembershipAdmin />
            </RequireRole>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireRole maxRoleId={10}>
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
