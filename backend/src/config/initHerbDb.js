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

        await pool.query(`
            CREATE TABLE IF NOT EXISTS lab_reports (
                id SERIAL PRIMARY KEY,
                herb_id INTEGER NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
                laboratory_id INTEGER NOT NULL REFERENCES users(id),
                original_name VARCHAR(255) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                mime_type VARCHAR(100) NOT NULL,
                file_size INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`ALTER TABLE herbs ADD COLUMN IF NOT EXISTS batch_number VARCHAR(80) UNIQUE;`);

        console.log("Herbs and lab reports tables initialized successfully.");
    } catch (error) {
        console.error("Herb table initialization failed.");
        console.error(error);
    } finally {
        await pool.end();
    }
};

initializeHerbTable();
