const pool = require("../config/db");

const createHerb = async (
    name,
    description,
    origin,
    farmerId
) => {
    const result = await pool.query(
        `INSERT INTO herbs
        (name, description, origin, farmer_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, description, origin, farmer_id, status, created_at`,
        [name, description, origin, farmerId]
    );

    return result.rows[0];
};

const getHerbsByFarmer = async (farmerId) => {
    const result = await pool.query(
        `SELECT id, name, description, origin, farmer_id, status, created_at
         FROM herbs
         WHERE farmer_id = $1
         ORDER BY created_at DESC`,
        [farmerId]
    );

    return result.rows;
};

const findHerbById = async (id) => {
    const result = await pool.query(
        `SELECT id, name, description, origin, farmer_id, status, created_at
         FROM herbs
         WHERE id = $1`,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    createHerb,
    getHerbsByFarmer,
    findHerbById
};
