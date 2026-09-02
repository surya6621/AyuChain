const { body, param } = require("express-validator");

const herbImageRules = [
    body("herbId")
        .optional({ values: "falsy" })
        .isInt({ min: 1 })
        .withMessage("herbId must be a positive integer")
];

const labReportRules = [
    body("herbId")
        .optional({ values: "falsy" })
        .isInt({ min: 1 })
        .withMessage("herbId must be a positive integer"),

    body("status")
        .optional({ values: "falsy" })
        .isIn(["pending", "passed", "failed"])
        .withMessage("status must be pending, passed or failed")
];

const cidRules = [
    param("cid")
        .trim()
        .matches(/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{58,})$/)
        .withMessage("Invalid IPFS CID")
];

module.exports = {
    herbImageRules,
    labReportRules,
    cidRules
};
