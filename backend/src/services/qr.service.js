const QRCode = require("qrcode");

const { uploadFile } = require("./ipfs.service");

const QR_OPTIONS = {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512
};

const getVerifyUrl = (batchCode) => {
    const frontendUrl = (
        process.env.FRONTEND_URL || "http://localhost:3000"
    ).replace(/\/+$/, "");

    return `${frontendUrl}/verify/${batchCode}`;
};

const generateBatchQR = async (batchCode, options = {}) => {
    const { asDataUrl = false } = options;

    const verifyUrl = getVerifyUrl(batchCode);

    const buffer = await QRCode.toBuffer(verifyUrl, QR_OPTIONS);

    const result = {
        verifyUrl,
        buffer
    };

    if (asDataUrl) {
        result.dataUrl = await QRCode.toDataURL(
            verifyUrl,
            QR_OPTIONS
        );
    }

    return result;
};

const uploadBatchQR = async (batchCode, buffer) => {
    return uploadFile(
        buffer,
        `ayuchain-batch-${batchCode}.png`,
        "image/png"
    );
};

module.exports = {
    getVerifyUrl,
    generateBatchQR,
    uploadBatchQR
};
