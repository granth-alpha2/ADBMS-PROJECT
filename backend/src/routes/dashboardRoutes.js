import { Router } from "express";
import { dashboardController } from "../controllers/transactionController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { accountNumberParam } from "../validators/common.js";

const router = Router();
router.get("/:accountNo", requireAuth, accountNumberParam, validateRequest, asyncHandler(dashboardController));

export default router;
