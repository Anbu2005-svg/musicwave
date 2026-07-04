import { Router } from "express";
import { details, playlistSongs, preferred, preferredPlaylists, search, trending } from "../controllers/music.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { searchLimiter } from "../middleware/rateLimit.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);
router.get("/search", searchLimiter, asyncHandler(search));
router.get("/trending", searchLimiter, asyncHandler(trending));
router.get("/preferred", searchLimiter, asyncHandler(preferred));
router.get("/preferred-playlists", searchLimiter, asyncHandler(preferredPlaylists));
router.get("/playlists/:playlistId/songs", searchLimiter, asyncHandler(playlistSongs));
router.get("/details/:videoId", searchLimiter, asyncHandler(details));

export default router;
