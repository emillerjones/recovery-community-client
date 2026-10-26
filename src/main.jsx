import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { MessagesProvider } from "./contexts/MessagesContext";
import { LoungeProvider } from "./contexts/LoungeContext";
import { StaffChatProvider } from "./contexts/StaffChatContext";
import App from "./App.jsx";
import AnalyticsTracker from "./components/AnalyticsTracker";
import PageTitle from "./components/PageTitle";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <PageTitle />
    <AuthProvider>
      <AnalyticsTracker />
      <NotificationsProvider>
        <MessagesProvider>
          <LoungeProvider>
            <StaffChatProvider><App /></StaffChatProvider>
          </LoungeProvider>
        </MessagesProvider>
      </NotificationsProvider>
    </AuthProvider>
  </BrowserRouter>
);
