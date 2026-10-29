import { Router } from "express";
import { performanceController } from "../controllers/performanceController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/", requireAuth, requireRole("ADMIN"), asyncHandler(performanceController));

export default router;
