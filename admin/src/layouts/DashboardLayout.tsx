import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    Newspaper,
    LogOut,
    Send,
    PanelRight,
} from "lucide-react";
import { useState } from "react";

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(
        () => window.innerWidth > 768,
    );

    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const toggleSidebar = () => {
        console.log(isSidebarOpen);
        setIsSidebarOpen((prev) => !prev);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside
                className={`w-64 bg-indigo-900 text-white flex flex-col ${isSidebarOpen ? "block" : "hidden"}`}
            >
                <div className="flex items-center justify-center p-6 border-b border-indigo-800 gap-12">
                    <h1 className="text-xl font-bold tracking-wider">
                        News Admin
                    </h1>
                    <PanelRight
                        size={24}
                        className="cursor-pointer hover:bg-gray-700 rounded-lg transition-colors"
                        onClick={toggleSidebar}
                    />
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 text-indigo-100 hover:bg-indigo-800 rounded-lg transition-colors"
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link
                        to="/users"
                        className="flex items-center gap-3 px-4 py-3 text-indigo-100 hover:bg-indigo-800 rounded-lg transition-colors"
                    >
                        <Users size={20} />
                        Users
                    </Link>
                    <Link
                        to="/topics"
                        className="flex items-center gap-3 px-4 py-3 text-indigo-100 hover:bg-indigo-800 rounded-lg transition-colors"
                    >
                        <MessageSquare size={20} />
                        Topics
                    </Link>
                    <Link
                        to="/news"
                        className="flex items-center gap-3 px-4 py-3 text-indigo-100 hover:bg-indigo-800 rounded-lg transition-colors"
                    >
                        <Newspaper size={20} />
                        News
                    </Link>
                    <Link
                        to="/send-push"
                        className="flex items-center gap-3 px-4 py-3 text-indigo-100 hover:bg-indigo-800 rounded-lg transition-colors"
                    >
                        <Send size={20} />
                        Send Push
                    </Link>
                    <Link
                        to="/history"
                        className="flex items-center gap-3 px-4 py-3 text-indigo-100 hover:bg-indigo-800 rounded-lg transition-colors"
                    >
                        <LayoutDashboard size={20} />
                        History
                    </Link>
                </nav>
                <div className="p-4 border-t border-indigo-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-indigo-100 hover:bg-indigo-800 rounded-lg transition-colors w-full text-left"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
                        {!isSidebarOpen && (
                            <PanelRight
                                size={24}
                                className="cursor-pointer hover:bg-gray-200 rounded-lg transition-colors text-gray-900"
                                onClick={toggleSidebar}
                            />
                        )}
                        <h2 className="text-xl font-semibold text-gray-800">
                            Admin Portal
                        </h2>
                    </div>
                </header>
                <div className="p-6 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
