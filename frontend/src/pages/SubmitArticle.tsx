import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api, authHeaders } from "../lib/api";
import { ArrowLeft, Send } from "lucide-react";

interface Topic {
    id: string;
    name: string;
    description?: string;
}

export default function SubmitArticle() {
    const { jwtToken } = useAuth();
    const navigate = useNavigate();

    const [topics, setTopics] = useState<Topic[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [scheduledFor, setScheduledFor] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/topics")
            .then((r) => setTopics(r.data.data))
            .catch(() => {});
    }, []);

    const toggleTopic = (id: string) =>
        setSelectedTopics((p) =>
            p.includes(id) ? p.filter((t) => t !== id) : [...p, id],
        );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (selectedTopics.length === 0) {
            setError("Please select at least one topic.");
            return;
        }
        if (!scheduledFor) {
            setError("Please set a scheduled publish time.");
            return;
        }

        setSubmitting(true);
        try {
            await api.post(
                "/news",
                {
                    title,
                    description,
                    content,
                    imageUrl: imageUrl || undefined,
                    topicIds: selectedTopics,
                    scheduledPublishAt: new Date(scheduledFor).toISOString(),
                },
                { headers: authHeaders(jwtToken) },
            );
            navigate("/");
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Failed to submit article.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div>
                <h1 className="text-3xl font-extrabold text-gray-900">
                    Submit an Article
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Your article will be reviewed and published at your
                    scheduled time.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
            >
                {/* Title */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Title *
                    </label>
                    <input
                        required
                        minLength={5}
                        maxLength={150}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter article title"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-40 text-black"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Short Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="A brief summary of the article (optional)"
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none text-black"
                    />
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Content *
                    </label>
                    <textarea
                        required
                        minLength={10}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write the full article here…"
                        rows={8}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-y font-mono text-black"
                    />
                </div>

                {/* Image URL */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Cover Image URL
                    </label>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-black"
                    />
                </div>

                {/* Topics */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Topics *{" "}
                        <span className="text-gray-400 font-normal">
                            (select one or more)
                        </span>
                    </label>
                    {topics.length === 0 ? (
                        <p className="text-sm text-gray-400">
                            No topics available yet.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {topics.map((t) => (
                                <label
                                    key={t.id}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-sm ${
                                        selectedTopics.includes(t.id)
                                            ? "bg-indigo-50 border-indigo-400 text-indigo-800 font-semibold"
                                            : "border-gray-200 text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTopics.includes(t.id)}
                                        onChange={() => toggleTopic(t.id)}
                                        className="rounded accent-indigo-600"
                                    />
                                    {t.name}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Schedule */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Publish At *{" "}
                        <span className="text-gray-400 font-normal">
                            (local time)
                        </span>
                    </label>
                    <input
                        required
                        type="datetime-local"
                        value={scheduledFor}
                        onChange={(e) => setScheduledFor(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-black"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Your article will be automatically published and
                        subscribers notified at this time.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50 hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <Send size={15} />{" "}
                        {submitting ? "Submitting…" : "Submit Article"}
                    </button>
                </div>
            </form>
        </div>
    );
}
