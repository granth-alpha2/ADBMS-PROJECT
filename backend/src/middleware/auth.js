import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export function requireAuth(request, response, next) {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
        return next(new AppError(401, "A valid bearer token is required."));
    }
    try {
        request.user = jwt.verify(authorization.slice(7), env.jwtSecret);
        return next();
    } catch {
        return next(new AppError(401, "The access token is invalid or expired."));
    }
}

export function requireRole(...allowedRoles) {
    return function checkRole(request, response, next) {
        if (!request.user || !allowedRoles.includes(request.user.role)) {
            return next(new AppError(403, "Your role cannot access this resource."));
        }
        return next();
    };
}
