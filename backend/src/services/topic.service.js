const prisma = require("../config/prisma");
const { createError } = require("../middleware/errorHandler");

const createTopic = async (data) => {
    return prisma.topic.create({
        data,
    });
};

const getAllTopics = async () => {
    return prisma.topic.findMany({
        orderBy: { createdAt: "desc" },
    });
};

const getTopicById = async (id) => {
    const topic = await prisma.topic.findUnique({
        where: { id },
    });
    if (!topic) throw createError(404, "Topic not found");
    return topic;
};

const updateTopic = async (id, data) => {
    return prisma.topic.update({
        where: { id },
        data,
    });
};

const deleteTopic = async (id) => {
    return prisma.topic.delete({
        where: { id },
    });
};

module.exports = {
    createTopic,
    getAllTopics,
    getTopicById,
    updateTopic,
    deleteTopic,
};
