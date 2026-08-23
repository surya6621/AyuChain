const getAdminDashboard = async (req, res) => {
    res.status(200).json({
        message: "Admin dashboard access granted",
        user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        }
    });
};

module.exports = {
    getAdminDashboard
};
