const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const herbRoutes = require("./routes/herbRoutes");

const app = express();

app.use(cors());

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
    res.json({
        message: "AyuChain Backend API",
        status: "running",
        databaseConfigured: Boolean(process.env.DATABASE_URL),
        demoVerification: "/api/herbs/public/DEMO-AYU-001"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/herbs", herbRoutes);

module.exports = app;
