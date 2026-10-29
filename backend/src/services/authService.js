import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { findUserByEmail } from "../repositories/mongoRepository.js";
import { AppError } from "../utils/AppError.js";

export async function login({ email, password }) {
    const user = await findUserByEmail(email);
    if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new AppError(401, "Email or password is incorrect.");
    }
    const token = jwt.sign(
        { sub: user._id.toString(), email: user.email, name: user.name, role: user.role, customerId: user.customerId },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
    );
    return {
        token,
        user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            customerId: user.customerId || null
        }
    };
}
