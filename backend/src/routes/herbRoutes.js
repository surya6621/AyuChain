const express = require("express");

const {
    addHerb,
    getMyHerbs,
    getHerb,
    updateStatus
} = require("../controllers/herbController");

const {
    authenticate
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticate, addHerb);

router.get("/my", authenticate, getMyHerbs);

router.get("/:id", authenticate, getHerb);

router.patch("/:id/status", authenticate, updateStatus);

module.exports = router;
