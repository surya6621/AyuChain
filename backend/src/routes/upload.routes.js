const express = require("express");

const {
    uploadHerbImage,
    uploadLabReport,
    redirectToGateway
} = require("../controllers/uploadController");

const {
    authenticate
} = require("../middleware/authMiddleware");

const { allow } = require("../middleware/role.middleware");

const {
    uploadHerbImage: parseHerbImage,
    uploadLabReport: parseLabReport
} = require("../middleware/upload.middleware");

const { validate } = require("../middleware/validate.middleware");

const {
    herbImageRules,
    labReportRules,
    cidRules
} = require("../validators/uploadValidator");

const router = express.Router();

router.post(
    "/herb-image",
    authenticate,
    allow("farmer"),
    parseHerbImage,
    herbImageRules,
    validate,
    uploadHerbImage
);

router.post(
    "/lab-report",
    authenticate,
    allow("laboratory"),
    parseLabReport,
    labReportRules,
    validate,
    uploadLabReport
);

router.get(
    "/:cid",
    cidRules,
    validate,
    redirectToGateway
);

module.exports = router;
