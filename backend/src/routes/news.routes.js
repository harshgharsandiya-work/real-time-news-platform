const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");
const {
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
} = require("../controllers/news.controller");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

// -- Specific paths BEFORE parameterized paths --
router.get("/feed/subscribed", authenticate, getSubscribedFeed);
router.get("/feed/discover", authenticate, getDiscoverFeed);

// -- Public (optional auth so admin sees unpublished) --
router.get("/", optionalAuth, getAllNews);
router.get("/:id", optionalAuth, getNewsById);
router.get("/:id/comments", getComments);

// -- All authenticated users --
router.post("/", authenticate, createNews);
router.post("/:id/react", authenticate, reactToNews);
router.post("/:id/comments", authenticate, addComment);
router.delete("/:id/comments/:commentId", authenticate, deleteComment);

// -- Admin / Editor only --
router.post(
    "/:id/publish",
    authenticate,
    requireRole(["ADMIN", "EDITOR"]),
    publishNewsArticle,
);
router.patch(
    "/:id",
    authenticate,
    requireRole(["ADMIN", "EDITOR"]),
    updateNews,
);
router.delete(
    "/:id",
    authenticate,
    requireRole(["ADMIN", "EDITOR"]),
    deleteNews,
);

module.exports = router;
