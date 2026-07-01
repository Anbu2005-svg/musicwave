import { Router } from "express";
import { recommendations } from "../controllers/recommendations.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { searchLimiter } from "../middleware/rateLimit.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", requireAuth, searchLimiter, asyncHandler(recommendations));

export default router;
