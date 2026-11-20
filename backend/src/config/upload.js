const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDirectory = path.join(__dirname, "../../uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, `report-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    }
});

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const uploadLabReport = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (allowedTypes.has(file.mimetype)) return callback(null, true);
        callback(new Error("Only PDF, JPG, and PNG reports are accepted"));
    }
});

module.exports = { uploadLabReport, uploadDirectory };
