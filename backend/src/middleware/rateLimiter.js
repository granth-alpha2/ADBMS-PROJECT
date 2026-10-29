import rateLimit from "express-rate-limit";

export const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again shortly.",
        data: null,
        meta: { db: "none", executed: "API rate limit" }
    }
});

export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please wait before trying again.",
        data: null,
        meta: { db: "mongodb", executed: "login rate limit" }
    }
});
