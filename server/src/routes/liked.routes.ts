import { Router } from "express";
import { likeSong, listLikedSongs, unlikeSong } from "../controllers/liked.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);
router.post("/", asyncHandler(likeSong));
router.delete("/:videoId", asyncHandler(unlikeSong));
router.get("/", asyncHandler(listLikedSongs));

export default router;
