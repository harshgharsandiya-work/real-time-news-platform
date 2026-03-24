import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Users, MessageSquare, Newspaper, Send, History } from "lucide-react";
import { api, authHeaders } from "../lib/api";
import { useNavigate } from "react-router-dom";

interface Stats {
    usersCount: number;
    topicsCount: number;
    newsCount: number;
    pushSentCount: number;
}

export default function Dashboard() {
    const { jwtToken } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/admin/stats", {
                    headers: authHeaders(jwtToken),
                });
                setStats(res.data.data);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [jwtToken]);

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    const statCards = [
        {
            name: "Total Users",
            value: stats?.usersCount,
            icon: Users,
            color: "bg-blue-500",
            link: "/users",
        },
        {
            name: "Total Topics",
            value: stats?.topicsCount,
            icon: MessageSquare,
            color: "bg-green-500",
            link: "/topics",
        },
        {
            name: "News Articles",
            value: stats?.newsCount,
            icon: Newspaper,
            color: "bg-purple-500",
            link: "/news",
        },
        {
            name: "Pushes Sent",
            value: stats?.pushSentCount,
            icon: Send,
            color: "bg-indigo-500",
            link: "/send-push",
        },
        {
            name: "History",
            value: stats?.pushSentCount,
            icon: History,
            color: "bg-yellow-500",
            link: "/history",
        },
    ];

    return (
        <div>
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Overview
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.name}
                            className="bg-white rounded-xl shadow p-6 flex items-center cursor-pointer"
                            onClick={() => navigate(stat.link)}
                        >
                            <div
                                className={`${stat.color} p-4 rounded-lg text-white mr-4`}
                            >
                                <Icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    {stat.name}
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
