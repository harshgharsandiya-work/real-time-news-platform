const env = require("../config/env");
const { ZodError, success } = require("zod");
const { Prisma } = require("@prisma/client");

/**
 * Central error handler — must be the LAST app.use() in app.js
 *
 * Handles:
 *  - Zod validation errors    → 400 with field-level details
 *  - Prisma known errors      → 400/404/409 with friendly messages
 *  - JWT errors               → 401
 *  - Generic app errors       → use error.statusCode if set
 *  - Unknown errors           → 500
 */

/* ---------------- ZOD ERROR ---------------- */
const handleZodError = (err, res) => {
    if (!(err instanceof ZodError)) return false;

    res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        })),
    });

    return true;
};

/* ---------------- PRISMA ERROR ---------------- */
const handlePrismaError = (err, res) => {
    if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return false;

    if (err.code === "P2002") {
        const field = err.meta?.target?.[0] ?? "field";

        res.status(409).json({
            success: false,
            message: `A record with this ${field} already exists`,
        });

        return true;
    }

    if (err.code === "P2025") {
        res.status(404).json({
            success: false,
            message: err.meta?.cause ?? "Record not found",
        });

        return true;
    }

    if (err.code === "P2003") {
        res.status(400).json({
            success: false,
            message: "Referenced record does not exist",
        });

        return true;
    }

    return false;
};

/* ---------------- JWT ERROR ---------------- */
const handleJwtError = (err, res) => {
    if (err.name === "JsonWebTokenError") {
        res.status(401).json({ success: false, message: "Invalid token" });
        return true;
    }

    if (err.name === "TokenExpiredError") {
        res.status(401).json({ success: false, message: "Token expired" });
        return true;
    }

    return false;
};

/* ---------------- APP ERROR ---------------- */
const handleAppError = (err, res) => {
    if (!err.statusCode) return false;

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });

    return true;
};

/* ---------------- ERROR HANDLER ---------------- */
const errorHandler = (err, req, res, next) => {
    if (handleZodError(err, res)) return;

    if (handlePrismaError(err, res)) return;

    if (handleJwtError(err, res)) return;

    if (handleAppError(err, res)) return;

    // --- Unknown / Unexpected Error ---
    console.error("[Unhandled Error]: ", err);

    res.status(500).json({
        success: false,
        message: "Internal server error",
        // Only expose stack trace in development
        ...(env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

/**
 * Helper to create a named HTTP error cleanly from any controller/service.
 *
 * Usage:
 *   throw createError(404, "News article not found")
 *   throw createError(400, "Cannot subscribe twice")
 *
 * @param {number} statusCode
 * @param {string} message
 */
const createError = (statusCode, message) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
};

module.exports = { errorHandler, createError };
