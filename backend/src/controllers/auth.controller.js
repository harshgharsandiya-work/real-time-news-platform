const { z } = require("zod");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma"); // Adjust path as needed
const env = require("../config/env");
const { verifyFirebaseToken } = require("../config/firebase"); // Adjust path as needed
const { createError } = require("../middleware/errorHandler"); // Adjust path as needed

/* ---------------- ZOD SCHEMAS ---------------- */
const registerSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    fcmToken: z.string().optional(),
    platform: z.enum(["web", "android", "ios"]).default("web"),
});

const loginSchema = z.object({
    fcmToken: z.string().optional(),
    platform: z.enum(["web", "android", "ios"]).default("web"),
});

/* ---------------- CONTROLLERS ---------------- */

/**
 * @desc    Register a new user after successful Firebase client-side auth
 * @route   POST /api/auth/register
 * @access  Public (Requires Firebase token in header)
 */
const register = async (req, res, next) => {
    try {
        // 1. Manually extract and verify Firebase token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw createError(
                401,
                "No token provided. Include Authorization: Bearer <firebase_token>",
            );
        }

        const token = authHeader.split(" ")[1];
        let firebaseUser;

        try {
            firebaseUser = await verifyFirebaseToken(token);
        } catch (err) {
            throw createError(401, "Invalid or expired Firebase token");
        }

        // 2. Validate request body (Zod error is caught by global error handler)
        const { name, fcmToken, platform } = registerSchema.parse(req.body);

        // 3. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { uid: firebaseUser.uid },
        });

        if (existingUser) {
            throw createError(
                409,
                "User already exists. Please login instead.",
            );
        }

        // 4. Create User, NotificationPreferences, and FCM Token (if provided)
        const newUser = await prisma.user.create({
            data: {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: name || firebaseUser.name || null,

                // Nested write to automatically create default preferences
                notificationPreferences: {
                    create: {},
                },

                // Nested write to save FCM token if client sends it on registration
                ...(fcmToken && {
                    fcmTokens: {
                        create: {
                            token: fcmToken,
                            platform: platform,
                        },
                    },
                }),
            },
            select: { uid: true, email: true, name: true, role: true },
        });

        // 5. Generate custom JWT
        const customJwt = jwt.sign(
            { uid: newUser.uid, role: newUser.role },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN },
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: newUser,
                token: customJwt, // Client should store and use this moving forward
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login existing user and exchange Firebase token for Custom JWT
 * @route   POST /api/auth/login
 * @access  Public (Requires Firebase token in header)
 */
const login = async (req, res, next) => {
    console.log("hello");
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw createError(401, "No token provided.");
        }

        const token = authHeader.split(" ")[1];
        let firebaseUser;

        try {
            firebaseUser = await verifyFirebaseToken(token);
        } catch (err) {
            throw createError(401, "Invalid or expired Firebase token");
        }

        const { fcmToken, platform } = loginSchema.parse(req.body);

        // Check if user exists in our DB
        const user = await prisma.user.findUnique({
            where: { uid: firebaseUser.uid },
        });

        if (!user) {
            throw createError(
                404,
                "User profile not found. Please register first.",
            );
        }

        // Upsert FCM token if provided during login
        if (fcmToken) {
            await prisma.fcmToken.upsert({
                where: { token: fcmToken },
                update: { userId: user.uid, platform, isActive: true },
                create: { token: fcmToken, userId: user.uid, platform },
            });
        }

        // Generate Custom JWT
        const customJwt = jwt.sign(
            { uid: user.uid, role: user.role },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN },
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user,
                token: customJwt,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private (Requires authenticate middleware)
 */
const getMe = async (req, res, next) => {
    try {
        // req.user is already populated by your authenticate middleware

        // Optionally fetch more details like notification preferences
        const userProfile = await prisma.user.findUnique({
            where: { uid: req.user.uid },
            include: {
                notificationPreferences: true,
                topicSubscriptions: {
                    include: { topic: true },
                },
            },
        });

        res.status(200).json({
            success: true,
            data: {
                user: userProfile,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
};
