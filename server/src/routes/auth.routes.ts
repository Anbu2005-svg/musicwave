import { Router } from "express";
import { login, me, updatePreferences } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/login", authLimiter, asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));
router.put("/preferences", requireAuth, asyncHandler(updatePreferences));

export default router;
