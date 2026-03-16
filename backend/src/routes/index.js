const express = require("express");

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const topicRoutes = require("./topic.routes");
const newsRoutes = require("./news.routes");
const notificationRoutes = require("./notification.routes");
const adminRoutes = require("./admin.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/topics", topicRoutes);
router.use("/news", newsRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
