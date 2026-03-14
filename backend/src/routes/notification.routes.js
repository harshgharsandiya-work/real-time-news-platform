const express = require("express");
const router = express.Router();

const {
    registerToken,
    removeToken,
} = require("../controllers/notification.controller");

router.post("/", registerToken);
router.delete("/:token", removeToken);

module.exports = router;
