import { Router } from "express";
import {
    getProfileController,
    linkedAccountController,
    updateProfileController
} from "../controllers/profileController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { customerIdParam, linkedAccountRules, profileUpdateRules } from "../validators/profile.js";

const router = Router();
const linkedAccount = (action) =>
    asyncHandler((request, response) => linkedAccountController(action, request, response));

router.get("/:customerId", requireAuth, customerIdParam, validateRequest, asyncHandler(getProfileController));
router.patch(
    "/:customerId",
    requireAuth,
    customerIdParam,
    profileUpdateRules,
    validateRequest,
    asyncHandler(updateProfileController)
);
router.post("/:customerId/accounts", requireAuth, linkedAccountRules, validateRequest, linkedAccount("add"));
router.delete("/:customerId/accounts", requireAuth, linkedAccountRules, validateRequest, linkedAccount("remove"));

export default router;
