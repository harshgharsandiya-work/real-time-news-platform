import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { api, authHeaders } from "../lib/api";

export default function TopicsManager() {
    const { jwtToken } = useAuth();
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const fetchTopics = async () => {
        try {
            const res = await api.get("/topics", {
                headers: authHeaders(jwtToken),
            });
            setTopics(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopics();
    }, [jwtToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.patch(
                    `/topics/${editingId}`,
                    { name, description },
                    {
                        headers: authHeaders(jwtToken),
                    },
                );
            } else {
                await api.post(
                    "/topics",
                    { name, description },
                    {
                        headers: authHeaders(jwtToken),
                    },
                );
            }
            setShowForm(false);
            setName("");
            setDescription("");
            setEditingId(null);
            fetchTopics();
        } catch (err) {
            console.error("Failed to save topic", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this topic?")) return;
        try {
            await api.delete(`/topics/${id}`, {
                headers: authHeaders(jwtToken),
            });
            fetchTopics();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading topics...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    Topics Management
                </h2>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setName("");
                        setDescription("");
                    }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    <Plus size={16} /> New Topic
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow mb-6">
                    <h3 className="text-lg font-medium mb-4">
                        {editingId ? "Edit Topic" : "Create Topic"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Topic Name
                            </label>
                            <input
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-black"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="bg-white px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-indigo-600 px-4 py-2 rounded-md text-white hover:bg-indigo-700"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {topics.map((topic) => (
                        <li
                            key={topic.id}
                            className="p-4 flex items-center justify-between"
                        >
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900">
                                    {topic.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                    {topic.description ||
                                        "No description provided."}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setEditingId(topic.id);
                                        setName(topic.name);
                                        setDescription(topic.description || "");
                                        setShowForm(true);
                                    }}
                                    className="text-gray-400 hover:text-indigo-600"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(topic.id)}
                                    className="text-gray-400 hover:text-red-600"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </li>
                    ))}
                    {topics.length === 0 && !showForm && (
                        <li className="p-6 text-center text-gray-500">
                            No topics found. Create one.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
