const { z } = require("zod");
const {
    deleteToken,
    saveToken,
    sendNotification: sendPush,
    scheduleNotification: schedulePush,
    getNotificationHistory: getHistory,
    getUserInbox: fetchUserInbox,
    markAsRead: markAsReadService,
    markAllAsRead: markAllAsReadService,
} = require("../services/notification.service");

/* ---------------- ZOD SCHEMAS ---------------- */
const sendSchema = z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    target: z.enum(["USER", "TOPIC", "ALL"]),
    targetValue: z.string().optional(), // required for USER/TOPIC, optional for ALL
});

const scheduleSchema = sendSchema.extend({
    scheduledFor: z.string().datetime(),
});

const registerTokenSchema = z.object({
    token: z.string().min(1),
    platform: z.enum(["web", "android", "ios"]).default("web"),
});

/* ---------------- CONTROLLERS ---------------- */

const registerToken = async (req, res) => {
    try {
        const { token, platform } = registerTokenSchema.parse(req.body);
        const savedToken = await saveToken(req.user.uid, token, platform);
        res.status(200).json({
            success: true,
            message: "Token registered",
            token: savedToken,
        });
    } catch (error) {
        console.log("[Error]: ", error);
        res.status(500).send("Internal Error");
    }
};

const removeToken = async (req, res) => {
    try {
        const { token } = req.params;
        await deleteToken(token);
        res.status(200).json({
            success: true,
            message: "Token deleted successfully",
        });
    } catch (error) {
        console.log("[Error]: ", error);
        res.status(500).send("Internal Error");
    }
};

const sendNotification = async (req, res, next) => {
    try {
        const data = sendSchema.parse(req.body);

        if (data.target !== "ALL" && !data.targetValue) {
            return res.status(400).json({
                success: false,
                message: "targetValue is required for USER or TOPIC targets",
            });
        }

        const notification = await sendPush({
            ...data,
            sendBy: req.user.uid,
        });

        res.status(200).json({
            success: true,
            message: "Notification dispatch initiated",
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

const scheduleNotification = async (req, res, next) => {
    try {
        const data = scheduleSchema.parse(req.body);

        if (data.target !== "ALL" && !data.targetValue) {
            return res.status(400).json({
                success: false,
                message: "targetValue is required for USER or TOPIC targets",
            });
        }

        const notification = await schedulePush({
            ...data,
            sendBy: req.user.uid,
        });

        res.status(201).json({
            success: true,
            message: "Notification scheduled",
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

const getNotificationHistory = async (req, res, next) => {
    try {
        const history = await getHistory();
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        next(error);
    }
};

const getInbox = async (req, res, next) => {
    try {
        const inbox = await fetchUserInbox(req.user.uid);
        res.status(200).json({ success: true, data: inbox });
    } catch (error) {
        next(error);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        const { notificationId } = req.params;
        const read = await markAsReadService(req.user.uid, notificationId);
        res.status(200).json({ success: true, data: read });
    } catch (error) {
        next(error);
    }
};

const markAllAsRead = async (req, res, next) => {
    try {
        const read = await markAllAsReadService(req.user.uid);
        res.status(200).json({ success: true, data: read });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerToken,
    removeToken,
    sendNotification,
    scheduleNotification,
    getNotificationHistory,
    getInbox,
    markAsRead,
    markAllAsRead,
};
