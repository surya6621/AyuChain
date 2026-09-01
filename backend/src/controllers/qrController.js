const crypto = require("crypto");

const {
    generateBatchQR,
    uploadBatchQR,
    getVerifyUrl
} = require("../services/qr.service");

const {
    createBatch,
    findBatchByCode,
    updateBatchQrCid,
    getBatchTraceability
} = require("../models/batchModel");

const { findHerbById } = require("../models/herbModel");

const { getUploadsByHerb } = require("../models/uploadModel");

const { getTrackingHistory } = require("../models/trackingModel");

const {
    createUploadRecord
} = require("../models/uploadModel");

const { getGatewayUrl } = require("../services/ipfs.service");

const addBatch = async (req, res) => {
    try {
        const {
            herbId,
            productName,
            quantity
        } = req.body;

        const herb = await findHerbById(herbId);

        if (!herb) {
            return res.status(404).json({
                message: "Herb not found"
            });
        }

        const batchCode = `AYU-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

        const batch = await createBatch(
            batchCode,
            herbId,
            req.user.id,
            productName || null,
            quantity || null
        );

        res.status(201).json({
            message: "Batch created successfully",
            batch
        });

    } catch (error) {
        console.error("Create batch error:", error);

        res.status(500).json({
            message: "Failed to create batch"
        });
    }
};

const generateQR = async (req, res) => {
    try {
        const { batchId } = req.params;

        const batch = await findBatchByCode(batchId);

        if (!batch) {
            return res.status(404).json({
                message: "Batch not found"
            });
        }

        const { buffer, dataUrl, verifyUrl } =
            await generateBatchQR(batchId, { asDataUrl: true });

        const uploaded = await uploadBatchQR(batchId, buffer);

        const updatedBatch = await updateBatchQrCid(
            batchId,
            uploaded.cid
        );

        await createUploadRecord({
            cid: uploaded.cid,
            uploadedBy: req.user.id,
            herbId: batch.herb_id,
            fileType: "qr_code",
            fileName: `ayuchain-batch-${batchId}.png`,
            mimeType: "image/png",
            sizeBytes: uploaded.size
        });

        res.status(201).json({
            message: "QR code generated successfully",
            qr: {
                batchCode: updatedBatch.batch_code,
                verifyUrl,
                cid: uploaded.cid,
                ipfsUrl: uploaded.url,
                dataUrl
            }
        });

    } catch (error) {
        console.error("Generate QR error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to generate QR code"
        });
    }
};

const getQRImage = async (req, res) => {
    try {
        const { batchId } = req.params;

        const batch = await findBatchByCode(batchId);

        if (!batch) {
            return res.status(404).json({
                message: "Batch not found"
            });
        }

        const { buffer } = await generateBatchQR(batchId);

        res.set("Content-Type", "image/png");
        res.set("Cache-Control", "public, max-age=86400");

        res.status(200).send(buffer);

    } catch (error) {
        console.error("Get QR image error:", error);

        res.status(500).json({
            message: "Failed to serve QR code"
        });
    }
};

const verifyBatch = async (req, res) => {
    try {
        const { batchId } = req.params;

        const record = await getBatchTraceability(batchId);

        if (!record) {
            return res.status(404).json({
                message: "Batch not found"
            });
        }

        const uploads = await getUploadsByHerb(record.herb_id);

        const tracking = await getTrackingHistory(record.herb_id);

        const images = uploads
            .filter((item) => item.file_type === "herb_image")
            .map((item) => ({
                cid: item.cid,
                url: getGatewayUrl(item.cid),
                uploadedAt: item.created_at
            }));

        const labReports = uploads
            .filter((item) => item.file_type === "lab_report")
            .map((item) => ({
                cid: item.cid,
                url: getGatewayUrl(item.cid),
                status: item.status,
                uploadedAt: item.created_at
            }));

        res.status(200).json({
            verified: true,
            batch: {
                batchCode: record.batch_code,
                productName: record.product_name,
                quantity: record.quantity,
                qrCid: record.qr_cid,
                verifyUrl: getVerifyUrl(record.batch_code),
                createdAt: record.batch_created_at
            },
            herb: {
                name: record.herb_name,
                description: record.herb_description,
                origin: record.herb_origin,
                currentStatus: record.herb_status,
                registeredAt: record.herb_created_at
            },
            farmer: {
                name: record.farmer_name,
                role: record.farmer_role
            },
            manufacturer: {
                name: record.manufacturer_name,
                role: record.manufacturer_role
            },
            images,
            labReports,
            blockchain: {
                network: "polygon-amoy",
                txHash: record.blockchain_tx_hash
            },
            tracking: tracking.map((item) => ({
                status: item.status,
                updatedByName: item.updated_by_name,
                updatedByRole: item.updated_by_role,
                createdAt: item.created_at
            }))
        });

    } catch (error) {
        console.error("Verify batch error:", error);

        res.status(500).json({
            message: "Failed to verify batch"
        });
    }
};

module.exports = {
    addBatch,
    generateQR,
    getQRImage,
    verifyBatch
};
