const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { verifyFirebaseToken } = require("../config/firebase");
const env = require("../config/env");

/**
 * Extracts the Bearer token from the Authorization header.
 * Returns null if the header is missing or malformed.
 */
const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader && !authHeader.startsWith("Bearer ")) return null;
    return authHeader.split(" ")[1];
};

/**
 * Tries to verify a Firebase ID token.
 * Returns decoded payload or null
 */
const tryVerifyFirebaseToken = async (token) => {
    try {
        return await verifyFirebaseToken(token);
    } catch (error) {
        return null;
    }
};

/**
 * Tries to verify a custom JWT.
 * Returns decoded payload or null
 */
const tryVerifyJwtToken = async (token) => {
    try {
        return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * Auth Middleware
 * 1. Extract Bearer token
 * 2. Verify Firebase Auth
 * 3. Verify custom JWT
 * 4. Neither work -> 401 Unauthorized
 *
 * req.user: { uid, email, name, role }
 */
const authenticate = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message:
                    "No token provided. Include Authorization: Bearer <token>",
            });
        }

        let uid = null;
        let tokenType = null;

        // --- Strategy 1: Firebase ID Token ---
        const firebaseDecoded = await tryVerifyFirebaseToken(token);
        if (firebaseDecoded) {
            uid = firebaseDecoded.uid;
            tokenType = "firebase";
        }

        // --- Strategy 2: Custom JWT ---
        if (!uid) {
            const jwtDecoded = await tryVerifyJwtToken(token);
            if (jwtDecoded) {
                uid = jwtDecoded.uid;
                tokenType = "jwt";
            }
        }

        // --- Neither worked ---
        if (!uid) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        // --- Load user from DB ---
        const user = await prisma.user.findUnique({
            where: { uid },
            select: { uid: true, name: true, email: true, role: true },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Please register first.",
            });
        }

        req.user = { ...user, tokenType };
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Optional Auth
 * Used for public routes that behave differently for logged-in users.
 * Sets req.user = null if unauthenticated.
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            req.user = null;
            return next();
        }

        let uid = null;

        const firebaseDecoded = await tryVerifyFirebaseToken(token);
        if (firebaseDecoded) uid = firebaseDecoded.uid;

        if (!uid) {
            const jwtDecoded = await tryVerifyJwtToken(token);
            if (jwtDecoded) uid = jwtDecoded.uid;
        }

        if (!uid) {
            req.user = null;
            return next();
        }

        const user = await prisma.user.findUnique({
            where: {
                uid,
            },
            select: {
                uid: true,
                name: true,
                email: true,
                role: true,
            },
        });

        req.user = user ?? null;
        next();
    } catch {
        req.user = null;
        next();
    }
};

module.exports = { authenticate, optionalAuth };
