import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api, authHeaders } from "../lib/api";
import { useRef } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    ThumbsUp,
    ThumbsDown,
    MessageCircle,
    Tag,
    Send,
    X,
    Check,
    BookOpen,
    Compass,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────── */
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
interface TopicLink {
    topicId: string;
    topic: Topic;
}
interface Article {
    id: string;
    title: string;
    description?: string;
    content: string;
    imageUrl?: string;
    publishedAt?: string;
    createdAt: string;
    topics: TopicLink[];
    reactions: Reaction[];
    comments: Comment[];
    author?: { uid: string; name?: string; email: string };
}

/* ── Helpers ─────────────────────────────────────────── */
const fmtDate = (d?: string) =>
    d
        ? new Date(d).toLocaleDateString(undefined, {
              month: "short",
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

/* ── Comment Section ─────────────────────────────────── */
function CommentSection({
    newsId,
    init,
    jwt,
    uid,
}: {
    newsId: string;
    init: Comment[];
    jwt: string | null;
    uid?: string;
}) {
    const [comments, setComments] = useState<Comment[]>(init);
    const [text, setText] = useState("");
    const [posting, setPosting] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        setPosting(true);
        try {
            const r = await api.post(
                `/news/${newsId}/comments`,
                { content: text },
                { headers: authHeaders(jwt) },
            );
            setComments((p) => [...p, r.data.data]);
            setText("");
        } finally {
            setPosting(false);
        }
    };

    const del = async (id: string) => {
        try {
            await api.delete(`/news/${newsId}/comments/${id}`, {
                headers: authHeaders(jwt),
            });
            setComments((p) => p.filter((c) => c.id !== id));
        } catch {
            /* ignore */
        }
    };

    return (
        <div className="border-t border-gray-100 pt-4 mt-2 space-y-2.5">
            {comments.map((c) => (
                <div key={c.id} className="flex gap-2 text-sm">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-xs">
                        {(c.user.name || c.user.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-800 text-xs">
                                {c.user.name || c.user.email.split("@")[0]}
                            </span>
                            <span className="text-xs text-gray-400">
                                {fmtDate(c.createdAt)}
                            </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-snug mt-0.5">
                            {c.content}
                        </p>
                    </div>
                    {c.user.uid === uid && (
                        <button
                            onClick={() => del(c.id)}
                            className="text-gray-300 hover:text-red-400 self-start mt-1.5"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
            ))}
            {jwt && (
                <form onSubmit={submit} className="flex gap-2 pt-1">
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write a comment…"
                        className="flex-1 px-3 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    <button
                        disabled={posting || !text.trim()}
                        className="p-2 rounded-full bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700 transition-colors"
                    >
                        <Send size={15} />
                    </button>
                </form>
            )}
        </div>
    );
}

/* ── News Card ───────────────────────────────────────── */
function NewsCard({
    article,
    jwt,
    uid,
    subs,
    onSubscribe,
    showSub,
}: {
    article: Article;
    jwt: string | null;
    uid?: string;
    subs: string[];
    onSubscribe: (id: string) => void;
    showSub: boolean;
}) {
    const [reactions, setReactions] = useState(article.reactions);
    const [showComments, setShowComments] = useState(false);
    const my = reactions.find((r) => r.userId === uid);

    const react = async (type: "LIKE" | "DISLIKE") => {
        if (!jwt) return;
        try {
            const r = await api.post(
                `/news/${article.id}/react`,
                { type },
                { headers: authHeaders(jwt) },
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

    return (
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col">
            {article.imageUrl ? (
                <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-44 object-cover"
                />
            ) : (
                <div className="w-full h-44 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                    <BookOpen size={36} className="text-indigo-200" />
                </div>
            )}

            <div className="p-5 flex-1 flex flex-col gap-3">
                {/* Topic tags */}
                {article.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {article.topics.map((tl) => (
                            <span
                                key={tl.topicId}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${tColor(tl.topicId)}`}
                            >
                                <Tag size={9} />
                                {tl.topic.name}
                                {showSub && !subs.includes(tl.topicId) && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onSubscribe(tl.topicId);
                                        }}
                                        className="ml-0.5 rounded-full bg-white/70 hover:bg-white w-4 h-4 flex items-center justify-center text-[10px] font-bold transition-colors"
                                        title={`Subscribe to ${tl.topic.name}`}
                                    >
                                        +
                                    </button>
                                )}
                                {showSub && subs.includes(tl.topicId) && (
                                    <Check size={9} className="ml-0.5" />
                                )}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex-1">
                    <h2 className="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-2">
                        {article.title}
                    </h2>
                    <p className="text-gray-500 text-sm line-clamp-3">
                        {article.description || article.content}
                    </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                        {article.author?.name ||
                            article.author?.email?.split("@")[0] ||
                            "Unknown"}
                    </span>
                    <span>
                        {fmtDate(article.publishedAt || article.createdAt)}
                    </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex gap-1.5">
                        {(["LIKE", "DISLIKE"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => react(t)}
                                className={`flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-full font-medium transition-colors ${
                                    my?.type === t
                                        ? t === "LIKE"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-red-100 text-red-600"
                                        : "text-gray-400 hover:bg-gray-100"
                                }`}
                            >
                                {t === "LIKE" ? (
                                    <ThumbsUp size={14} />
                                ) : (
                                    <ThumbsDown size={14} />
                                )}
                                {countBy(reactions, t)}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowComments((v) => !v)}
                            className="flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-full text-gray-400 hover:bg-gray-100 font-medium transition-colors"
                        >
                            <MessageCircle size={14} />
                            {article.comments.length}
                        </button>
                    </div>
                    <Link
                        to={`/news/${article.id}`}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        Read →
                    </Link>
                </div>

                {showComments && (
                    <CommentSection
                        newsId={article.id}
                        init={article.comments}
                        jwt={jwt}
                        uid={uid}
                    />
                )}
            </div>
        </article>
    );
}

/* ── Page ────────────────────────────────────────────── */
export default function NewsFeed() {
    const { jwtToken, user } = useAuth();
    const uid = user?.uid;

    const [tab, setTab] = useState<"feed" | "discover">("feed");
    const [search, setSearch] = useState("");
    const [q, setQ] = useState(""); // debounced search
    const [topicFilter, setTopicFilter] = useState("");

    const [topics, setTopics] = useState<Topic[]>([]);
    const [subs, setSubs] = useState<string[]>([]);
    const [feedNews, setFeedNews] = useState<Article[]>([]);
    const [discoverNews, setDiscoverNews] = useState<Article[]>([]);
    const [loadingFeed, setLoadingFeed] = useState(true);
    const [loadingDiscover, setLoadingDiscover] = useState(true);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    useEffect(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setQ(search), 340);
        return () => clearTimeout(timerRef.current);
    }, [search]);

    // topics + subs
    useEffect(() => {
        api.get("/topics")
            .then((r) => setTopics(r.data.data))
            .catch(() => {});
        if (jwtToken)
            api.get("/auth/me", { headers: authHeaders(jwtToken) })
                .then((r) =>
                    setSubs(
                        r.data.data.user.topicSubscriptions.map(
                            (s: any) => s.topicId,
                        ),
                    ),
                )
                .catch(() => {});
    }, [jwtToken]);

    // My Feed
    useEffect(() => {
        if (!jwtToken) {
            setLoadingFeed(false);
            return;
        }
        setLoadingFeed(true);
        const p = new URLSearchParams({
            ...(q && { search: q }),
            ...(topicFilter && { topicId: topicFilter }),
        });
        api.get(`/news/feed/subscribed?${p}`, {
            headers: authHeaders(jwtToken),
        })
            .then((r) => setFeedNews(r.data.data))
            .catch(() => setFeedNews([]))
            .finally(() => setLoadingFeed(false));
    }, [jwtToken, q, topicFilter]);

    // Discover
    useEffect(() => {
        if (!jwtToken) {
            setLoadingDiscover(false);
            return;
        }
        setLoadingDiscover(true);
        const p = new URLSearchParams({
            ...(q && { search: q }),
            ...(topicFilter && { topicId: topicFilter }),
        });
        api.get(`/news/feed/discover?${p}`, { headers: authHeaders(jwtToken) })
            .then((r) => setDiscoverNews(r.data.data))
            .catch(() => setDiscoverNews([]))
            .finally(() => setLoadingDiscover(false));
    }, [jwtToken, q, topicFilter]);

    const handleSubscribe = async (topicId: string) => {
        try {
            await api.post(
                "/users/subscribe",
                { topicId },
                { headers: authHeaders(jwtToken) },
            );
            setSubs((p) => [...p, topicId]);
        } catch {
            /* ignore */
        }
    };

    const news = tab === "feed" ? feedNews : discoverNews;
    const loading = tab === "feed" ? loadingFeed : loadingDiscover;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        News Feed
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Stay informed with what matters to you.
                    </p>
                </div>
                <Link
                    to="/submit-article"
                    className="shrink-0 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    + Submit Article
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search articles by title or topic…"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                />
            </div>

            {/* Topic chips */}
            {topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {[{ id: "", name: "All" }, ...topics].map((t) => (
                        <button
                            key={t.id}
                            onClick={() =>
                                setTopicFilter(topicFilter === t.id ? "" : t.id)
                            }
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                topicFilter === t.id
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
                            }`}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                {(
                    [
                        ["feed", <BookOpen size={15} />, "My Feed"],
                        ["discover", <Compass size={15} />, "Discover"],
                    ] as const
                ).map(([id, icon, label]) => (
                    <button
                        key={id}
                        onClick={() => setTab(id as "feed" | "discover")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            tab === id
                                ? "bg-white shadow-sm text-indigo-700"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {icon}
                        {label}
                    </button>
                ))}
            </div>

            {/* Empty subscriptions hint */}
            {tab === "feed" && subs.length === 0 && !loading && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-center">
                    <p className="text-indigo-700 font-medium text-sm">
                        You haven't subscribed to any topics yet. &nbsp;
                        <button
                            onClick={() => setTab("discover")}
                            className="underline"
                        >
                            Explore Discover
                        </button>
                        &nbsp;to subscribe to topics you like.
                    </p>
                </div>
            )}

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl border border-gray-100 animate-pulse"
                        >
                            <div className="h-44 bg-gray-100 rounded-t-2xl" />
                            <div className="p-5 space-y-3">
                                <div className="h-4 bg-gray-100 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 rounded w-full" />
                                <div className="h-3 bg-gray-100 rounded w-5/6" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((a) => (
                        <NewsCard
                            key={a.id}
                            article={a}
                            jwt={jwtToken}
                            uid={uid}
                            subs={subs}
                            onSubscribe={handleSubscribe}
                            showSub={tab === "discover"}
                        />
                    ))}
                    {news.length === 0 && (
                        <p className="col-span-full text-center text-gray-400 py-16 text-sm">
                            {tab === "feed"
                                ? "No articles from your subscribed topics."
                                : "No new topics to discover right now."}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
