const prisma = require("../config/prisma");

const getStats = async (req, res, next) => {
    try {
        const [usersCount, topicsCount, newsCount, pushSentCount] = await Promise.all([
            prisma.user.count(),
            prisma.topic.count(),
            prisma.news.count(),
            prisma.notification.count({ where: { status: "SENT" } })
        ]);

        res.status(200).json({
            success: true,
            data: {
                usersCount,
                topicsCount,
                newsCount,
                pushSentCount
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getStats };
