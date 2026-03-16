import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import UsersManager from "./pages/UsersManager";
import TopicsManager from "./pages/TopicsManager";
import NewsManager from "./pages/NewsManager";
import NotificationSender from "./pages/NotificationSender";
import NotificationHistory from "./pages/NotificationHistory";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<UsersManager />} />
              <Route path="/topics" element={<TopicsManager />} />
              <Route path="/news" element={<NewsManager />} />
              <Route path="/send-push" element={<NotificationSender />} />
              <Route path="/history" element={<NotificationHistory />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
