export class AppError extends Error {
    constructor(statusCode, message, details, meta = {}) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.db = meta.db;
        this.executed = meta.executed;
    }
}
