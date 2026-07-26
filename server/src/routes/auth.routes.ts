import { Router } from "express";
import { login, me, signup, updatePreferences } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/login", authLimiter, asyncHandler(login));
router.post("/signup", authLimiter, asyncHandler(signup));
router.get("/me", requireAuth, asyncHandler(me));
router.put("/preferences", requireAuth, asyncHandler(updatePreferences));

export default router;
