import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { BellRing, CalendarDays } from "lucide-react";
import { api, authHeaders } from "../lib/api";

export default function NotificationInbox() {
    const { jwtToken } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchInbox = async () => {
            try {
                const res = await api.get("/notifications/inbox", {
                    headers: authHeaders(jwtToken),
                });
                setNotifications(res.data.data);
                setUnreadCount(
                    res.data.data.filter((n: any) => !n.isRead).length,
                );
            } catch (err) {
                console.error("Failed to load inbox", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInbox();
    }, [jwtToken]);

    const markAsRead = async (notificationId: string) => {
        try {
            await api.patch(
                `/notifications/read/${notificationId}`,
                {},
                { headers: authHeaders(jwtToken) },
            );
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, isRead: true } : n,
                ),
            );
            setUnreadCount((prev) => prev - 1);
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch(
                "/notifications/read/all",
                {},
                { headers: authHeaders(jwtToken) },
            );
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true })),
            );
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    if (loading)
        return (
            <div className="p-8 text-center text-gray-500">
                Loading inbox...
            </div>
        );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Notification Inbox
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Your recent alerts and messages.
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Mark All as Read ({unreadCount})
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <ul className="divide-y divide-gray-100">
                    {notifications.map((notif) => (
                        <li
                            key={notif.id}
                            className="p-6 hover:bg-gray-50 transition-colors flex gap-4"
                        >
                            <div className="shrink-0 mt-1">
                                <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                                    <BellRing size={20} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {notif.title}
                                    </h3>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <CalendarDays size={14} />
                                        {new Date(
                                            notif.createdAt,
                                        ).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                                <p className="text-gray-600 mt-1">
                                    {notif.body}
                                </p>
                                <div className="mt-3 flex gap-2">
                                    <span
                                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                            notif.target === "ALL"
                                                ? "bg-purple-100 text-purple-700"
                                                : notif.target === "TOPIC"
                                                  ? "bg-blue-100 text-blue-700"
                                                  : "bg-green-100 text-green-700"
                                        }`}
                                    >
                                        {notif.target === "ALL"
                                            ? "General Announcment"
                                            : notif.target === "TOPIC"
                                              ? "Topic Alert"
                                              : "Direct Message"}
                                    </span>
                                </div>
                            </div>
                        </li>
                    ))}
                    {notifications.length === 0 && (
                        <li className="p-12 text-center flex flex-col items-center justify-center">
                            <BellRing
                                className="text-gray-300 mb-4"
                                size={48}
                            />
                            <p className="text-gray-500 font-medium">
                                You're all caught up!
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                No recent notifications.
                            </p>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
