import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { MessagesProvider } from "./contexts/MessagesContext";
import { LoungeProvider } from "./contexts/LoungeContext";
import App from "./App.jsx";
import AnalyticsTracker from "./components/AnalyticsTracker";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <AnalyticsTracker />
      <NotificationsProvider>
        <MessagesProvider>
          <LoungeProvider>
            <App />
          </LoungeProvider>
        </MessagesProvider>
      </NotificationsProvider>
    </AuthProvider>
  </BrowserRouter>
);
