const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");
const router = express.Router();

const {
    registerToken,
    removeToken,
    sendNotification,
    scheduleNotification,
    getNotificationHistory,
    getInbox,
    markAsRead,
    markAllAsRead,
} = require("../controllers/notification.controller");

// Public / User Routes
router.use(authenticate); // Require authentication for all notification routes below
router.post("/register", registerToken);
router.delete("/remove/:token", removeToken);
router.get("/inbox", getInbox);
router.patch("/read/:notificationId", markAsRead);
router.patch("/read/all", markAllAsRead);

// Admin Routes (Only accessible by Admin/Editor)
router.use(authenticate, requireRole(["ADMIN", "EDITOR"]));
router.post("/send", sendNotification);
router.post("/schedule", scheduleNotification);
router.get("/history", getNotificationHistory);

module.exports = router;
