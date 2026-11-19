const pool = require("../config/db");

const createLabReport = async ({ herbId, laboratoryId, originalName, fileName, mimeType, fileSize }) => {
    const result = await pool.query(
        `INSERT INTO lab_reports (herb_id, laboratory_id, original_name, file_name, mime_type, file_size)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, herb_id, laboratory_id, original_name, file_name, mime_type, file_size, created_at`,
        [herbId, laboratoryId, originalName, fileName, mimeType, fileSize]
    );
    return result.rows[0];
};

const getLatestLabReport = async (herbId) => {
    const result = await pool.query(
        `SELECT id, herb_id, laboratory_id, original_name, file_name, mime_type, file_size, created_at
         FROM lab_reports WHERE herb_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [herbId]
    );
    return result.rows[0];
};

module.exports = { createLabReport, getLatestLabReport };
