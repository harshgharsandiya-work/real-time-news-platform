const { z } = require("zod");
const topicService = require("../services/topic.service");

/* ---------------- ZOD SCHEMAS ---------------- */
const topicSchema = z.object({
    name: z.string().min(2).max(50),
    description: z.string().optional(),
});

/* ---------------- CONTROLLERS ---------------- */

const createTopic = async (req, res, next) => {
    try {
        const data = topicSchema.parse(req.body);
        const topic = await topicService.createTopic(data);
        res.status(201).json({ success: true, data: topic });
    } catch (error) {
        next(error);
    }
};

const getAllTopics = async (req, res, next) => {
    try {
        const topics = await topicService.getAllTopics();
        res.status(200).json({ success: true, data: topics });
    } catch (error) {
        next(error);
    }
};

const getTopicById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const topic = await topicService.getTopicById(id);
        res.status(200).json({ success: true, data: topic });
    } catch (error) {
        next(error);
    }
};

const updateTopic = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = topicSchema.partial().parse(req.body);
        const topic = await topicService.updateTopic(id, data);
        res.status(200).json({ success: true, data: topic });
    } catch (error) {
        next(error);
    }
};

const deleteTopic = async (req, res, next) => {
    try {
        const { id } = req.params;
        await topicService.deleteTopic(id);
        res.status(200).json({ success: true, message: "Topic deleted" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTopic,
    getAllTopics,
    getTopicById,
    updateTopic,
    deleteTopic,
};
