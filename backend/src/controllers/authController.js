const bcrypt = require("bcryptjs");

const {
    createUser,
    findUserByEmail
} = require("../models/userModel");

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters"
            });
        }

        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await createUser(
            name,
            email,
            hashedPassword,
            role || "customer"
        );

        res.status(201).json({
            message: "User registered successfully",
            user
        });

    } catch (error) {
        console.error("========== REGISTRATION ERROR ==========");
        console.error(error);
        console.error("========================================");

        res.status(500).json({
            message: "Registration failed"
        });
    }
};

module.exports = {
    register
};
