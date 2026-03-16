const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");
const {
    createTopic,
    getAllTopics,
    getTopicById,
    updateTopic,
    deleteTopic,
} = require("../controllers/topic.controller");

const router = express.Router();

// Public / User Routes
router.get("/", getAllTopics);
router.get("/:id", getTopicById);

// Admin Routes
router.use(authenticate, requireRole(["ADMIN", "EDITOR"]));
router.post("/", createTopic);
router.patch("/:id", updateTopic);
router.delete("/:id", deleteTopic);

module.exports = router;
