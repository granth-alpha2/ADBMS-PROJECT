import { body, param, query } from "express-validator";

export const accountNumberParam = param("accountNo")
    .matches(/^[A-Za-z0-9-]{3,20}$/)
    .withMessage("Account number must contain 3 to 20 letters, digits, or hyphens.");

export const positiveAmount = body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than zero.")
    .toFloat();

export const paginationRules = [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt()
];
