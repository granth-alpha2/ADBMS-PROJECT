import { body, param } from "express-validator";

export const userIdParam = param("userId").isMongoId().withMessage("User ID must be a MongoDB ObjectId.");
export const userUpdateRules = [
    body("role").optional().isIn(["ADMIN", "TELLER", "CUSTOMER"]),
    body("active").optional().isBoolean().toBoolean(),
    body().custom((value) => {
        if (value.role === undefined && value.active === undefined) {
            throw new Error("Provide a role or active value.");
        }
        return true;
    })
];
