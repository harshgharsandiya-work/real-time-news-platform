const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");
const {
    getAllUsers,
    getUserById,
    updatePreferences,
    subscribeToTopic,
    unsubscribeFromTopic,
} = require("../controllers/user.controller");
const { updateUserRole } = require("../controllers/user.controller");

const router = express.Router();

// User Routes
router.use(authenticate);
router.post("/preferences", updatePreferences);
router.post("/subscribe", subscribeToTopic);
router.post("/unsubscribe", unsubscribeFromTopic);

// Admin Routes
router.use(requireRole(["ADMIN", "EDITOR"]));
router.get("/", getAllUsers);
router.get("/:id", getUserById);

// Admin only: change user role
router.patch("/:uid/role", requireRole("ADMIN"), updateUserRole);

module.exports = router;
