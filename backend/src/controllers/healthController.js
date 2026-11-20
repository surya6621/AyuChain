const pool = require("../config/db");

const getHealth = async (req, res) => {
    let dbConnected = false;

    try {
        await pool.query("SELECT 1");

        dbConnected = true;

    } catch (error) {
        console.error("Health check database error:", error.message);
    }

    res.status(dbConnected ? 200 : 503).json({
        status: dbConnected ? "ok" : "degraded",
        uptime: Math.floor(process.uptime()),
        db: dbConnected ? "connected" : "disconnected"
    });
};

module.exports = {
    getHealth
};
