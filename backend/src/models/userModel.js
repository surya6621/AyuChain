const pool = require("../config/db");

const createUser = async (name, email, password, role = "customer") => {
    const result = await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at`,
        [name, email, password, role]
    );

    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT *
         FROM users
         WHERE email = $1`,
        [email]
    );

    return result.rows[0];
};

const findUserForLogin = async (email) => {
    const result = await pool.query(
        `SELECT id, name, email, password, role
         FROM users
         WHERE email = $1`,
        [email]
    );

    return result.rows[0];
};

const findUserById = async (id) => {
    const result = await pool.query(
        `SELECT id, name, email, role, created_at
         FROM users
         WHERE id = $1`,
        [id]
    );

    return result.rows[0];
};

const getAllUsers = async () => {
    const result = await pool.query(
        `SELECT id, name, email, role, created_at
         FROM users ORDER BY created_at DESC`
    );
    return result.rows;
};

const updateUserRole = async (id, role) => {
    const result = await pool.query(
        `UPDATE users SET role = $1 WHERE id = $2
         RETURNING id, name, email, role, created_at`,
        [role, id]
    );
    return result.rows[0];
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserForLogin,
    findUserById,
    getAllUsers,
    updateUserRole
};
