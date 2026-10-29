import { body } from "express-validator";

export const loginRules = [
    body("email").isEmail().normalizeEmail().withMessage("Enter a valid email address."),
    body("password").isString().isLength({ min: 8, max: 128 }).withMessage("Password must be 8 to 128 characters.")
];
