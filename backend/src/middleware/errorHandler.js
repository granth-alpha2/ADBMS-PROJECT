import { logger } from "../config/logger.js";
import { AppError } from "../utils/AppError.js";

const oracleErrors = {
    20001: { status: 400, message: "Insufficient funds for this transaction." },
    20002: { status: 409, message: "The account is frozen or closed." },
    20003: { status: 400, message: "Transaction amount must be greater than zero." },
    20004: { status: 404, message: "The requested account was not found." },
    20005: { status: 400, message: "Source and destination accounts must be different." },
    20006: { status: 400, message: "The supplied rate is invalid." },
    20007: { status: 400, message: "The supplied month is invalid." }
};

export function notFoundHandler(request, response, next) {
    next(new AppError(404, `Route ${request.method} ${request.originalUrl} was not found.`));
}

export function errorHandler(error, request, response, next) {
    const oracleError = oracleErrors[error.errorNum];
    const statusCode = error.statusCode || oracleError?.status ||
        (error.type === "entity.parse.failed" ? 400 : 500);
    if (statusCode >= 500) {
        logger.error("Request failed", {
            method: request.method,
            path: request.originalUrl,
            error: error.message,
            stack: error.stack
        });
    }

    return response.status(statusCode).json({
        success: false,
        message: statusCode >= 500 ? "An unexpected server error occurred." : (oracleError?.message || error.message),
        data: null,
        meta: {
            db: error.db || (oracleError ? "oracle" : "none"),
            executed: error.executed || (oracleError ? `Oracle PL/SQL raised ORA-${error.errorNum}` : "request validation"),
            ...(error.details ? { details: error.details } : {})
        }
    });
}
