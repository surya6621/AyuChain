const express = require("express");

const {
    addHerb,
    getWorkQueue,
    getMyHerbs,
    getHerb,
    getPublicHerb,
    addLabReport,
    approveBatch,
    updateStatus
    updateStatus,
    getHerbTracking
} = require("../controllers/herbController");

const {
    authenticate,
    authorizeRoles
} = require("../middleware/authMiddleware");
const { uploadLabReport } = require("../config/upload");

const { validate } = require("../middleware/validate.middleware");

const {
    createHerbRules,
    herbIdRules,
    updateStatusRules
} = require("../validators/herbValidator");

const router = express.Router();

router.post("/", authenticate, authorizeRoles("farmer", "admin"), addHerb);

router.get("/my", authenticate, getMyHerbs);

router.get("/queue", authenticate, getWorkQueue);

router.get("/public/:id", getPublicHerb);

router.post("/:id/lab-report", authenticate, authorizeRoles("laboratory"), (req, res, next) => {
    uploadLabReport.single("report")(req, res, (error) => {
        if (error) return res.status(400).json({ message: error.message });
        next();
    });
}, addLabReport);

router.post("/:id/approve", authenticate, authorizeRoles("manufacturer", "admin"), approveBatch);

router.get("/:id", authenticate, getHerb);
router.post("/", authenticate, createHerbRules, validate, addHerb);

router.get("/my", authenticate, getMyHerbs);

router.get("/:id/tracking", authenticate, herbIdRules, validate, getHerbTracking);

router.get("/:id", authenticate, herbIdRules, validate, getHerb);

router.patch("/:id/status", authenticate, updateStatusRules, validate, updateStatus);

module.exports = router;
