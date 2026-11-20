const notFound = (req, res) => {
    res.status(404).json({
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const statusCode = error.statusCode || error.status || 500;

    console.error("Unhandled error:", error);

    const body = {
        message:
            statusCode >= 500
                ? "Internal server error"
                : error.message || "Request failed"
    };

    if (process.env.NODE_ENV !== "production") {
        body.error = error.message;
        body.stack = error.stack;
    }

    res.status(statusCode).json(body);
};

module.exports = {
    notFound,
    errorHandler
};
