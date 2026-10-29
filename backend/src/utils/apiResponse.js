export function sendSuccess(response, { message, data, status = 200, db, executed, extraMeta = {} }) {
    return response.status(status).json({
        success: true,
        message,
        data,
        meta: { db, executed, ...extraMeta }
    });
}
