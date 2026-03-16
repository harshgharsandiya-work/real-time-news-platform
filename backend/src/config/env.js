const { z } = require("zod");
require("dotenv").config();

const envSchema = z.object({
    // Server
    PORT: z.string().default("5000"),
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    // Database
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    // Firebase Admin SDK
    FIREBASE_PRIVATE_KEY: z.string().min(1, "FIREBASE_PRIVATE_KEY is required"),

    // Custom JWT
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    JWT_EXPIRES_IN: z.string().default("7d"),

    // App
    FRONTEND_URL: z.string().url().default("http://localhost:5173"),
    ADMIN_URL: z.string().url().default("http://localhost:5174"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.log("Invalid Environment Variables:\n");
    parsed.error.issues.forEach((issue) => {
        console.error(`* ${issue.path.join(".")} - ${issue.message}`);
    });

    process.exit(1);
}

module.exports = parsed.data;
