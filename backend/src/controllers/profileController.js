import { editLinkedAccounts, editProfile, readProfile } from "../services/profileService.js";
import { accountBelongsToCustomer } from "../repositories/oracleRepository.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";

function ensureProfileAccess(request, customerId) {
    if (request.user.role === "CUSTOMER" && request.user.customerId !== customerId) {
        throw new AppError(403, "You can only view or edit your own profile.");
    }
}

export async function getProfileController(request, response) {
    ensureProfileAccess(request, request.params.customerId);
    const profile = await readProfile(request.params.customerId);
    return sendSuccess(response, {
        message: "Customer profile loaded.",
        data: profile,
        db: "mongodb",
        executed: "customers findOne by _id"
    });
}

export async function updateProfileController(request, response) {
    ensureProfileAccess(request, request.params.customerId);
    const profile = await editProfile(request.params.customerId, request.body);
    return sendSuccess(response, {
        message: "Customer profile updated.",
        data: profile,
        db: "mongodb",
        executed: "customers $set embedded address/preferences"
    });
}

export async function linkedAccountController(action, request, response) {
    ensureProfileAccess(request, request.params.customerId);
    if (request.user.role === "CUSTOMER" && action === "add" &&
        !(await accountBelongsToCustomer(request.body.accountNo, request.params.customerId))) {
        throw new AppError(403, "You can only link an account that belongs to you.");
    }
    const profile = await editLinkedAccounts(request.params.customerId, request.body.accountNo, action);
    return sendSuccess(response, {
        message: `Linked account ${action === "add" ? "added" : "removed"}.`,
        data: profile,
        db: "mongodb",
        executed: action === "add" ? "customers $addToSet linked_accounts" : "customers $pull linked_accounts"
    });
}
