const express = require("express");

const { verifyBatch } = require("../controllers/qrController");

const { validate } = require("../middleware/validate.middleware");

const { batchCodeRules } = require("../validators/qrValidator");

const router = express.Router();

router.get(
    "/:batchId",
    batchCodeRules,
    validate,
    verifyBatch
);

module.exports = router;
