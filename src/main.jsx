import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { MessagesProvider } from "./contexts/MessagesContext";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <NotificationsProvider>
        <MessagesProvider>
          <App />
        </MessagesProvider>
      </NotificationsProvider>
    </AuthProvider>
  </BrowserRouter>
);
