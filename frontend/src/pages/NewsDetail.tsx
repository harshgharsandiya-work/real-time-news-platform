import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api, authHeaders } from "../lib/api";
import {
    ArrowLeft,
    ThumbsUp,
    ThumbsDown,
    MessageCircle,
    Tag,
    Send,
    X,
    Calendar,
    User,
} from "lucide-react";

/* ── Types ───────────────────────────────────────── */
interface Topic {
    id: string;
    name: string;
}
interface Reaction {
    id: string;
    type: "LIKE" | "DISLIKE";
    userId: string;
}
interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: { uid: string; name?: string; email: string };
}
interface Article {
    id: string;
    title: string;
    description?: string;
    content: string;
    imageUrl?: string;
    publishedAt?: string;
    createdAt: string;
    topics: { topicId: string; topic: Topic }[];
    reactions: Reaction[];
    comments: Comment[];
    author?: { uid: string; name?: string; email: string };
}

/* ── Helpers ─────────────────────────────────────── */
const fmtDate = (d?: string) =>
    d
        ? new Date(d).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
          })
        : "";
const countBy = (arr: Reaction[], t: "LIKE" | "DISLIKE") =>
    arr.filter((r) => r.type === t).length;
const COLORS = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-purple-100 text-purple-800",
    "bg-amber-100 text-amber-800",
    "bg-rose-100 text-rose-800",
    "bg-teal-100 text-teal-800",
];
const tColor = (id: string) => COLORS[id.charCodeAt(5) % COLORS.length];

export default function NewsDetail() {
    const { id } = useParams<{ id: string }>();
    const { jwtToken, user } = useAuth();
    const navigate = useNavigate();
    const uid = user?.uid;

    const [article, setArticle] = useState<Article | null>(null);
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (!id) return;
        api.get(`/news/${id}`, { headers: authHeaders(jwtToken) })
            .then((r) => {
                setArticle(r.data.data);
                setReactions(r.data.data.reactions);
                setComments(r.data.data.comments);
            })
            .catch(() => navigate("/"))
            .finally(() => setLoading(false));
    }, [id, jwtToken, navigate]);

    const react = async (type: "LIKE" | "DISLIKE") => {
        if (!jwtToken) return;
        try {
            const r = await api.post(
                `/news/${id}/react`,
                { type },
                { headers: authHeaders(jwtToken) },
            );
            const updated = r.data.data;
            setReactions((p) => {
                const without = p.filter((r) => r.userId !== uid);
                return updated ? [...without, updated] : without;
            });
        } catch {
            /* ignore */
        }
    };

    const submitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setPosting(true);
        try {
            const r = await api.post(
                `/news/${id}/comments`,
                { content: commentText },
                { headers: authHeaders(jwtToken) },
            );
            setComments((p) => [...p, r.data.data]);
            setCommentText("");
        } finally {
            setPosting(false);
        }
    };

    const delComment = async (cid: string) => {
        try {
            await api.delete(`/news/${id}/comments/${cid}`, {
                headers: authHeaders(jwtToken),
            });
            setComments((p) => p.filter((c) => c.id !== cid));
        } catch {
            /* ignore */
        }
    };

    if (loading)
        return (
            <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-64 bg-gray-200 rounded-2xl" />
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
            </div>
        );

    if (!article) return null;

    const myReaction = reactions.find((r) => r.userId === uid);

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
                <ArrowLeft size={16} /> Back
            </button>

            {/* Hero image */}
            {article.imageUrl && (
                <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-72 object-cover rounded-2xl shadow-md"
                />
            )}

            {/* Topics */}
            {article.topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {article.topics.map((tl) => (
                        <span
                            key={tl.topicId}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${tColor(tl.topicId)}`}
                        >
                            <Tag size={10} />
                            {tl.topic.name}
                        </span>
                    ))}
                </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                {article.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-5 text-sm text-gray-500 border-b border-gray-100 pb-4">
                <span className="flex items-center gap-1.5">
                    <User size={14} />
                    {article.author?.name ||
                        article.author?.email?.split("@")[0] ||
                        "Anonymous"}
                </span>
                <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {fmtDate(article.publishedAt || article.createdAt)}
                </span>
            </div>

            {/* Description */}
            {article.description && (
                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                    {article.description}
                </p>
            )}

            {/* Content */}
            <div className="prose prose-indigo max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
                {article.content}
            </div>

            {/* Reactions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-500">
                    Was this helpful?
                </span>
                {(["LIKE", "DISLIKE"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => react(t)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                            myReaction?.type === t
                                ? t === "LIKE"
                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : "bg-red-100 text-red-600 border-red-200"
                                : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                        }`}
                    >
                        {t === "LIKE" ? (
                            <ThumbsUp size={16} />
                        ) : (
                            <ThumbsDown size={16} />
                        )}
                        {countBy(reactions, t)}
                    </button>
                ))}
            </div>

            {/* Comments */}
            <div className="space-y-5">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle size={20} className="text-indigo-600" />
                    Comments ({comments.length})
                </h2>

                {jwtToken && (
                    <form onSubmit={submitComment} className="flex gap-3">
                        <input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Share your thoughts…"
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                        />
                        <button
                            type="submit"
                            disabled={posting || !commentText.trim()}
                            className="px-4 py-3 rounded-xl bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-semibold"
                        >
                            <Send size={16} /> Post
                        </button>
                    </form>
                )}
                {!jwtToken && (
                    <p className="text-sm text-gray-500">
                        <Link
                            to="/login"
                            className="text-indigo-600 font-semibold underline"
                        >
                            Log in
                        </Link>{" "}
                        to leave a comment.
                    </p>
                )}

                <div className="space-y-3">
                    {comments.map((c) => (
                        <div key={c.id} className="flex gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-sm">
                                {(c.user.name || c.user.email)[0].toUpperCase()}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-gray-800 text-sm">
                                        {c.user.name ||
                                            c.user.email.split("@")[0]}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">
                                            {fmtDate(c.createdAt)}
                                        </span>
                                        {c.user.uid === uid && (
                                            <button
                                                onClick={() => delComment(c.id)}
                                                className="text-gray-300 hover:text-red-400 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    {c.content}
                                </p>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-6">
                            No comments yet. Be the first!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
