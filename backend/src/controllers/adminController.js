import {
    changeUser,
    readActivityLogs,
    readAuditLogs,
    readUsers
} from "../services/adminService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export async function auditLogsController(request, response) {
    const page = Number(request.query.page || 1);
    const limit = Number(request.query.limit || 20);
    const result = await readAuditLogs({ page, limit });
    return sendSuccess(response, {
        message: "Oracle audit log loaded.",
        data: result.rows,
        db: "oracle",
        executed: "SELECT audit_log ORDER BY changed_at",
        extraMeta: { page, limit, total: result.total }
    });
}

export async function activityLogsController(request, response) {
    const page = Number(request.query.page || 1);
    const limit = Number(request.query.limit || 20);
    const result = await readActivityLogs({ page, limit });
    return sendSuccess(response, {
        message: "MongoDB activity logs loaded.",
        data: result.rows,
        db: "mongodb",
        executed: "activity_logs find + sort/skip/limit",
        extraMeta: { page, limit, total: result.total }
    });
}

export async function usersController(request, response) {
    const users = await readUsers();
    return sendSuccess(response, {
        message: "Application users loaded.",
        data: users,
        db: "mongodb",
        executed: "app_users find without passwordHash"
    });
}

export async function updateUserController(request, response) {
    const user = await changeUser(request.params.userId, request.user.sub, request.body);
    return sendSuccess(response, {
        message: "Application user updated.",
        data: user,
        db: "mongodb",
        executed: "app_users $set role/active"
    });
}
