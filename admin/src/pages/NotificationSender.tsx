import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api, authHeaders } from "../lib/api";

export default function NotificationSender() {
    const { jwtToken } = useAuth();

    const [target, setTarget] = useState("ALL");
    const [targetValue, setTargetValue] = useState("");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledFor, setScheduledFor] = useState("");

    const [topics, setTopics] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [status, setStatus] = useState({
        loading: false,
        error: "",
        success: "",
    });

    useEffect(() => {
        if (target === "USER") {
            api.get("/users", { headers: authHeaders(jwtToken) })
                .then((res) => setUsers(res.data.data))
                .catch((err) => console.error(err));
        }
    }, [target, jwtToken]);
    useEffect(() => {
        if (target === "TOPIC") {
            api.get("/topics", {
                headers: authHeaders(jwtToken),
            })
                .then((res) => setTopics(res.data.data))
                .catch((err) => console.error(err));
        }
    }, [target, jwtToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ loading: true, error: "", success: "" });

        try {
            const payload: any = {
                target,
                title,
                body,
            };

            if (target === "USER" || target === "TOPIC") {
                if (!targetValue)
                    throw new Error(
                        `Target value is required for target ${target}`,
                    );
                payload.targetValue = targetValue;
            }

            let endpoint = "/notifications/send";

            if (isScheduled) {
                if (!scheduledFor) throw new Error("Schedule Time is required");
                payload.scheduledFor = new Date(scheduledFor).toISOString();
                endpoint = "/notifications/schedule";
            }

            await api.post(endpoint, payload, {
                headers: authHeaders(jwtToken),
            });

            setStatus({
                loading: false,
                error: "",
                success: "Notification dispatched successfully!",
            });

            // Reset form
            setTitle("");
            setBody("");
            setIsScheduled(false);
            setScheduledFor("");
            setTargetValue("");
        } catch (err: any) {
            setStatus({
                loading: false,
                error: err.response?.data?.message || err.message,
                success: "",
            });
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Send Push Notification
            </h2>

            <div className="bg-white p-6 rounded-xl shadow">
                {status.error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
                        {status.error}
                    </div>
                )}
                {status.success && (
                    <div className="mb-4 p-3 bg-green-50 text-green-700 rounded border border-green-200">
                        {status.success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Target Type
                            </label>
                            <select
                                value={target}
                                onChange={(e) => {
                                    setTarget(e.target.value);
                                    setTargetValue("");
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:border-indigo-500 focus:ring-indigo-500 text-black"
                            >
                                <option value="ALL">All Users</option>
                                <option value="TOPIC">Specific Topic</option>
                                <option value="USER">Specific User</option>
                            </select>
                        </div>

                        {target === "USER" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Select User
                                </label>
                                <select
                                    required
                                    value={targetValue}
                                    onChange={(e) =>
                                        setTargetValue(e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:border-indigo-500 focus:ring-indigo-500 text-black"
                                >
                                    <option value="">
                                        -- Choose a user --
                                    </option>
                                    {users.map((u) => (
                                        <option key={u.uid} value={u.uid}>
                                            {u.name || u.email} -{" "}
                                            {u.uid.slice(0, 8)}...
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {target === "TOPIC" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Select Topic
                                </label>
                                <select
                                    required
                                    value={targetValue}
                                    onChange={(e) =>
                                        setTargetValue(e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:border-indigo-500 focus:ring-indigo-500 text-black"
                                >
                                    <option value="">-- Choose --</option>
                                    {topics.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="isScheduled"
                            type="checkbox"
                            checked={isScheduled}
                            onChange={(e) => setIsScheduled(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded "
                        />
                        <label
                            htmlFor="isScheduled"
                            className="text-sm text-gray-900"
                        >
                            Schedule for later
                        </label>
                    </div>

                    {isScheduled && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Schedule Time (Local)
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={scheduledFor}
                                onChange={(e) =>
                                    setScheduledFor(e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:border-indigo-500 focus:ring-indigo-500 lg:w-1/2 text-black"
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <input
                                required
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:border-indigo-500 focus:ring-indigo-500 text-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Body
                            </label>
                            <textarea
                                required
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:border-indigo-500 focus:ring-indigo-500 text-black"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={status.loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {status.loading
                                ? "Sending..."
                                : isScheduled
                                  ? "Schedule Notification"
                                  : "Send Now"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
