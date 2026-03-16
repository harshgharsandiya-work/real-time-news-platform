const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");
const { getStats } = require("../controllers/admin.controller");

const router = express.Router();

router.use(authenticate, requireRole(["ADMIN", "EDITOR"]));
router.get("/stats", getStats);

module.exports = router;
