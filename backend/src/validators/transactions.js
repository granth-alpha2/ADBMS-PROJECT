import { body } from "express-validator";
import { positiveAmount } from "./common.js";

const accountRule = (field) => body(field)
    .matches(/^[A-Za-z0-9-]{3,20}$/)
    .withMessage(`${field} must contain 3 to 20 letters, digits, or hyphens.`);

export const depositRules = [accountRule("accountNo"), positiveAmount];
export const withdrawRules = [accountRule("accountNo"), positiveAmount];
export const transferRules = [
    accountRule("fromAccount"),
    accountRule("toAccount"),
    positiveAmount,
    body("toAccount").custom((value, { req }) => {
        if (value === req.body.fromAccount) throw new Error("Source and destination accounts must differ.");
        return true;
    })
];
