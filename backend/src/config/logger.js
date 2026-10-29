export const logger = {
    info(message, details = {}) {
        console.info(JSON.stringify({ level: "info", message, ...details, timestamp: new Date().toISOString() }));
    },
    warn(message, details = {}) {
        console.warn(JSON.stringify({ level: "warn", message, ...details, timestamp: new Date().toISOString() }));
    },
    error(message, details = {}) {
        console.error(JSON.stringify({ level: "error", message, ...details, timestamp: new Date().toISOString() }));
    }
};
