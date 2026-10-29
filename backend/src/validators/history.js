import { query } from "express-validator";
import { paginationRules } from "./common.js";

export const historyRules = [
    ...paginationRules,
    query("accountNo").optional().matches(/^[A-Za-z0-9-]{3,20}$/),
    query("type").optional().isIn(["DEPOSIT", "WITHDRAW", "TRANSFER"]),
    query("search").optional().isString().trim().isLength({ max: 80 }),
    query("sortBy").optional().isIn(["date", "amount", "type", "merchant"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
    query("minAmount").optional().isFloat({ min: 0 }).toFloat()
];
