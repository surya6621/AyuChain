const rateLimit = require("express-rate-limit");

const WINDOW_MS = 15 * 60 * 1000;

const buildLimiter = (limit, message) => {
    return rateLimit({
        windowMs: WINDOW_MS,
        limit,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            message
        }
    });
};

const generalLimiter = buildLimiter(
    100,
    "Too many requests. Please try again after 15 minutes."
);

const authLimiter = buildLimiter(
    10,
    "Too many authentication attempts. Please try again after 15 minutes."
);

const uploadLimiter = buildLimiter(
    20,
    "Too many uploads. Please try again after 15 minutes."
);

module.exports = {
    generalLimiter,
    authLimiter,
    uploadLimiter
};
