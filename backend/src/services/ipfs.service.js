const { PinataSDK } = require("pinata");

let pinataClient = null;

const getClient = () => {
    if (pinataClient) {
        return pinataClient;
    }

    if (!process.env.PINATA_JWT) {
        throw new Error("PINATA_JWT is not configured");
    }

    pinataClient = new PinataSDK({
        pinataJwt: process.env.PINATA_JWT,
        pinataGateway: process.env.PINATA_GATEWAY
    });

    return pinataClient;
};

const getGatewayUrl = (cid) => {
    const gateway =
        process.env.PINATA_GATEWAY || "gateway.pinata.cloud";

    const host = gateway
        .replace(/^https?:\/\//, "")
        .replace(/\/+$/, "");

    return `https://${host}/ipfs/${cid}`;
};

const toFile = (buffer, filename, mimetype) => {
    const FileClass =
        typeof File !== "undefined"
            ? File
            : require("buffer").File;

    return new FileClass(
        [buffer],
        filename,
        { type: mimetype }
    );
};

const uploadFile = async (buffer, filename, mimetype) => {
    try {
        const client = getClient();

        const file = toFile(buffer, filename, mimetype);

        const result = await client.upload.public.file(file);

        return {
            cid: result.cid,
            url: getGatewayUrl(result.cid),
            size: result.size || buffer.length
        };

    } catch (error) {
        console.error("IPFS file upload error:", error.message);

        const uploadError = new Error(
            "Failed to upload file to IPFS"
        );

        uploadError.statusCode = 502;

        throw uploadError;
    }
};

const uploadJSON = async (data) => {
    try {
        const client = getClient();

        const result = await client.upload.public.json(data);

        return result.cid;

    } catch (error) {
        console.error("IPFS JSON upload error:", error.message);

        const uploadError = new Error(
            "Failed to upload JSON to IPFS"
        );

        uploadError.statusCode = 502;

        throw uploadError;
    }
};

module.exports = {
    uploadFile,
    uploadJSON,
    getGatewayUrl
};
