const prisma = require("../config/prisma");
const { messaging } = require("../config/firebase");
const { createError } = require("../middleware/errorHandler");

const saveToken = async (uid, token, platform = "web") => {
    return await prisma.fcmToken.upsert({
        where: { token: token },
        update: { userId: uid, platform, isActive: true },
        create: { token, userId: uid, platform },
    });
};

const deleteToken = async (token) => {
    return await prisma.fcmToken.delete({
        where: { token: token },
    });
};

const validateNotificationTarget = async (target, targetValue) => {
    if (target === "ALL") {
        return;
    }

    if (!targetValue) {
        throw createError(400, "targetValue is required for this target");
    }

    if (target === "USER") {
        const user = await prisma.user.findUnique({
            where: { uid: targetValue },
            select: { uid: true },
        });

        if (!user) {
            throw createError(404, "Target user not found");
        }

        return;
    }

    if (target === "TOPIC") {
        const topic = await prisma.topic.findUnique({
            where: { id: targetValue },
            select: { id: true },
        });

        if (!topic) {
            throw createError(404, "Target topic not found");
        }
    }
};

const internalProcessPush = async (notificationRecord) => {
    const { id, title, body, target, targetValue } = notificationRecord;

    try {
        let tokens = [];

        // 1. Gather tokens based on target
        if (target === "ALL") {
            const allUsers = await prisma.user.findMany({
                include: {
                    fcmTokens: { where: { isActive: true } },
                    notificationPreferences: true
                }
            });
            allUsers.forEach(user => {
                const prefs = user.notificationPreferences;
                if (prefs && (!prefs.receivePushNotifications || (prefs.isMuted && (!prefs.mutedUntil || new Date() < new Date(prefs.mutedUntil))))) return;
                user.fcmTokens.forEach(t => tokens.push(t.token));
            });
        } else if (target === "USER") {
            const user = await prisma.user.findUnique({
                where: { uid: targetValue },
                include: {
                    fcmTokens: { where: { isActive: true } },
                    notificationPreferences: true
                }
            });
            if (user) {
                const prefs = user.notificationPreferences;
                const isMuted = prefs && (!prefs.receivePushNotifications || (prefs.isMuted && (!prefs.mutedUntil || new Date() < new Date(prefs.mutedUntil))));
                if (!isMuted) {
                    user.fcmTokens.forEach(t => tokens.push(t.token));
                }
            }
        } else if (target === "TOPIC") {
            const topic = await prisma.topic.findUnique({
                where: { id: targetValue },
            });
            if (!topic) throw new Error("Topic not found");
            const subscriptions = await prisma.topicSubscription.findMany({
                where: { topicId: targetValue },
                include: {
                    user: {
                        include: { 
                            fcmTokens: { where: { isActive: true } },
                            notificationPreferences: true 
                        },
                    },
                },
            });
            subscriptions.forEach((sub) => {
                const prefs = sub.user.notificationPreferences;
                if (prefs && (!prefs.receivePushNotifications || (prefs.isMuted && (!prefs.mutedUntil || new Date() < new Date(prefs.mutedUntil))))) return;
                sub.user.fcmTokens.forEach((t) => tokens.push(t.token));
            });
        }

        tokens = [...new Set(tokens)];

        // 2. If no tokens, mark sent (technically nothing to send to, but processing succeeded)
        if (tokens.length === 0) {
            await prisma.notification.update({
                where: { id },
                data: { status: "SENT", sendAt: new Date() },
            });
            return;
        }

        // 3. Construct message
        const messagePayload = {
            notification: { title, body },
            data: {
                notificationId: id,
                target,
                ...(targetValue ? { targetValue } : {}),
                title,
                body,
            },
            tokens,
        };

        // 4. Send via FCM
        const response = await messaging.sendEachForMulticast(messagePayload);

        // 5. Cleanup Dead Tokens
        if (response.failureCount > 0) {
            const deadTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const errCode = resp.error?.code;
                    if (
                        errCode === "messaging/invalid-registration-token" ||
                        errCode ===
                            "messaging/registration-token-not-registered"
                    ) {
                        deadTokens.push(tokens[idx]);
                    }
                }
            });

            if (deadTokens.length > 0) {
                await prisma.fcmToken.updateMany({
                    where: { token: { in: deadTokens } },
                    data: { isActive: false },
                });
            }
        }

        // 6. Update notification status
        await prisma.notification.update({
            where: { id },
            data: { status: "SENT", sendAt: new Date() },
        });
    } catch (error) {
        console.error(`[Push Notification Error] Notification ${id}:`, error);
        await prisma.notification.update({
            where: { id },
            data: { status: "FAILED" },
        });
    }
};

const sendNotification = async ({
    title,
    body,
    target,
    targetValue,
    sendBy,
}) => {
    await validateNotificationTarget(target, targetValue);

    // Immediate sending
    const notification = await prisma.notification.create({
        data: {
            title,
            body,
            target,
            targetValue,
            sendBy,
            status: "INPROGRESS",
        },
    });

    // Fire & Forget Processing
    internalProcessPush(notification).catch((error) => {
        console.error(
            `[Async Push Error] Notification ${notification.id}:`,
            error,
        );
    });

    return notification;
};

const scheduleNotification = async ({
    title,
    body,
    target,
    targetValue,
    scheduledFor,
    sendBy,
}) => {
    await validateNotificationTarget(target, targetValue);

    const notification = await prisma.notification.create({
        data: {
            title,
            body,
            target,
            targetValue,
            sendBy,
            scheduledFor: new Date(scheduledFor),
            status: "PENDING",
        },
    });

    return notification;
};

const getNotificationHistory = async () => {
    return prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
    });
};

const getUserInbox = async (uid) => {
    // get user topic subscriptions
    const subs = await prisma.topicSubscription.findMany({
        where: { userId: uid },
        select: { topicId: true },
    });
    const topicIds = subs.map((s) => s.topicId);

    return prisma.notification.findMany({
        where: {
            status: "SENT",
            OR: [
                { target: "ALL" },
                { target: "USER", targetValue: uid },
                { target: "TOPIC", targetValue: { in: topicIds } },
            ],
        },
        orderBy: { createdAt: "desc" },
    });
};

const getPendingScheduled = async () => {
    const now = new Date();
    return prisma.notification.findMany({
        where: {
            status: "PENDING",
            scheduledFor: {
                lte: now,
            },
        },
    });
};

const processScheduledPush = async (id) => {
    const updateResult = await prisma.notification.updateMany({
        where: { id, status: "PENDING" },
        data: { status: "INPROGRESS" },
    });

    if (updateResult.count === 0) {
        return null;
    }

    const notification = await prisma.notification.findUnique({
        where: { id },
    });

    if (!notification) {
        throw createError(404, "Scheduled notification not found");
    }

    await internalProcessPush(notification);
};

module.exports = {
    saveToken,
    deleteToken,
    sendNotification,
    scheduleNotification,
    getNotificationHistory,
    getUserInbox,
    getPendingScheduled,
    processScheduledPush,
};

/**
 * Sends FCM push to all subscribers of the topics linked to a published news article.
 * Creates a Notification record for audit trail.
 */
const notifyNewsPublished = async (newsId, title, description) => {
    try {
        const newsWithTopics = await prisma.news.findUnique({
            where: { id: newsId },
            include: {
                topics: {
                    include: {
                        topic: {
                            include: {
                                topicSubscriptions: {
                                    include: {
                                        user: {
                                            include: {
                                                fcmTokens: {
                                                    where: { isActive: true },
                                                },
                                                notificationPreferences: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!newsWithTopics || newsWithTopics.topics.length === 0) return;

        const tokenSet = new Set();
        newsWithTopics.topics.forEach((topicLink) => {
            topicLink.topic.topicSubscriptions.forEach((sub) => {
                const prefs = sub.user.notificationPreferences;
                if (prefs) {
                    if (!prefs.receivePushNotifications) return;
                    if (prefs.isMuted) {
                        if (
                            !prefs.mutedUntil ||
                            new Date() < new Date(prefs.mutedUntil)
                        )
                            return;
                    }
                }
                sub.user.fcmTokens.forEach((t) => tokenSet.add(t.token));
            });
        });

        const tokens = [...tokenSet];
        if (tokens.length === 0) return;

        const notifTitle = `📰 ${title}`;
        const notifBody = description || "A new article has been published!";

        const notification = await prisma.notification.create({
            data: {
                title: notifTitle,
                body: notifBody,
                target: "ALL",
                status: "INPROGRESS",
            },
        });

        const messagePayload = {
            notification: { title: notifTitle, body: notifBody },
            data: {
                notificationId: notification.id,
                newsId,
                type: "NEWS_PUBLISHED",
                title: notifTitle,
                body: notifBody,
            },
            tokens,
        };

        const response = await messaging.sendEachForMulticast(messagePayload);

        if (response.failureCount > 0) {
            const deadTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const code = resp.error?.code;
                    if (
                        code === "messaging/invalid-registration-token" ||
                        code === "messaging/registration-token-not-registered"
                    )
                        deadTokens.push(tokens[idx]);
                }
            });
            if (deadTokens.length > 0)
                await prisma.fcmToken.updateMany({
                    where: { token: { in: deadTokens } },
                    data: { isActive: false },
                });
        }

        await prisma.notification.update({
            where: { id: notification.id },
            data: { status: "SENT", sendAt: new Date() },
        });
    } catch (error) {
        console.error("[notifyNewsPublished Error]:", error);
    }
};

module.exports.notifyNewsPublished = notifyNewsPublished;
