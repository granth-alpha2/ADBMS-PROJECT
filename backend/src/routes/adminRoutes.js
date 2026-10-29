import { Router } from "express";
import {
    activityLogsController,
    auditLogsController,
    updateUserController,
    usersController
} from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginationRules } from "../validators/common.js";
import { userIdParam, userUpdateRules } from "../validators/admin.js";

const router = Router();
router.use(requireAuth, requireRole("ADMIN"));
router.get("/audit-logs", paginationRules, validateRequest, asyncHandler(auditLogsController));
router.get("/activity-logs", paginationRules, validateRequest, asyncHandler(activityLogsController));
router.get("/users", asyncHandler(usersController));
router.patch(
    "/users/:userId",
    userIdParam,
    userUpdateRules,
    validateRequest,
    asyncHandler(updateUserController)
);

export default router;
