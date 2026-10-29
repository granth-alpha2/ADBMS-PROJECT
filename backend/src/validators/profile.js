import { body, param } from "express-validator";

export const customerIdParam = param("customerId")
    .matches(/^C\d{3}$/)
    .withMessage("Customer ID must use the C001 format.");

export const profileUpdateRules = [
    body("address.city").optional().isString().trim().isLength({ min: 2, max: 80 }),
    body("address.state").optional().isString().trim().isLength({ min: 2, max: 80 }),
    body("address.pincode").optional().isString().matches(/^\d{6}$/),
    body("preferences.currency").optional().isIn(["INR", "USD", "EUR"]),
    body("preferences.monthly_summary").optional().isBoolean().toBoolean()
];

export const linkedAccountRules = [
    customerIdParam,
    body("accountNo").isString().matches(/^[A-Za-z0-9-]{3,20}$/)
];
