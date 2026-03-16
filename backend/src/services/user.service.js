const prisma = require("../config/prisma");
const { createError } = require("../middleware/errorHandler");

// Admin functions
const getAllUsers = async () => {
    return prisma.user.findMany({
        include: {
            fcmTokens: true,
            topicSubscriptions: { include: { topic: true } },
            notificationPreferences: true,
        },
        orderBy: { createdAt: "desc" },
    });
};

const getUserById = async (uid) => {
    const user = await prisma.user.findUnique({
        where: { uid },
        include: {
            fcmTokens: true,
            topicSubscriptions: { include: { topic: true } },
            notificationPreferences: true,
        },
    });
    if (!user) throw createError(404, "User not found");
    return user;
};

// User functions
const updatePreferences = async (uid, data) => {
    return prisma.notificationPreferences.upsert({
        where: { userId: uid },
        update: data,
        create: { userId: uid, ...data },
    });
};

const subscribeToTopic = async (uid, topicId) => {
    // Check if topic exists
    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw createError(404, "Topic not found");

    return prisma.topicSubscription.upsert({
        where: { userId_topicId: { userId: uid, topicId } },
        update: {},
        create: { userId: uid, topicId },
    });
};

const unsubscribeFromTopic = async (uid, topicId) => {
    try {
        await prisma.topicSubscription.delete({
            where: { userId_topicId: { userId: uid, topicId } },
        });
    } catch (e) {
        // ignore if not found
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updatePreferences,
    subscribeToTopic,
    unsubscribeFromTopic,
};

const updateUserRole = async (uid, role) => {
    const user = await prisma.user.findUnique({
        where: { uid },
        select: { uid: true },
    });
    if (!user) throw createError(404, "User not found");
    return prisma.user.update({
        where: { uid },
        data: { role },
        select: { uid: true, name: true, email: true, role: true },
    });
};

module.exports.updateUserRole = updateUserRole;
