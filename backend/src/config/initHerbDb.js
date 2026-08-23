require("dotenv").config();

const pool = require("./db");

const initializeHerbTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS herbs (
                id SERIAL PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                description TEXT,
                origin VARCHAR(150),
                farmer_id INTEGER REFERENCES users(id),
                status VARCHAR(50) DEFAULT 'registered',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Herbs table initialized successfully.");
    } catch (error) {
        console.error("Herb table initialization failed.");
        console.error(error);
    } finally {
        await pool.end();
    }
};

initializeHerbTable();
