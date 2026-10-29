import { getAuditLogs } from "../repositories/oracleRepository.js";
import { listActivityLogs, listUsers, updateUser } from "../repositories/mongoRepository.js";
import { AppError } from "../utils/AppError.js";

export async function readAuditLogs(pagination) {
    return getAuditLogs(pagination);
}

export async function readActivityLogs(pagination) {
    return listActivityLogs(pagination);
}

export async function readUsers() {
    return listUsers();
}

export async function changeUser(userId, actorId, { role, active }) {
    if (userId === actorId && (active === false || role)) {
        throw new AppError(400, "You cannot disable or change the role of your own account.");
    }
    const user = await updateUser(userId, { ...(role ? { role } : {}), ...(active !== undefined ? { active } : {}) });
    if (!user) throw new AppError(404, "User was not found.");
    return user;
}
