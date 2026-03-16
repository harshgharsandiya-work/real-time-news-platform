import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { api, authHeaders } from "../lib/api";

export default function NotificationHistory() {
    const { jwtToken } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get("/notifications/history", {
                    headers: authHeaders(jwtToken),
                });
                setNotifications(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [jwtToken]);

    if (loading) return <div>Loading history...</div>;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "SENT":
                return <CheckCircle className="text-green-500" size={20} />;
            case "PENDING":
                return <Clock className="text-yellow-500" size={20} />;
            case "FAILED":
                return <XCircle className="text-red-500" size={20} />;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    Notification History
                </h2>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {notifications.map((notif) => (
                        <li
                            key={notif.id}
                            className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {getStatusIcon(notif.status)}
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            {notif.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 line-clamp-1">
                                            {notif.body}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 font-mono text-xs text-gray-400">
                                            <span className="bg-indigo-50 px-2 py-0.5 rounded text-indigo-700 font-semibold">
                                                {notif.target}
                                            </span>
                                            {notif.targetValue && (
                                                <span>{notif.targetValue}</span>
                                            )}
                                            {notif.sendBy && (
                                                <span>By {notif.sendBy}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                    <p>
                                        Created:{" "}
                                        {new Date(
                                            notif.createdAt,
                                        ).toLocaleString()}
                                    </p>
                                    {notif.scheduledFor && (
                                        <p>
                                            Scheduled:{" "}
                                            {new Date(
                                                notif.scheduledFor,
                                            ).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {notif.status === "FAILED" && (
                                <div className="mt-3 bg-red-50 p-3 rounded text-xs text-red-700 font-mono whitespace-pre-wrap">
                                    Notification delivery failed. Check backend
                                    logs for the provider error details.
                                </div>
                            )}
                        </li>
                    ))}
                    {notifications.length === 0 && (
                        <li className="p-6 text-center text-gray-500">
                            No notifications sent yet.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
