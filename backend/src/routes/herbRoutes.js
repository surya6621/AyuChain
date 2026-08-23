const express = require("express");

const {
    addHerb,
    getMyHerbs,
    getHerb
} = require("../controllers/herbController");

const {
    authenticate
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticate, addHerb);

router.get("/my", authenticate, getMyHerbs);

router.get("/:id", authenticate, getHerb);

module.exports = router;
