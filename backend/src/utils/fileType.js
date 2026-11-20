const SIGNATURES = [
    {
        mime: "image/jpeg",
        parts: [
            { offset: 0, bytes: [0xff, 0xd8, 0xff] }
        ]
    },
    {
        mime: "image/png",
        parts: [
            { offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }
        ]
    },
    {
        mime: "image/webp",
        parts: [
            { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
            { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }
        ]
    },
    {
        mime: "application/pdf",
        parts: [
            { offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }
        ]
    }
];

const matchesPart = (buffer, part) => {
    if (buffer.length < part.offset + part.bytes.length) {
        return false;
    }

    return part.bytes.every(
        (byte, index) => buffer[part.offset + index] === byte
    );
};

const detectMimeType = (buffer) => {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        return null;
    }

    const match = SIGNATURES.find((signature) =>
        signature.parts.every((part) => matchesPart(buffer, part))
    );

    return match ? match.mime : null;
};

const assertContentMatchesType = (buffer, declaredMimeType, allowedMimeTypes) => {
    const detected = detectMimeType(buffer);

    if (!detected || detected !== declaredMimeType || !allowedMimeTypes.includes(detected)) {
        const error = new Error(
            "File content does not match its type"
        );

        error.statusCode = 400;

        throw error;
    }

    return detected;
};

module.exports = {
    detectMimeType,
    assertContentMatchesType
};
