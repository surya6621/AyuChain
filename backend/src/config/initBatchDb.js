require("dotenv").config();

const pool = require("./db");

const initializeBatchTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS batches (
                id SERIAL PRIMARY KEY,
                batch_code VARCHAR(64) UNIQUE NOT NULL,
                herb_id INTEGER NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
                manufacturer_id INTEGER REFERENCES users(id),
                product_name VARCHAR(150),
                quantity VARCHAR(50),
                qr_cid VARCHAR(100),
                blockchain_tx_hash VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Batches table initialized successfully.");
    } catch (error) {
        console.error("Batches table initialization failed.");
        console.error(error);
    } finally {
        await pool.end();
    }
};

initializeBatchTable();
