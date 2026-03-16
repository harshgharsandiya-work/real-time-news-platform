const prisma = require("../config/prisma");
const { createError } = require("../middleware/errorHandler");

/** Standard include shape for all news queries */
const newsInclude = {
    topics: { include: { topic: true } },
    author: { select: { uid: true, name: true, email: true } },
    reactions: true,
    comments: {
        include: { user: { select: { uid: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
    },
};

const createNews = async ({
    topicIds = [],
    scheduledPublishAt,
    publishNow = false,
    authorId,
    ...data
}) => {
    return prisma.news.create({
        data: {
            ...data,
            authorId,
            isPublished: publishNow,
            publishedAt: publishNow ? new Date() : null,
            scheduledPublishAt: scheduledPublishAt
                ? new Date(scheduledPublishAt)
                : null,
            topics: { create: topicIds.map((tid) => ({ topicId: tid })) },
        },
        include: newsInclude,
    });
};

const publishNews = async (id) => {
    return prisma.news.update({
        where: { id },
        data: {
            isPublished: true,
            publishedAt: new Date(),
            scheduledPublishAt: null,
        },
        include: newsInclude,
    });
};

const _buildConditions = ({ search, topicId, publishedOnly = true } = {}) => {
    const conditions = [];
    if (publishedOnly) conditions.push({ isPublished: true });
    if (search)
        conditions.push({
            OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ],
        });
    if (topicId) conditions.push({ topics: { some: { topicId } } });
    return conditions;
};

const getAllNews = async ({ search, topicId, publishedOnly = true } = {}) => {
    const conditions = _buildConditions({ search, topicId, publishedOnly });
    return prisma.news.findMany({
        where: conditions.length ? { AND: conditions } : {},
        include: newsInclude,
        orderBy: { createdAt: "desc" },
    });
};

/** News from topics the user IS subscribed to */
const getSubscribedFeed = async (uid, { search, topicId } = {}) => {
    const subs = await prisma.topicSubscription.findMany({
        where: { userId: uid },
        select: { topicId: true },
    });
    const subscribedIds = subs.map((s) => s.topicId);
    if (subscribedIds.length === 0) return [];
    if (topicId && !subscribedIds.includes(topicId)) return [];
    const topicFilter = topicId ? topicId : { in: subscribedIds };
    const conditions = [
        { isPublished: true },
        { topics: { some: { topicId: topicFilter } } },
    ];
    if (search)
        conditions.push({
            OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ],
        });
    return prisma.news.findMany({
        where: { AND: conditions },
        include: newsInclude,
        orderBy: { publishedAt: "desc" },
    });
};

/** News from topics the user is NOT subscribed to (discovery) */
const getDiscoverFeed = async (uid, { search, topicId } = {}) => {
    const subs = await prisma.topicSubscription.findMany({
        where: { userId: uid },
        select: { topicId: true },
    });
    const subscribedIds = subs.map((s) => s.topicId);
    const conditions = [{ isPublished: true }];
    if (topicId) {
        conditions.push({ topics: { some: { topicId } } });
    } else if (subscribedIds.length > 0) {
        conditions.push({
            topics: { some: { topicId: { notIn: subscribedIds } } },
        });
    }
    if (search)
        conditions.push({
            OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ],
        });
    return prisma.news.findMany({
        where: { AND: conditions },
        include: newsInclude,
        orderBy: { publishedAt: "desc" },
    });
};

const getNewsById = async (id) => {
    const news = await prisma.news.findUnique({
        where: { id },
        include: newsInclude,
    });
    if (!news) throw createError(404, "News article not found");
    return news;
};

const updateNews = async (id, { topicIds, publishNow, scheduledPublishAt, ...data }) => {
    const updateData = { ...data };

    if (publishNow === true) {
        updateData.isPublished = true;
        updateData.publishedAt = new Date();
        updateData.scheduledPublishAt = null;
    } else if (publishNow === false) {
        updateData.isPublished = false;
        updateData.scheduledPublishAt = scheduledPublishAt ? new Date(scheduledPublishAt) : null;
    } else if (scheduledPublishAt !== undefined) {
        updateData.scheduledPublishAt = scheduledPublishAt ? new Date(scheduledPublishAt) : null;
    }

    if (topicIds !== undefined) {
        updateData.topics = {
            deleteMany: {},
            create: topicIds.map((tid) => ({ topicId: tid })),
        };
    }
    return prisma.news.update({
        where: { id },
        data: updateData,
        include: newsInclude,
    });
};

const deleteNews = async (id) => prisma.news.delete({ where: { id } });

/** Toggle like/dislike — same type again removes the reaction */
const reactToNews = async (uid, newsId, type) => {
    const news = await prisma.news.findUnique({
        where: { id: newsId },
        select: { id: true },
    });
    if (!news) throw createError(404, "News article not found");
    const existing = await prisma.newsReaction.findUnique({
        where: { userId_newsId: { userId: uid, newsId } },
    });
    if (existing) {
        if (existing.type === type) {
            await prisma.newsReaction.delete({ where: { id: existing.id } });
            return null;
        }
        return prisma.newsReaction.update({
            where: { id: existing.id },
            data: { type },
        });
    }
    return prisma.newsReaction.create({ data: { userId: uid, newsId, type } });
};

const getComments = async (newsId) =>
    prisma.newsComment.findMany({
        where: { newsId },
        include: { user: { select: { uid: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
    });

const addComment = async (uid, newsId, content) => {
    const news = await prisma.news.findUnique({
        where: { id: newsId },
        select: { id: true },
    });
    if (!news) throw createError(404, "News article not found");
    return prisma.newsComment.create({
        data: { userId: uid, newsId, content },
        include: { user: { select: { uid: true, name: true, email: true } } },
    });
};

const deleteComment = async (uid, commentId, role) => {
    const comment = await prisma.newsComment.findUnique({
        where: { id: commentId },
    });
    if (!comment) throw createError(404, "Comment not found");
    if (comment.userId !== uid && role !== "ADMIN" && role !== "EDITOR")
        throw createError(403, "Not authorized to delete this comment");
    await prisma.newsComment.delete({ where: { id: commentId } });
};

/** Returns news due for auto-publish (called from cron) */
const processScheduledNews = async () =>
    prisma.news.findMany({
        where: { isPublished: false, scheduledPublishAt: { lte: new Date() } },
        select: { id: true, title: true, description: true },
    });

module.exports = {
    createNews,
    publishNews,
    getAllNews,
    getSubscribedFeed,
    getDiscoverFeed,
    getNewsById,
    updateNews,
    deleteNews,
    reactToNews,
    getComments,
    addComment,
    deleteComment,
    processScheduledNews,
};
