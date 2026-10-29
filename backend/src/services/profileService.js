import {
    changeLinkedAccount,
    getProfile,
    updateProfile
} from "../repositories/mongoRepository.js";
import { AppError } from "../utils/AppError.js";

export async function readProfile(customerId) {
    const profile = await getProfile(customerId);
    if (!profile) throw new AppError(404, "Customer profile was not found.");
    return profile;
}

export async function editProfile(customerId, fields) {
    if (Object.keys(fields).length === 0) {
        throw new AppError(400, "Provide at least one profile field to update.");
    }
    const update = {};
    for (const [section, values] of Object.entries(fields)) {
        for (const [key, value] of Object.entries(values)) {
            update[`${section}.${key}`] = value;
        }
    }
    const profile = await updateProfile(customerId, update);
    if (!profile) throw new AppError(404, "Customer profile was not found.");
    return profile;
}

export async function editLinkedAccounts(customerId, accountNo, action) {
    const found = await changeLinkedAccount(customerId, accountNo, action);
    if (!found) throw new AppError(404, "Customer profile was not found.");
    return readProfile(customerId);
}
