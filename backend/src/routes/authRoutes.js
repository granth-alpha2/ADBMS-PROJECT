import { Router } from "express";
import { loginController } from "../controllers/authController.js";
import { loginRateLimiter } from "../middleware/rateLimiter.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { loginRules } from "../validators/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.post("/login", loginRateLimiter, loginRules, validateRequest, asyncHandler(loginController));

export default router;
