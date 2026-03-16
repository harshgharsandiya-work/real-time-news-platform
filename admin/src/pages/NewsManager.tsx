import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
    Plus,
    Trash2,
    Edit2,
    CheckCircle,
    Clock,
    FileText,
    Tag,
} from "lucide-react";
import { api, authHeaders } from "../lib/api";

interface Topic {
    id: string;
    name: string;
}

const COLORS = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-teal-100 text-teal-700",
];
const tColor = (id: string) => COLORS[id.charCodeAt(5) % COLORS.length];

const StatusBadge = ({ news }: { news: any }) => {
    if (news.isPublished)
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                <CheckCircle size={10} /> Published
            </span>
        );
    if (news.scheduledPublishAt)
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                <Clock size={10} /> Scheduled
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            <FileText size={10} /> Draft
        </span>
    );
};

export default function NewsManager() {
    const { jwtToken } = useAuth();
    const [newsList, setNewsList] = useState<any[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formError, setFormError] = useState("");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [publishNow, setPublishNow] = useState(false);
    const [scheduledFor, setScheduledFor] = useState("");

    const headers = () => authHeaders(jwtToken);

    const fetchNews = async () => {
        try {
            const r = await api.get("/news", { headers: headers() });
            setNewsList(r.data.data);
        } catch {
            /* ignore */
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        api.get("/topics")
            .then((r) => setTopics(r.data.data))
            .catch(() => {});
    }, [jwtToken]);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setContent("");
        setImageUrl("");
        setSelectedTopics([]);
        setPublishNow(false);
        setScheduledFor("");
        setEditingId(null);
        setFormError("");
    };

    const openEdit = (news: any) => {
        setEditingId(news.id);
        setTitle(news.title);
        setDescription(news.description || "");
        setContent(news.content);
        setImageUrl(news.imageUrl || "");
        setSelectedTopics(news.topics?.map((t: any) => t.topicId) || []);
        setPublishNow(false);
        setScheduledFor(
            news.scheduledPublishAt
                ? new Date(news.scheduledPublishAt).toISOString().slice(0, 16)
                : "",
        );
        setFormError("");
        setShowForm(true);
        window.scrollTo(0, 0);
    };

    const toggleTopic = (id: string) =>
        setSelectedTopics((p) =>
            p.includes(id) ? p.filter((t) => t !== id) : [...p, id],
        );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        const payload: any = {
            title,
            description,
            content,
            imageUrl: imageUrl || undefined,
            topicIds: selectedTopics,
            publishNow,
            scheduledPublishAt:
                !publishNow && scheduledFor
                    ? new Date(scheduledFor).toISOString()
                    : undefined,
        };
        try {
            if (editingId) {
                await api.patch(`/news/${editingId}`, payload, {
                    headers: headers(),
                });
            } else {
                await api.post("/news", payload, { headers: headers() });
            }
            setShowForm(false);
            resetForm();
            fetchNews();
        } catch (err: any) {
            setFormError(
                err.response?.data?.message || "Failed to save article.",
            );
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await api.post(`/news/${id}/publish`, {}, { headers: headers() });
            fetchNews();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to publish.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this article?")) return;
        try {
            await api.delete(`/news/${id}`, { headers: headers() });
            fetchNews();
        } catch {
            /* ignore */
        }
    };

    if (loading)
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl animate-pulse h-64 border border-gray-100"
                    />
                ))}
            </div>
        );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    News Management
                </h2>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                        window.scrollTo(0, 0);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-sm"
                >
                    <Plus size={16} /> New Article
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-5">
                        {editingId ? "Edit Article" : "Create Article"}
                    </h3>
                    {formError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                            {formError}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                minLength={5}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 text-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Description{" "}
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none text-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Content <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                minLength={10}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 font-mono resize-y text-black"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Image URL{" "}
                                </label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) =>
                                        setImageUrl(e.target.value)
                                    }
                                    placeholder="https://..."
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Schedule Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={scheduledFor}
                                    onChange={(e) =>
                                        setScheduledFor(e.target.value)
                                    }
                                    disabled={publishNow}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50 text-black"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Topics
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {topics.map((t) => (
                                    <label
                                        key={t.id}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer text-xs font-medium transition-all select-none ${
                                            selectedTopics.includes(t.id)
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "border-gray-200 text-gray-600 hover:border-indigo-300"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={selectedTopics.includes(
                                                t.id,
                                            )}
                                            onChange={() => toggleTopic(t.id)}
                                        />
                                        <Tag size={10} />
                                        {t.name}
                                    </label>
                                ))}
                                {topics.length === 0 && (
                                    <span className="text-xs text-gray-400">
                                        No topics � create topics first.
                                    </span>
                                )}
                            </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                            <input
                                type="checkbox"
                                checked={publishNow}
                                onChange={(e) => {
                                    setPublishNow(e.target.checked);
                                    if (e.target.checked) setScheduledFor("");
                                }}
                                className="rounded accent-indigo-600 h-4 w-4"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Publish immediately and notify subscribers
                            </span>
                        </label>

                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                            >
                                {editingId ? "Update" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsList.map((news) => (
                    <div
                        key={news.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                    >
                        {news.imageUrl ? (
                            <img
                                src={news.imageUrl}
                                alt={news.title}
                                className="w-full h-40 object-cover"
                            />
                        ) : (
                            <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-indigo-50 flex items-center justify-center text-gray-300">
                                <FileText size={36} />
                            </div>
                        )}
                        <div className="p-4 flex-1 flex flex-col gap-2.5">
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">
                                    {news.title}
                                </h4>
                                <StatusBadge news={news} />
                            </div>
                            {news.topics?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {news.topics.map((tl: any) => (
                                        <span
                                            key={tl.topicId}
                                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${tColor(tl.topicId)}`}
                                        >
                                            <Tag size={9} />
                                            {tl.topic.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-gray-500 flex-1 line-clamp-2">
                                {news.description || news.content}
                            </p>
                            <p className="text-xs text-gray-400">
                                {news.isPublished
                                    ? `Published ${new Date(news.publishedAt).toLocaleDateString()}`
                                    : news.scheduledPublishAt
                                      ? `Scheduled: ${new Date(news.scheduledPublishAt).toLocaleString()}`
                                      : `Created ${new Date(news.createdAt).toLocaleDateString()}`}
                            </p>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                {!news.isPublished ? (
                                    <button
                                        onClick={() => handlePublish(news.id)}
                                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <CheckCircle size={12} /> Publish Now
                                    </button>
                                ) : (
                                    <span className="text-xs text-green-600 font-medium">
                                        Live
                                    </span>
                                )}
                                <div className="flex gap-1 ml-auto">
                                    <button
                                        onClick={() => openEdit(news)}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(news.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {newsList.length === 0 && !showForm && (
                    <p className="col-span-full text-center text-gray-400 py-16">
                        No articles yet. Create your first one!
                    </p>
                )}
            </div>
        </div>
    );
}
