const pool = require("../config/db");

const addTrackingRecord = async (herbId, status, userId) => {
    const result = await pool.query(
        `INSERT INTO herb_tracking
        (herb_id, status, updated_by)
        VALUES ($1, $2, $3)
        RETURNING id, herb_id, status, updated_by, created_at`,
        [herbId, status, userId]
    );

    return result.rows[0];
};

const getTrackingHistory = async (herbId) => {
    const result = await pool.query(
        `SELECT
            ht.id,
            ht.herb_id,
            ht.status,
            ht.updated_by,
            u.name AS updated_by_name,
            u.role AS updated_by_role,
            ht.created_at
         FROM herb_tracking ht
         LEFT JOIN users u
            ON ht.updated_by = u.id
         WHERE ht.herb_id = $1
         ORDER BY ht.created_at ASC`,
        [herbId]
    );

    return result.rows;
};

module.exports = {
    addTrackingRecord,
    getTrackingHistory
};
