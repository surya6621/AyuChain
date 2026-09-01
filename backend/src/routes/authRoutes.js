const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

const { validate } = require("../middleware/validate.middleware");

const {
    registerRules,
    loginRules
} = require("../validators/authValidator");

const router = express.Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);

module.exports = router;
