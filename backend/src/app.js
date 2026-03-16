const express = require("express");
const cors = require("cors");
const env = require("./config/env");

const app = express();

//middleware
const allowedOrigins = [env.FRONTEND_URL, env.ADMIN_URL];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error("CORS origin not allowed"));
        },
    }),
);
app.use(express.json());

const routes = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");

// Routes
app.use("/api", routes);

// Error Handler (must be last)
app.use(errorHandler);

module.exports = app;
