const { z } = require("zod");
const userService = require("../services/user.service");

/* ---------------- ZOD SCHEMAS ---------------- */
const prefSchema = z.object({
    receivePushNotifications: z.boolean().optional(),
    isMuted: z.boolean().optional(),
    mutedUntil: z.string().datetime().nullable().optional(),
});

const subSchema = z.object({ topicId: z.string().min(1) });
const roleSchema = z.object({ role: z.enum(["ADMIN", "EDITOR", "USER"]) });

/* ---------------- CONTROLLERS ---------------- */

const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

const updatePreferences = async (req, res, next) => {
    try {
        const data = prefSchema.parse(req.body);
        const prefs = await userService.updatePreferences(req.user.uid, data);
        res.status(200).json({ success: true, data: prefs });
    } catch (error) {
        next(error);
    }
};

const subscribeToTopic = async (req, res, next) => {
    try {
        const { topicId } = subSchema.parse(req.body);
        await userService.subscribeToTopic(req.user.uid, topicId);
        res.status(200).json({
            success: true,
            message: "Subscribed successfully",
        });
    } catch (error) {
        next(error);
    }
};

const unsubscribeFromTopic = async (req, res, next) => {
    try {
        const { topicId } = subSchema.parse(req.body);
        await userService.unsubscribeFromTopic(req.user.uid, topicId);
        res.status(200).json({
            success: true,
            message: "Unsubscribed successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updatePreferences,
    subscribeToTopic,
    unsubscribeFromTopic,
};

const updateUserRole = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const { role } = roleSchema.parse(req.body);
        const updated = await userService.updateUserRole(uid, role);
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

module.exports.updateUserRole = updateUserRole;
