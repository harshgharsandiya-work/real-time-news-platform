const express = require("express");
const router = express.Router();

const { syncUserToDb } = require("../controllers/user.controller");

router.post("/sync", syncUserToDb);

module.exports = router;
