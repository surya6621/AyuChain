const {
    createHerb,
    getHerbsByFarmer,
    getAllHerbs,
    getHerbsByStatuses,
    findHerbById,
    findHerbByIdentifier,
    updateHerbStatus,
    approveHerbBatch
} = require("../models/herbModel");
const demoBatch = require("../data/demoBatch");
const { createLabReport, getLatestLabReport } = require("../models/labReportModel");

const addHerb = async (req, res) => {
    try {
        const {
            name,
            description,
            origin
        } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Herb name is required"
            });
        }

        const herb = await createHerb(
            name,
            description || null,
            origin || null,
            req.user.id
        );

        res.status(201).json({
            message: "Herb registered successfully",
            herb
        });

    } catch (error) {
        console.error("Add herb error:", error);

        res.status(500).json({
            message: "Failed to register herb"
        });
    }
};

const getMyHerbs = async (req, res) => {
    try {
        const herbs = await getHerbsByFarmer(req.user.id);

        res.status(200).json({
            herbs
        });

    } catch (error) {
        console.error("Get herbs error:", error);

        res.status(500).json({
            message: "Failed to get herbs"
        });
    }
};

const getWorkQueue = async (req, res) => {
    try {
        const role = req.user.role;
        if (role === "farmer") {
            return res.status(200).json({ herbs: await getHerbsByFarmer(req.user.id) });
        }
        if (role === "admin") {
            return res.status(200).json({ herbs: await getAllHerbs() });
        }
        const requiredStatuses = { collector: ["registered"], laboratory: ["collected"], manufacturer: ["laboratory", "manufacturing"] }[role];
        if (!requiredStatuses) return res.status(403).json({ message: "This role has no work queue" });
        res.status(200).json({ herbs: await getHerbsByStatuses(requiredStatuses) });
    } catch (error) {
        console.error("Get work queue error:", error);
        res.status(500).json({ message: "Failed to get work queue" });
    }
};

const getHerb = async (req, res) => {
    try {
        const herb = await findHerbById(req.params.id);

        if (!herb) {
            return res.status(404).json({
                message: "Herb not found"
            });
        }

        res.status(200).json({
            herb
        });

    } catch (error) {
        console.error("Get herb error:", error);

        res.status(500).json({
            message: "Failed to get herb"
        });
    }
};

// This deliberately returns only non-sensitive batch information. It enables
// customers to verify a product from its QR code without an account.
const getPublicHerb = async (req, res) => {
    try {
        if (req.params.id.toUpperCase() === "DEMO-AYU-001") {
            return res.status(200).json(demoBatch);
        }
        const herb = await findHerbByIdentifier(req.params.id);

        if (!herb) {
            return res.status(404).json({ message: "Product batch not found" });
        }

        const report = await getLatestLabReport(herb.id);
        res.status(200).json({
            herb: {
                id: herb.id,
                batch_number: herb.batch_number,
                name: herb.name,
                description: herb.description,
                origin: herb.origin,
                status: herb.status,
                created_at: herb.created_at
            },
            certificate: {
                available: Boolean(report),
                name: report?.original_name || null,
                uploaded_at: report?.created_at || null,
                downloadUrl: report ? `/uploads/${report.file_name}` : null,
                message: report ? "Laboratory report available" : "No laboratory report has been uploaded yet."
            }
        });
    } catch (error) {
        console.error("Public herb lookup error:", error);
        res.status(500).json({ message: "Failed to verify product batch" });
    }
};

const approveBatch = async (req, res) => {
    try {
        const batchNumber = String(req.body.batchNumber || "").trim().toUpperCase();
        if (!/^[A-Z0-9][A-Z0-9-]{2,79}$/.test(batchNumber)) {
            return res.status(400).json({ message: "Batch number must contain 3-80 letters, numbers, or hyphens" });
        }
        const herb = await findHerbById(req.params.id);
        if (!herb) return res.status(404).json({ message: "Herb not found" });
        if (!["laboratory", "manufacturing"].includes(herb.status)) return res.status(400).json({ message: "Only laboratory-cleared or manufacturing batches can be approved" });
        const approvedHerb = await approveHerbBatch(herb.id, batchNumber);
        res.status(200).json({ message: "Batch approved and ready for customers", herb: approvedHerb });
    } catch (error) {
        if (error.code === "23505") return res.status(409).json({ message: "That batch number is already in use" });
        console.error("Batch approval error:", error);
        res.status(500).json({ message: "Failed to approve batch" });
    }
};

const addLabReport = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "A PDF, JPG, or PNG laboratory report is required" });
        const herb = await findHerbById(req.params.id);
        if (!herb) return res.status(404).json({ message: "Herb not found" });
        if (herb.status !== "collected") return res.status(400).json({ message: "Only collected batches can receive a laboratory report" });
        const report = await createLabReport({
            herbId: herb.id,
            laboratoryId: req.user.id,
            originalName: req.file.originalname,
            fileName: req.file.filename,
            mimeType: req.file.mimetype,
            fileSize: req.file.size
        });
        const updatedHerb = await updateHerbStatus(herb.id, "laboratory");
        res.status(201).json({ message: "Laboratory report uploaded and batch passed to manufacturing", report, herb: updatedHerb });
    } catch (error) {
        console.error("Laboratory report upload error:", error);
        res.status(500).json({ message: "Failed to upload laboratory report" });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        const herb = await findHerbById(req.params.id);

        if (!herb) {
            return res.status(404).json({
                message: "Herb not found"
            });
        }

        const allowed = {
            collector: ["collected"],
            laboratory: ["laboratory"],
            manufacturer: ["manufacturing", "ready", "delivered"],
            admin: ["registered", "collected", "laboratory", "manufacturing", "ready", "delivered"]
        };
        if (!allowed[req.user.role]?.includes(status)) {
            return res.status(403).json({ message: "This role cannot set that supply-chain status" });
        }

        const updatedHerb = await updateHerbStatus(
            req.params.id,
            status
        );

        res.status(200).json({
            message: "Herb status updated successfully",
            herb: updatedHerb
        });

    } catch (error) {
        console.error("Update herb status error:", error);

        res.status(500).json({
            message: "Failed to update herb status"
        });
    }
};

module.exports = {
    addHerb,
    getWorkQueue,
    getMyHerbs,
    getHerb,
    getPublicHerb,
    addLabReport,
    approveBatch,
    updateStatus
};
