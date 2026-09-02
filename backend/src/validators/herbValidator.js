const { body, param } = require("express-validator");

const HERB_STATUSES = [
    "registered",
    "collected",
    "laboratory",
    "manufacturing",
    "ready",
    "delivered"
];

const createHerbRules = [
    body("name")
        .isString()
        .trim()
        .isLength({ min: 2, max: 150 })
        .withMessage("Herb name must be 2 to 150 characters"),

    body("description")
        .optional({ values: "falsy" })
        .isString()
        .trim()
        .isLength({ max: 2000 })
        .withMessage("Description must be at most 2000 characters"),

    body("origin")
        .optional({ values: "falsy" })
        .isString()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Origin must be at most 150 characters")
];

const herbIdRules = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Herb id must be a positive integer")
];

const updateStatusRules = [
    ...herbIdRules,

    body("status")
        .isIn(HERB_STATUSES)
        .withMessage(
            `Status must be one of: ${HERB_STATUSES.join(", ")}`
        )
];

module.exports = {
    HERB_STATUSES,
    createHerbRules,
    herbIdRules,
    updateStatusRules
};
