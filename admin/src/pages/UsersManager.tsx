import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api, authHeaders } from "../lib/api";
import { Copy, Check } from "lucide-react";

export default function UsersManager() {
    const { jwtToken } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedUid, setCopiedUid] = useState<string | null>(null);
    const [updatingRole, setUpdatingRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get("/users", {
                    headers: authHeaders(jwtToken),
                });
                setUsers(res.data.data);
            } catch (err) {
                console.error("Failed to fetch users", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [jwtToken]);

    if (loading) return <div>Loading users...</div>;

    const copyUid = (uid: string) => {
        navigator.clipboard.writeText(uid).then(() => {
            setCopiedUid(uid);
            setTimeout(() => setCopiedUid(null), 2000);
        });
    };

    const changeRole = async (uid: string, role: string) => {
        setUpdatingRole(uid);
        try {
            await api.patch(
                `/users/${uid}/role`,
                { role },
                { headers: authHeaders(jwtToken) },
            );
            setUsers((prev) =>
                prev.map((u) => (u.uid === uid ? { ...u, role } : u)),
            );
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to update role.");
        } finally {
            setUpdatingRole(null);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                User Management
            </h2>
            <div className="space-y-3">
                {users.map((user) => (
                    <div
                        key={user.uid}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-gray-900">
                                        {user.name || "Unnamed User"}
                                    </h3>
                                    <span
                                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                            user.role === "ADMIN"
                                                ? "bg-red-100 text-red-700"
                                                : user.role === "EDITOR"
                                                  ? "bg-purple-100 text-purple-700"
                                                  : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {user.role}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {user.email}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <p className="text-xs text-gray-400 font-mono truncate max-w-xs">
                                        {user.uid}
                                    </p>
                                    <button
                                        onClick={() => copyUid(user.uid)}
                                        className="text-gray-300 hover:text-indigo-500 transition-colors shrink-0"
                                        title="Copy UID"
                                    >
                                        {copiedUid === user.uid ? (
                                            <Check
                                                size={13}
                                                className="text-green-500"
                                            />
                                        ) : (
                                            <Copy size={13} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                <div className="text-center">
                                    <p className="text-xs text-gray-400">
                                        Tokens
                                    </p>
                                    <p className="font-bold text-gray-800">
                                        {user.fcmTokens?.length || 0}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-400">
                                        Subscriptions
                                    </p>
                                    <p className="font-bold text-gray-800">
                                        {user.topicSubscriptions?.length || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">
                                        Role
                                    </p>
                                    <select
                                        value={user.role}
                                        onChange={(e) =>
                                            changeRole(user.uid, e.target.value)
                                        }
                                        disabled={updatingRole === user.uid}
                                        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50 bg-white"
                                    >
                                        <option value="USER">User</option>
                                        <option value="EDITOR">Editor</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {user.topicSubscriptions?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-50">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    Subscribed Topics
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {user.topicSubscriptions.map((sub: any) => (
                                        <span
                                            key={sub.id}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                                        >
                                            {sub.topic.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {users.length === 0 && (
                    <p className="text-center text-gray-400 py-16">
                        No users found.
                    </p>
                )}
            </div>
        </div>
    );
}
