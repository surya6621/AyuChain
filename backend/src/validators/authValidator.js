const { body } = require("express-validator");

const USER_ROLES = [
    "farmer",
    "collector",
    "laboratory",
    "manufacturer",
    "customer",
    "admin"
];

const SELF_REGISTER_ROLES = USER_ROLES.filter(
    (role) => role !== "admin"
);

const registerRules = [
    body("name")
        .isString()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be 2 to 100 characters"),

    body("email")
        .isEmail()
        .withMessage("A valid email is required")
        .isLength({ max: 150 })
        .withMessage("Email must be at most 150 characters")
        .normalizeEmail(),

    body("password")
        .isString()
        .isLength({ min: 6, max: 128 })
        .withMessage("Password must be 6 to 128 characters"),

    body("role")
        .optional({ values: "falsy" })
        .isIn(SELF_REGISTER_ROLES)
        .withMessage(
            `Role must be one of: ${SELF_REGISTER_ROLES.join(", ")}`
        )
];

const loginRules = [
    body("email")
        .isEmail()
        .withMessage("A valid email is required")
        .normalizeEmail(),

    body("password")
        .isString()
        .notEmpty()
        .withMessage("Password is required")
];

module.exports = {
    USER_ROLES,
    SELF_REGISTER_ROLES,
    registerRules,
    loginRules
};
