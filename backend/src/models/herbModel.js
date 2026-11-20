const pool = require("../config/db");

const herbColumns = "id, batch_number, name, description, origin, farmer_id, status, created_at";

const createHerb = async (name, description, origin, farmerId) => {
    const result = await pool.query(
        `INSERT INTO herbs (name, description, origin, farmer_id)
         VALUES ($1, $2, $3, $4) RETURNING ${herbColumns}`,
        [name, description, origin, farmerId]
    );
    return result.rows[0];
};

const getHerbsByFarmer = async (farmerId) => {
    const result = await pool.query(
        `SELECT ${herbColumns} FROM herbs WHERE farmer_id = $1 ORDER BY created_at DESC`,
        [farmerId]
    );
    return result.rows;
};

const getAllHerbs = async () => {
    const result = await pool.query(`SELECT ${herbColumns} FROM herbs ORDER BY created_at DESC`);
    return result.rows;
};

const getHerbsByStatuses = async (statuses) => {
    const result = await pool.query(
        `SELECT ${herbColumns} FROM herbs WHERE status = ANY($1::text[]) ORDER BY created_at ASC`,
        [statuses]
    );
    return result.rows;
};

const findHerbById = async (id) => {
    const result = await pool.query(`SELECT ${herbColumns} FROM herbs WHERE id = $1`, [id]);
    return result.rows[0];
};

const findHerbByIdentifier = async (identifier) => {
    const result = await pool.query(
        `SELECT ${herbColumns} FROM herbs WHERE CAST(id AS TEXT) = $1 OR batch_number = $1 LIMIT 1`,
        [identifier]
    );
    return result.rows[0];
};

const updateHerbStatus = async (id, status) => {
    const result = await pool.query(
        `UPDATE herbs SET status = $1 WHERE id = $2 RETURNING ${herbColumns}`,
        [status, id]
    );
    return result.rows[0];
};

const approveHerbBatch = async (id, batchNumber) => {
    const result = await pool.query(
        `UPDATE herbs SET batch_number = $1, status = 'ready' WHERE id = $2 RETURNING ${herbColumns}`,
        [batchNumber, id]
    );
    return result.rows[0];
};

module.exports = { createHerb, getHerbsByFarmer, getAllHerbs, getHerbsByStatuses, findHerbById, findHerbByIdentifier, updateHerbStatus, approveHerbBatch };
