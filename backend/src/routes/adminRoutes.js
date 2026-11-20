const express = require("express");

const {
    getAdminDashboard,
    listUsers,
    listBatches,
    changeUserRole
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

router.get("/users", authenticate, authorizeRoles("admin"), listUsers);
router.get("/batches", authenticate, authorizeRoles("admin"), listBatches);
router.patch("/users/:id/role", authenticate, authorizeRoles("admin"), changeUserRole);

module.exports = router;
