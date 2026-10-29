import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import {
    accountRoutes,
    adminRoutes,
    analyticsRoutes,
    authRoutes,
    dashboardRoutes,
    performanceRoutes,
    profileRoutes,
    transactionRoutes
} from "./routes/index.js";
import { openApiDocument } from "./openapi.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { sendSuccess } from "./utils/apiResponse.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import { AppError } from "./utils/AppError.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
    origin(origin, callback) {
        if (!origin || env.frontendOrigins.includes(origin)) return callback(null, true);
        return callback(new AppError(403, "This origin is not allowed by the BankSphere API."));
    }
}));
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);
app.use("/api", apiRateLimiter);

app.get("/api/health", asyncHandler(async (request, response) => {
    return sendSuccess(response, {
        message: "BankSphere API is ready.",
        data: { status: "ok", environment: env.nodeEnv },
        db: "none",
        executed: "API health check"
    });
}));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/performance", performanceRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

logger.info("Express application configured", { frontendOrigins: env.frontendOrigins });
