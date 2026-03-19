import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import MainLayout from "./layouts/MainLayout";
import NewsFeed from "./pages/NewsFeed";
import Subscriptions from "./pages/Subscriptions";
import Preferences from "./pages/Preferences";
import NotificationInbox from "./pages/NotificationInbox";
import NewsDetail from "./pages/NewsDetail";
import SubmitArticle from "./pages/SubmitArticle";
import UserProfile from "./pages/UserProfile";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<NewsFeed />} />
                            <Route
                                path="/subscriptions"
                                element={<Subscriptions />}
                            />
                            <Route
                                path="/inbox"
                                element={<NotificationInbox />}
                            />
                            <Route
                                path="/preferences"
                                element={<Preferences />}
                            />
                            <Route path="/news/:id" element={<NewsDetail />} />
                            <Route
                                path="/submit-article"
                                element={<SubmitArticle />}
                            />
                            <Route path="/profile" element={<UserProfile />} />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
