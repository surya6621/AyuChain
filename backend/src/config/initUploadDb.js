require("dotenv").config();

const pool = require("./db");

const initializeUploadTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS uploads (
                id SERIAL PRIMARY KEY,
                cid VARCHAR(100) NOT NULL,
                uploaded_by INTEGER REFERENCES users(id),
                herb_id INTEGER REFERENCES herbs(id) ON DELETE SET NULL,
                file_type VARCHAR(50) NOT NULL,
                file_name VARCHAR(255),
                mime_type VARCHAR(100),
                size_bytes INTEGER,
                status VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Uploads table initialized successfully.");
    } catch (error) {
        console.error("Uploads table initialization failed.");
        console.error(error);
    } finally {
        await pool.end();
    }
};

initializeUploadTable();
