import { validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";

export function validateRequest(request, response, next) {
    const result = validationResult(request);
    if (!result.isEmpty()) {
        return next(new AppError(400, "The request contains invalid fields.", result.array()));
    }
    return next();
}
