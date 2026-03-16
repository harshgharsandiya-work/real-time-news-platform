const { z } = require("zod");
const newsService = require("../services/news.service");
const { notifyNewsPublished } = require("../services/notification.service");

/* ---------------- ZOD SCHEMAS ---------------- */
const newsSchema = z.object({
    title: z.string().min(5).max(150),
    description: z.string().optional(),
    content: z.string().min(10),
    imageUrl: z.string().url().optional().or(z.literal("")),
    topicIds: z.array(z.string()).optional().default([]),
    scheduledPublishAt: z.string().datetime().optional(),
    publishNow: z.boolean().optional().default(false),
});

/* ---------------- CONTROLLERS ---------------- */

const createNews = async (req, res, next) => {
    try {
        const { publishNow: requestedPublish, ...rest } = newsSchema.parse(
            req.body,
        );
        // Only ADMIN/EDITOR may publish immediately
        const canPublishNow = ["ADMIN", "EDITOR"].includes(req.user.role);
        const news = await newsService.createNews({
            ...rest,
            publishNow: canPublishNow && requestedPublish,
            authorId: req.user.uid,
        });
        if (canPublishNow && requestedPublish) {
            notifyNewsPublished(news.id, news.title, news.description).catch(
                (e) => console.error("[Notify Error]:", e),
            );
        }
        res.status(201).json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
};

const getAllNews = async (req, res, next) => {
    try {
        const { search, topicId } = req.query;
        const publishedOnly =
            !req.user || !["ADMIN", "EDITOR"].includes(req.user.role);
        const news = await newsService.getAllNews({
            search,
            topicId,
            publishedOnly,
        });
        res.status(200).json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
};

const getSubscribedFeed = async (req, res, next) => {
    try {
        const { search, topicId } = req.query;
        const news = await newsService.getSubscribedFeed(req.user.uid, {
            search,
            topicId,
        });
        res.status(200).json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
};

const getDiscoverFeed = async (req, res, next) => {
    try {
        const { search, topicId } = req.query;
        const news = await newsService.getDiscoverFeed(req.user.uid, {
            search,
            topicId,
        });
        res.status(200).json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
};

const getNewsById = async (req, res, next) => {
    try {
        const news = await newsService.getNewsById(req.params.id);
        res.status(200).json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
};

const updateNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = newsSchema.partial().parse(req.body);
        const news = await newsService.updateNews(id, data);
        res.status(200).json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
};

const publishNewsArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const news = await newsService.publishNews(id);
        notifyNewsPublished(id, news.title, news.description).catch((e) =>
            console.error("[Notify Error]:", e),
        );
        res.status(200).json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
};

const deleteNews = async (req, res, next) => {
    try {
        await newsService.deleteNews(req.params.id);
        res.status(200).json({ success: true, message: "News deleted" });
    } catch (error) {
        next(error);
    }
};

const reactToNews = async (req, res, next) => {
    try {
        const type = z.enum(["LIKE", "DISLIKE"]).parse(req.body.type);
        const reaction = await newsService.reactToNews(
            req.user.uid,
            req.params.id,
            type,
        );
        res.status(200).json({ success: true, data: reaction });
    } catch (error) {
        next(error);
    }
};

const getComments = async (req, res, next) => {
    try {
        const comments = await newsService.getComments(req.params.id);
        res.status(200).json({ success: true, data: comments });
    } catch (error) {
        next(error);
    }
};

const addComment = async (req, res, next) => {
    try {
        const { content } = z
            .object({ content: z.string().min(1).max(1000) })
            .parse(req.body);
        const comment = await newsService.addComment(
            req.user.uid,
            req.params.id,
            content,
        );
        res.status(201).json({ success: true, data: comment });
    } catch (error) {
        next(error);
    }
};

const deleteComment = async (req, res, next) => {
    try {
        await newsService.deleteComment(
            req.user.uid,
            req.params.commentId,
            req.user.role,
        );
        res.status(200).json({ success: true, message: "Comment deleted" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createNews,
    getAllNews,
    getSubscribedFeed,
    getDiscoverFeed,
    getNewsById,
    updateNews,
    publishNewsArticle,
    deleteNews,
    reactToNews,
    getComments,
    addComment,
    deleteComment,
};
