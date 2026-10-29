import { Router } from "express";
import {
    historyController,
    transactionController
} from "../controllers/transactionController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { historyRules } from "../validators/history.js";
import { depositRules, transferRules, withdrawRules } from "../validators/transactions.js";

const router = Router();
const bankingStaff = [requireAuth, requireRole("ADMIN", "TELLER")];
const operation = (name) => asyncHandler((request, response) => transactionController(name, request, response));

router.post("/deposit", bankingStaff, depositRules, validateRequest, operation("deposit"));
router.post("/withdraw", bankingStaff, withdrawRules, validateRequest, operation("withdraw"));
router.post("/transfer", bankingStaff, transferRules, validateRequest, operation("transfer"));
router.get("/", requireAuth, historyRules, validateRequest, asyncHandler(historyController));
export default router;
