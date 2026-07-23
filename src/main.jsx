import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { NotificationsProvider } from "./notifications/NotificationsContext";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </AuthProvider>
  </BrowserRouter>
);