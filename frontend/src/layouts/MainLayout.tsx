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
    User,
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
        {
            name: "Profile",
            path: "/profile",
            icon: <User size={18} />,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <FCMManager />

            {/* Navbar */}
            <nav className="bg-linear-to-r from-blue-600 to-purple-700 shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between relative">
                    {/* Logo */}
                    <a
                        aria-label="Homepage"
                        href="/"
                        className="flex items-center gap-2 text-white font-bold text-xl tracking-wide  hover:text-gray-100 shrink-0"
                    >
                        <Bell size={24} className="text-indigo-200" />
                        Real-Time News
                    </a>

                    {/* Desktop Nav Links */}
                    <div className="hidden lg:flex items-center space-x-2 grow justify-center">
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

                    {/* Desktop Right: User + Logout */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <Link to="/profile" className="text-indigo-100 text-sm">
                            {user?.email?.split("@")[0]}
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white transition-colors"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>

                    {/* Mobile Hamburger Toggle */}
                    <div className="lg:hidden">
                        <button
                            aria-label="Toggle navigation"
                            aria-expanded={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                            className="text-white hover:text-gray-200 focus:outline-none focus:text-gray-200 p-2"
                        >
                            {isMobileMenuOpen ? (
                                <X size={24} />
                            ) : (
                                <Menu size={24} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-indigo-800 px-4 py-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    location.pathname === link.path
                                        ? "bg-indigo-900 text-white"
                                        : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                                }`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}

                        <hr className="border-indigo-600 my-2" />

                        {/* Mobile User + Logout */}
                        <div className="flex items-center justify-between px-3 py-2">
                            <Link
                                to="/profile"
                                className="text-indigo-200 text-sm"
                            >
                                {user?.email?.split("@")[0]}
                            </Link>
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white transition-colors"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-4 sm:px-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
