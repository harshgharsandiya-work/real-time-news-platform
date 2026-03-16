const express = require("express");
const { register, login, getMe } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth"); // Assuming this exists or I'll check it shortly

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);

module.exports = router;
