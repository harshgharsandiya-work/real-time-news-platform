import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Check } from "lucide-react";
import { api, authHeaders } from "../lib/api";

export default function Subscriptions() {
    const { jwtToken } = useAuth();
    const [topics, setTopics] = useState<any[]>([]);
    const [userSubs, setUserSubs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTopicsAndSubs = async () => {
        try {
            const [topicsRes, profileRes] = await Promise.all([
                api.get("/topics", { headers: authHeaders(jwtToken) }),
                api.get("/auth/me", { headers: authHeaders(jwtToken) }),
            ]);
            setTopics(topicsRes.data.data);

            const subs = profileRes.data.data.user.topicSubscriptions.map(
                (s: any) => s.topicId,
            );
            setUserSubs(subs);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopicsAndSubs();
    }, [jwtToken]);

    const handleToggle = async (
        topicId: string,
        currentlySubscribed: boolean,
    ) => {
        try {
            if (currentlySubscribed) {
                await api.post(
                    "/users/unsubscribe",
                    { topicId },
                    {
                        headers: authHeaders(jwtToken),
                    },
                );
                setUserSubs((prev) => prev.filter((id) => id !== topicId));
            } else {
                await api.post(
                    "/users/subscribe",
                    { topicId },
                    {
                        headers: authHeaders(jwtToken),
                    },
                );
                setUserSubs((prev) => [...prev, topicId]);
            }
        } catch (err) {
            console.error("Failed to toggle subscription", err);
        }
    };

    if (loading)
        return (
            <div className="p-8 text-center text-gray-500">
                Loading topics...
            </div>
        );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Your Subscriptions
                </h1>
                <p className="mt-2 text-gray-600">
                    Choose the topics you care about to personalize your news
                    feed and push notifications.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <ul className="divide-y divide-gray-100">
                    {topics.map((topic) => {
                        const isSubscribed = userSubs.includes(topic.id);
                        return (
                            <li
                                key={topic.id}
                                className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {topic.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {topic.description || "No description."}
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        handleToggle(topic.id, isSubscribed)
                                    }
                                    className={`ml-4 shrink-0 flex items-center justify-center px-4 py-2 border rounded-full text-sm font-medium transition-colors ${
                                        isSubscribed
                                            ? "border-green-500 text-green-600 bg-green-50 hover:bg-green-100"
                                            : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                                    }`}
                                >
                                    {isSubscribed ? (
                                        <>
                                            <Check
                                                size={16}
                                                className="mr-1.5"
                                            />
                                            Subscribed
                                        </>
                                    ) : (
                                        "Subscribe"
                                    )}
                                </button>
                            </li>
                        );
                    })}
                    {topics.length === 0 && (
                        <li className="p-8 text-center text-gray-500">
                            No topics currently available to subscribe to.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
