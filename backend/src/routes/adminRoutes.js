const express = require("express");

const {
    getAdminDashboard
} = require("../controllers/adminController");

const {
    authenticate,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/dashboard",
    authenticate,
    authorizeRoles("admin"),
    getAdminDashboard
);

module.exports = router;
