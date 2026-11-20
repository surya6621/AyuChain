const express = require("express");

const {
    addBatch,
    generateQR,
    getQRImage
} = require("../controllers/qrController");

const {
    authenticate
} = require("../middleware/authMiddleware");

const { allow } = require("../middleware/role.middleware");

const { validate } = require("../middleware/validate.middleware");

const {
    batchCodeRules,
    createBatchRules
} = require("../validators/qrValidator");

const router = express.Router();

router.post(
    "/batches",
    authenticate,
    allow("manufacturer", "admin"),
    createBatchRules,
    validate,
    addBatch
);

router.post(
    "/generate/:batchId",
    authenticate,
    allow("manufacturer", "admin"),
    batchCodeRules,
    validate,
    generateQR
);

router.get(
    "/:batchId",
    batchCodeRules,
    validate,
    getQRImage
);

module.exports = router;
