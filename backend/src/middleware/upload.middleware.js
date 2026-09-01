const path = require("path");
const multer = require("multer");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const IMAGE_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"]
};

const REPORT_TYPES = {
    "application/pdf": [".pdf"]
};

const buildFileFilter = (allowedTypes) => {
    return (req, file, cb) => {
        const extensions = allowedTypes[file.mimetype];

        if (!extensions) {
            const error = new Error(
                `Unsupported file type. Allowed: ${Object.keys(allowedTypes).join(", ")}`
            );

            error.statusCode = 400;

            return cb(error);
        }

        const extension = path
            .extname(file.originalname || "")
            .toLowerCase();

        if (!extensions.includes(extension)) {
            const error = new Error(
                `File extension does not match its content type. Allowed: ${extensions.join(", ")}`
            );

            error.statusCode = 400;

            return cb(error);
        }

        cb(null, true);
    };
};

const buildUploader = (allowedTypes) => {
    return multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: MAX_FILE_SIZE,
            files: 1
        },
        fileFilter: buildFileFilter(allowedTypes)
    });
};

const uploadImage = buildUploader(IMAGE_TYPES).single("file");

const uploadReport = buildUploader(REPORT_TYPES).single("file");

const handleUploadErrors = (uploader) => {
    return (req, res, next) => {
        uploader(req, res, (error) => {
            if (!error) {
                return next();
            }

            if (error instanceof multer.MulterError) {
                if (error.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        message: "File is larger than the 5MB limit"
                    });
                }

                return res.status(400).json({
                    message: `File upload failed: ${error.message}`
                });
            }

            return res.status(error.statusCode || 400).json({
                message: error.message
            });
        });
    };
};

module.exports = {
    MAX_FILE_SIZE,
    uploadHerbImage: handleUploadErrors(uploadImage),
    uploadLabReport: handleUploadErrors(uploadReport)
};
