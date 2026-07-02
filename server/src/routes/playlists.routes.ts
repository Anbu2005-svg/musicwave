import { Router } from "express";
import {
  addSong,
  addSongs,
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  listPlaylists,
  removeSong,
  updatePlaylist
} from "../controllers/playlists.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);
router.post("/", asyncHandler(createPlaylist));
router.get("/", asyncHandler(listPlaylists));
router.get("/:id", asyncHandler(getPlaylist));
router.put("/:id", asyncHandler(updatePlaylist));
router.delete("/:id", asyncHandler(deletePlaylist));
router.post("/:id/songs/bulk", asyncHandler(addSongs));
router.post("/:id/songs", asyncHandler(addSong));
router.delete("/:id/songs/:videoId", asyncHandler(removeSong));

export default router;
