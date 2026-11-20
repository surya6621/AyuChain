const pool = require("../config/db");

const createBatch = async (
    batchCode,
    herbId,
    manufacturerId,
    productName = null,
    quantity = null
) => {
    const result = await pool.query(
        `INSERT INTO batches
        (batch_code, herb_id, manufacturer_id, product_name, quantity)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, batch_code, herb_id, manufacturer_id, product_name, quantity, qr_cid, blockchain_tx_hash, created_at`,
        [batchCode, herbId, manufacturerId, productName, quantity]
    );

    return result.rows[0];
};

const findBatchByCode = async (batchCode) => {
    const result = await pool.query(
        `SELECT id, batch_code, herb_id, manufacturer_id, product_name, quantity, qr_cid, blockchain_tx_hash, created_at
         FROM batches
         WHERE batch_code = $1`,
        [batchCode]
    );

    return result.rows[0];
};

const updateBatchQrCid = async (batchCode, qrCid) => {
    const result = await pool.query(
        `UPDATE batches
         SET qr_cid = $1
         WHERE batch_code = $2
         RETURNING id, batch_code, herb_id, manufacturer_id, product_name, quantity, qr_cid, blockchain_tx_hash, created_at`,
        [qrCid, batchCode]
    );

    return result.rows[0];
};

const getBatchTraceability = async (batchCode) => {
    const result = await pool.query(
        `SELECT
            b.batch_code,
            b.product_name,
            b.quantity,
            b.qr_cid,
            b.blockchain_tx_hash,
            b.created_at AS batch_created_at,
            h.id AS herb_id,
            h.name AS herb_name,
            h.description AS herb_description,
            h.origin AS herb_origin,
            h.status AS herb_status,
            h.created_at AS herb_created_at,
            f.name AS farmer_name,
            f.role AS farmer_role,
            m.name AS manufacturer_name,
            m.role AS manufacturer_role
         FROM batches b
         JOIN herbs h
            ON b.herb_id = h.id
         LEFT JOIN users f
            ON h.farmer_id = f.id
         LEFT JOIN users m
            ON b.manufacturer_id = m.id
         WHERE b.batch_code = $1`,
        [batchCode]
    );

    return result.rows[0];
};

module.exports = {
    createBatch,
    findBatchByCode,
    updateBatchQrCid,
    getBatchTraceability
};
