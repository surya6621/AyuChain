const { body, param } = require("express-validator");

const batchCodeRules = [
    param("batchId")
        .trim()
        .matches(/^[A-Za-z0-9-]{4,64}$/)
        .withMessage("Invalid batch code")
];

const createBatchRules = [
    body("herbId")
        .isInt({ min: 1 })
        .withMessage("herbId must be a positive integer"),

    body("productName")
        .optional({ values: "falsy" })
        .isString()
        .trim()
        .isLength({ min: 2, max: 150 })
        .withMessage("productName must be 2 to 150 characters"),

    body("quantity")
        .optional({ values: "falsy" })
        .isString()
        .trim()
        .isLength({ max: 50 })
        .withMessage("quantity must be at most 50 characters")
];

module.exports = {
    batchCodeRules,
    createBatchRules
};
