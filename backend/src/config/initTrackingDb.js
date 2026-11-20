require("dotenv").config();

const pool = require("./db");

const initializeTrackingTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS herb_tracking (
                id SERIAL PRIMARY KEY,
                herb_id INTEGER NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
                status VARCHAR(50) NOT NULL,
                updated_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Herb tracking table initialized successfully.");
    } catch (error) {
        console.error("Herb tracking table initialization failed.");
        console.error(error);
    } finally {
        await pool.end();
    }
};

initializeTrackingTable();
