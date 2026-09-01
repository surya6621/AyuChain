const express = require("express");

const {
    addHerb,
    getMyHerbs,
    getHerb,
    updateStatus,
    getHerbTracking
} = require("../controllers/herbController");

const {
    authenticate
} = require("../middleware/authMiddleware");

const { validate } = require("../middleware/validate.middleware");

const {
    createHerbRules,
    herbIdRules,
    updateStatusRules
} = require("../validators/herbValidator");

const router = express.Router();

router.post("/", authenticate, createHerbRules, validate, addHerb);

router.get("/my", authenticate, getMyHerbs);

router.get("/:id/tracking", authenticate, herbIdRules, validate, getHerbTracking);

router.get("/:id", authenticate, herbIdRules, validate, getHerb);

router.patch("/:id/status", authenticate, updateStatusRules, validate, updateStatus);

module.exports = router;
