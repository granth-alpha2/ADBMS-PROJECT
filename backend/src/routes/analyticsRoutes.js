import { Router } from "express";
import { analyticsCatalogController, analyticsController } from "../controllers/analyticsController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { param } from "express-validator";

const router = Router();
const reports = [
    "depositsVsWithdrawals",
    "monthlyTrend",
    "topCustomers",
    "spendingByCategory",
    "customerTransactionJoin",
    "suspiciousActivity"
];
router.use(requireAuth, requireRole("ADMIN", "TELLER"));
router.get("/", asyncHandler(analyticsCatalogController));
router.get(
    "/:report",
    param("report").isIn(reports),
    validateRequest,
    asyncHandler(analyticsController)
);

export default router;
