const {
    uploadFile,
    getGatewayUrl
} = require("../services/ipfs.service");

const {
    createUploadRecord,
    findUploadByCid
} = require("../models/uploadModel");

const { findHerbById } = require("../models/herbModel");

const {
    assertContentMatchesType
} = require("../utils/fileType");

const IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const REPORT_MIME_TYPES = [
    "application/pdf"
];

const saveUpload = async (req, res, fileType, allowedMimeTypes, status = null) => {
    if (!req.file) {
        return res.status(400).json({
            message: "File is required"
        });
    }

    assertContentMatchesType(
        req.file.buffer,
        req.file.mimetype,
        allowedMimeTypes
    );

    const herbId = req.body.herbId
        ? Number(req.body.herbId)
        : null;

    if (herbId) {
        const herb = await findHerbById(herbId);

        if (!herb) {
            return res.status(404).json({
                message: "Herb not found"
            });
        }
    }

    const uploaded = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
    );

    const record = await createUploadRecord({
        cid: uploaded.cid,
        uploadedBy: req.user.id,
        herbId,
        fileType,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: uploaded.size,
        status
    });

    res.status(201).json({
        message: "File uploaded to IPFS successfully",
        upload: {
            id: record.id,
            cid: record.cid,
            url: uploaded.url,
            size: record.size_bytes,
            fileType: record.file_type,
            herbId: record.herb_id,
            status: record.status,
            createdAt: record.created_at
        }
    });
};

const uploadHerbImage = async (req, res) => {
    try {
        await saveUpload(req, res, "herb_image", IMAGE_MIME_TYPES);

    } catch (error) {
        console.error("Herb image upload error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to upload herb image"
        });
    }
};

const uploadLabReport = async (req, res) => {
    try {
        const status = req.body.status || "pending";

        await saveUpload(req, res, "lab_report", REPORT_MIME_TYPES, status);

    } catch (error) {
        console.error("Lab report upload error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to upload lab report"
        });
    }
};

const redirectToGateway = async (req, res) => {
    try {
        const { cid } = req.params;

        const record = await findUploadByCid(cid);

        if (!record) {
            return res.status(404).json({
                message: "CID not found"
            });
        }

        res.redirect(getGatewayUrl(cid));

    } catch (error) {
        console.error("Gateway redirect error:", error);

        res.status(500).json({
            message: "Failed to resolve CID"
        });
    }
};

module.exports = {
    uploadHerbImage,
    uploadLabReport,
    redirectToGateway
};
