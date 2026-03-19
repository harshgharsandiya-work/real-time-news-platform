import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api, authHeaders } from "../lib/api";
import { Check, X, Pencil } from "lucide-react";
import "../style/loader.css";

interface TopicSubscription {
    topic: { name: string };
}

interface User {
    name: string;
    email: string;
    role: string;
    topicSubscriptions: TopicSubscription[];
}

export default function UserProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [isUserEditing, setIsUserEditing] = useState(false);
    const [isEmailEditing, setIsEmailEditing] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const { jwtToken } = useAuth();

    const getUser = async () => {
        try {
            const response = await api.get(`/users/me`, {
                headers: authHeaders(jwtToken),
            });
            setUser(response.data.data);
            setName(response.data.data.name);
            setEmail(response.data.data.email);
        } catch (err) {
            console.error("Failed to fetch user", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async () => {
        try {
            await api.patch(
                `/users/me`,
                { name, email },
                { headers: authHeaders(jwtToken) },
            );
            await getUser();
            setIsUserEditing(false);
            setIsEmailEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (err) {
            console.error("Failed to update user", err);
        }
    };

    const handleCancel = () => {
        setIsUserEditing(false);
        setIsEmailEditing(false);
        setName(user?.name || "");
        setEmail(user?.email || "");
    };

    useEffect(() => {
        getUser();
    }, []);

    const getInitials = (name: string) =>
        name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "?";

    const roleBadge: Record<string, { bg: string; text: string; dot: string }> =
        {
            admin: {
                bg: "rgba(239,68,68,0.12)",
                text: "#ef4444",
                dot: "#ef4444",
            },
            user: {
                bg: "rgba(99,102,241,0.12)",
                text: "#818cf8",
                dot: "#818cf8",
            },
            moderator: {
                bg: "rgba(245,158,11,0.12)",
                text: "#f59e0b",
                dot: "#f59e0b",
            },
        };

    const topicPalette = [
        {
            bg: "rgba(168,85,247,0.15)",
            text: "#c084fc",
            border: "rgba(168,85,247,0.3)",
        },
        {
            bg: "rgba(6,182,212,0.15)",
            text: "#22d3ee",
            border: "rgba(6,182,212,0.3)",
        },
        {
            bg: "rgba(16,185,129,0.15)",
            text: "#34d399",
            border: "rgba(16,185,129,0.3)",
        },
        {
            bg: "rgba(245,158,11,0.15)",
            text: "#fbbf24",
            border: "rgba(245,158,11,0.3)",
        },
        {
            bg: "rgba(239,68,68,0.15)",
            text: "#f87171",
            border: "rgba(239,68,68,0.3)",
        },
        {
            bg: "rgba(99,102,241,0.15)",
            text: "#a5b4fc",
            border: "rgba(99,102,241,0.3)",
        },
    ];

    const role = user?.role?.toLowerCase() ?? "user";
    const badge = roleBadge[role] ?? {
        bg: "rgba(148,163,184,0.12)",
        text: "#94a3b8",
        dot: "#94a3b8",
    };

    if (loading) {
        return (
            <div style={styles.fullCenter}>
                <div style={styles.spinnerTrack}>
                    <div style={styles.spinnerThumb} />
                </div>
                <style>{spinnerCSS}</style>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={styles.fullCenter}>
                <p
                    style={{
                        color: "#64748b",
                        fontSize: 14,
                        fontFamily: "'DM Sans', sans-serif",
                    }}
                >
                    Could not load profile.
                </p>
            </div>
        );
    }

    const isEditing = isUserEditing || isEmailEditing;

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap"
                rel="stylesheet"
            />
            <style>{animationsCSS}</style>

            <div style={styles.page}>
                {/* Ambient background blobs */}
                <div
                    style={{
                        ...styles.blob,
                        top: "10%",
                        left: "15%",
                        background:
                            "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
                    }}
                />
                <div
                    style={{
                        ...styles.blob,
                        bottom: "10%",
                        right: "15%",
                        background:
                            "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)",
                    }}
                />

                <div style={styles.card} className="profile-card">
                    {/* ── HEADER ── */}
                    <div style={styles.header}>
                        {/* Avatar with Instagram-style gradient ring */}
                        <div style={styles.avatarRingOuter}>
                            <div style={styles.avatarRingInner}>
                                <div style={styles.avatar}>
                                    {getInitials(user.name)}
                                </div>
                            </div>
                        </div>

                        {/* Name / email / role */}
                        <div style={styles.identityBlock}>
                            <div style={styles.nameRow}>
                                {isUserEditing ? (
                                    <input
                                        autoFocus
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        style={styles.nameInput}
                                        placeholder="Your name"
                                    />
                                ) : (
                                    <span style={styles.nameText}>
                                        {user.name}
                                    </span>
                                )}
                                <button
                                    onClick={() =>
                                        setIsUserEditing(!isUserEditing)
                                    }
                                    style={styles.editBtn}
                                    title="Edit name"
                                >
                                    <Pencil size={13} />
                                </button>
                            </div>

                            <div style={styles.emailRow}>
                                {isEmailEditing ? (
                                    <input
                                        autoFocus
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        style={styles.emailInput}
                                        placeholder="your@email.com"
                                    />
                                ) : (
                                    <span style={styles.emailText}>
                                        {user.email}
                                    </span>
                                )}
                                <button
                                    onClick={() =>
                                        setIsEmailEditing(!isEmailEditing)
                                    }
                                    style={styles.editBtn}
                                    title="Edit email"
                                >
                                    <Pencil size={11} />
                                </button>
                            </div>

                            {/* Role badge */}
                            <div
                                style={{
                                    ...styles.roleBadge,
                                    background: badge.bg,
                                }}
                            >
                                <span
                                    style={{
                                        ...styles.roleDot,
                                        background: badge.dot,
                                    }}
                                />
                                <span
                                    style={{
                                        ...styles.roleLabel,
                                        color: badge.text,
                                    }}
                                >
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── STATS ROW (Instagram-style) ── */}
                    <div style={styles.statsRow}>
                        <div style={styles.statItem}>
                            <span style={styles.statNumber}>
                                {user.topicSubscriptions?.length ?? 0}
                            </span>
                            <span style={styles.statLabel}>subscriptions</span>
                        </div>
                        <div style={styles.statDivider} />
                        <div style={styles.statItem}>
                            <span style={styles.statNumber}>
                                {user.topicSubscriptions?.length > 0
                                    ? Math.round(
                                          (user.topicSubscriptions.length /
                                              10) *
                                              100,
                                      )
                                    : 0}
                                %
                            </span>
                            <span style={styles.statLabel}>engaged</span>
                        </div>
                        <div style={styles.statDivider} />
                        <div style={styles.statItem}>
                            <span
                                style={{
                                    ...styles.statNumber,
                                    textTransform: "capitalize",
                                }}
                            >
                                {user.role}
                            </span>
                            <span style={styles.statLabel}>role</span>
                        </div>
                    </div>

                    {/* ── TOPICS SECTION ── */}
                    <div style={styles.topicsSection}>
                        <p style={styles.sectionLabel}>Subscribed Topics</p>
                        {user.topicSubscriptions?.length > 0 ? (
                            <div style={styles.topicsGrid}>
                                {user.topicSubscriptions.map((sub, i) => {
                                    const c =
                                        topicPalette[i % topicPalette.length];
                                    return (
                                        <span
                                            key={i}
                                            style={{
                                                ...styles.topicChip,
                                                background: c.bg,
                                                color: c.text,
                                                border: `1px solid ${c.border}`,
                                                animationDelay: `${i * 60}ms`,
                                            }}
                                            className="chip-pop"
                                        >
                                            # {sub.topic.name}
                                        </span>
                                    );
                                })}
                            </div>
                        ) : (
                            <p style={styles.emptyTopics}>
                                No topics subscribed yet.
                            </p>
                        )}
                    </div>

                    {/* ── ACTION BUTTONS ── */}
                    {isEditing && (
                        <div style={styles.actions} className="actions-fade">
                            <button
                                onClick={handleUpdateUser}
                                style={styles.saveBtn}
                            >
                                <Check size={14} />
                                Save changes
                            </button>
                            <button
                                onClick={handleCancel}
                                style={styles.cancelBtn}
                            >
                                <X size={14} />
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Success toast */}
                    {saveSuccess && (
                        <div style={styles.toast} className="toast-slide">
                            ✓ Profile updated
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

/* ─── Styles ─── */
const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "10vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
        padding: "24px 16px",
    },
    blob: {
        position: "absolute",
        width: 400,
        height: 400,
        borderRadius: "50%",
        pointerEvents: "none",
        filter: "blur(80px)",
    },
    card: {
        width: "100%",
        maxWidth: 480,
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.07)",
        borderRadius: 24,
        padding: "32px 28px 28px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: 20,
        marginBottom: 28,
    },
    avatarRingOuter: {
        padding: 3,
        borderRadius: "50%",
        background:
            "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #833ab4)",
        flexShrink: 0,
    },
    avatarRingInner: {
        padding: 3,
        borderRadius: "50%",
        background: "#ffffff",
    },
    avatar: {
        width: 76,
        height: 76,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 26,
        fontWeight: 700,
        color: "#fff",
        letterSpacing: "-0.5px",
    },
    identityBlock: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    nameRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    nameText: {
        fontSize: 20,
        fontWeight: 700,
        color: "#0f0f0f",
        letterSpacing: "-0.3px",
    },
    nameInput: {
        fontSize: 20,
        fontWeight: 700,
        color: "#0f0f0f",
        background: "#f5f5f7",
        border: "1px solid rgba(99,102,241,0.5)",
        borderRadius: 8,
        padding: "4px 10px",
        outline: "none",
        width: "100%",
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "-0.3px",
    },
    emailRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    emailText: {
        fontSize: 13,
        color: "#8e8e93",
        fontWeight: 400,
    },
    emailInput: {
        fontSize: 13,
        color: "#3c3c43",
        background: "#f5f5f7",
        border: "1px solid rgba(99,102,241,0.4)",
        borderRadius: 6,
        padding: "3px 8px",
        outline: "none",
        width: "100%",
        fontFamily: "'DM Sans', sans-serif",
    },
    editBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#aeaeb2",
        display: "flex",
        alignItems: "center",
        padding: 4,
        borderRadius: 6,
        transition: "color 0.2s",
        flexShrink: 0,
    },
    roleBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 20,
        width: "fit-content",
        marginTop: 2,
    },
    roleDot: {
        width: 6,
        height: 6,
        borderRadius: "50%",
        flexShrink: 0,
    },
    roleLabel: {
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
    },

    /* Stats */
    statsRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        background: "#f5f5f7",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 16,
        padding: "16px 12px",
        marginBottom: 24,
    },
    statItem: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        flex: 1,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 700,
        color: "#0f0f0f",
        letterSpacing: "-0.5px",
    },
    statLabel: {
        fontSize: 11,
        color: "#8e8e93",
        fontWeight: 500,
        textTransform: "lowercase",
        letterSpacing: "0.03em",
    },
    statDivider: {
        width: 1,
        height: 32,
        background: "rgba(0,0,0,0.08)",
    },

    /* Topics */
    topicsSection: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: 600,
        color: "#8e8e93",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: 12,
        margin: "0 0 12px 0",
    },
    topicsGrid: {
        display: "flex",
        flexWrap: "wrap" as const,
        gap: 8,
    },
    topicChip: {
        fontSize: 12,
        fontWeight: 500,
        padding: "6px 12px",
        borderRadius: 20,
        letterSpacing: "0.01em",
    },
    emptyTopics: {
        fontSize: 13,
        color: "#aeaeb2",
        fontStyle: "italic",
    },

    /* Actions */
    actions: {
        display: "flex",
        gap: 10,
        paddingTop: 8,
        borderTop: "1px solid rgba(0,0,0,0.06)",
        marginTop: 4,
    },
    saveBtn: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "10px 16px",
        borderRadius: 12,
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
        transition: "opacity 0.2s",
    },
    cancelBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "10px 16px",
        borderRadius: 12,
        background: "#f5f5f7",
        border: "1px solid rgba(0,0,0,0.08)",
        color: "#8e8e93",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
    },

    /* Toast */
    toast: {
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(16,185,129,0.15)",
        border: "1px solid rgba(16,185,129,0.35)",
        color: "#34d399",
        fontSize: 13,
        fontWeight: 600,
        padding: "8px 20px",
        borderRadius: 20,
        whiteSpace: "nowrap",
    },

    /* Loader */
    fullCenter: {
        minHeight: "100vh",
        background: "#f5f5f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    spinnerTrack: {
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: "3px solid rgba(255,255,255,0.08)",
        borderTopColor: "#818cf8",
        animation: "spin 0.8s linear infinite",
    },
    spinnerThumb: {},
};

const spinnerCSS = `
@keyframes spin { to { transform: rotate(360deg); } }
`;

const animationsCSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

.profile-card { animation: cardIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes cardIn {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.chip-pop { animation: chipIn 0.35s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes chipIn {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}

.actions-fade { animation: fadeUp 0.25s ease both; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.toast-slide { animation: toastIn 0.3s ease both; }
@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
`;
