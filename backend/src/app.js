const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const herbRoutes = require("./routes/herbRoutes");
const uploadRoutes = require("./routes/upload.routes");
const qrRoutes = require("./routes/qr.routes");
const verifyRoutes = require("./routes/verify.routes");
const healthRoutes = require("./routes/health.routes");

const {
    generalLimiter,
    authLimiter,
    uploadLimiter
} = require("./middleware/rateLimit.middleware");

const {
    notFound,
    errorHandler
} = require("./middleware/error.middleware");

const app = express();

app.set("trust proxy", 1);

app.disable("x-powered-by");

app.use(helmet({
    crossOriginResourcePolicy: {
        policy: "cross-origin"
    }
}));

const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:3000"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
}));

app.use(express.json({ limit: "1mb" }));

app.use(generalLimiter);

app.get("/", (req, res) => {
    res.json({
        message: "AyuChain Backend API",
        status: "running"
    });
});

app.use("/api/health", healthRoutes);

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/herbs", herbRoutes);
app.use("/api/upload", uploadLimiter, uploadRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/verify", verifyRoutes);

app.use(notFound);

app.use(errorHandler);

module.exports = app;
