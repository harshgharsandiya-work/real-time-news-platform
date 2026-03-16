import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    Newspaper,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    Inbox,
} from "lucide-react";
import { useState } from "react";
import FCMManager from "../components/FCMManager";

export default function MainLayout() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const navLinks = [
        { name: "News Feed", path: "/", icon: <Newspaper size={18} /> },
        {
            name: "Subscriptions",
            path: "/subscriptions",
            icon: <Bell size={18} />,
        },
        { name: "Inbox", path: "/inbox", icon: <Inbox size={18} /> },
        {
            name: "Preferences",
            path: "/preferences",
            icon: <Settings size={18} />,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <FCMManager />
            <nav className="bg-indigo-600 border-b border-indigo-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="shrink-0 text-white font-bold text-xl tracking-wide flex items-center gap-2">
                                <Bell size={24} className="text-indigo-200" />
                                Real-Time News
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            to={link.path}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                location.pathname === link.path
                                                    ? "bg-indigo-800 text-white"
                                                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                                            }`}
                                        >
                                            {link.icon}
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-4 flex items-center md:ml-6 gap-4">
                                <span className="text-sm text-indigo-200">
                                    {user?.email}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white transition-colors"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        </div>
                        <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={() =>
                                    setIsMobileMenuOpen(!isMobileMenuOpen)
                                }
                                className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none"
                            >
                                {isMobileMenuOpen ? (
                                    <X size={24} />
                                ) : (
                                    <Menu size={24} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${
                                        location.pathname === link.path
                                            ? "bg-indigo-800 text-white"
                                            : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                                    }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ))}
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            <main className="flex-1 w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-4 sm:px-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
