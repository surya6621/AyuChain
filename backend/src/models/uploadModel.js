const pool = require("../config/db");

const createUploadRecord = async ({
    cid,
    uploadedBy,
    herbId = null,
    fileType,
    fileName = null,
    mimeType = null,
    sizeBytes = null,
    status = null
}) => {
    const result = await pool.query(
        `INSERT INTO uploads
        (cid, uploaded_by, herb_id, file_type, file_name, mime_type, size_bytes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, cid, uploaded_by, herb_id, file_type, file_name, mime_type, size_bytes, status, created_at`,
        [
            cid,
            uploadedBy,
            herbId,
            fileType,
            fileName,
            mimeType,
            sizeBytes,
            status
        ]
    );

    return result.rows[0];
};

const findUploadByCid = async (cid) => {
    const result = await pool.query(
        `SELECT id, cid, uploaded_by, herb_id, file_type, file_name, mime_type, size_bytes, status, created_at
         FROM uploads
         WHERE cid = $1`,
        [cid]
    );

    return result.rows[0];
};

const getUploadsByHerb = async (herbId, fileType = null) => {
    if (fileType) {
        const result = await pool.query(
            `SELECT id, cid, herb_id, file_type, file_name, mime_type, size_bytes, status, created_at
             FROM uploads
             WHERE herb_id = $1 AND file_type = $2
             ORDER BY created_at ASC`,
            [herbId, fileType]
        );

        return result.rows;
    }

    const result = await pool.query(
        `SELECT id, cid, herb_id, file_type, file_name, mime_type, size_bytes, status, created_at
         FROM uploads
         WHERE herb_id = $1
         ORDER BY created_at ASC`,
        [herbId]
    );

    return result.rows;
};

module.exports = {
    createUploadRecord,
    findUploadByCid,
    getUploadsByHerb
};
