const { getAllUsers, updateUserRole } = require("../models/userModel");
const { getAllHerbs } = require("../models/herbModel");

const getAdminDashboard = async (req, res) => {
    try {
        const [users, herbs] = await Promise.all([getAllUsers(), getAllHerbs()]);
        const usersByRole = users.reduce((summary, user) => {
            summary[user.role] = (summary[user.role] || 0) + 1;
            return summary;
        }, {});
        const batchesByStatus = herbs.reduce((summary, herb) => {
            summary[herb.status] = (summary[herb.status] || 0) + 1;
            return summary;
        }, {});
        res.status(200).json({
            message: "Admin dashboard access granted",
            summary: { totalUsers: users.length, totalBatches: herbs.length, usersByRole, batchesByStatus },
            user: { id: req.user.id, email: req.user.email, role: req.user.role }
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);
        res.status(500).json({ message: "Failed to load admin dashboard" });
    }
};

const listUsers = async (req, res) => {
    try { res.status(200).json({ users: await getAllUsers() }); }
    catch (error) { res.status(500).json({ message: "Failed to load users" }); }
};

const listBatches = async (req, res) => {
    try { res.status(200).json({ herbs: await getAllHerbs() }); }
    catch (error) { res.status(500).json({ message: "Failed to load batches" }); }
};

const changeUserRole = async (req, res) => {
    const allowedRoles = ["farmer", "collector", "laboratory", "manufacturer", "customer", "admin"];
    if (!allowedRoles.includes(req.body.role)) return res.status(400).json({ message: "Unsupported role" });
    if (Number(req.params.id) === req.user.id && req.body.role !== "admin") return res.status(400).json({ message: "An admin cannot remove their own admin role" });
    try {
        const user = await updateUserRole(req.params.id, req.body.role);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User role updated", user });
    } catch (error) { res.status(500).json({ message: "Failed to update user role" }); }
};

module.exports = {
    getAdminDashboard,
    listUsers,
    listBatches,
    changeUserRole
};
