import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { getRecommendations } from "../services/recommendation.service.js";
import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../utils/prisma.js";

function requireUser(req: AuthRequest) {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }
  return req.user;
}

export async function recommendations(req: AuthRequest, res: Response) {
  const user = requireUser(req);
  const [likedSongs, playlistSongs] = await Promise.all([
    prisma.likedSong.findMany({ where: { userId: user.id }, take: 25 }),
    prisma.playlistSong.findMany({
      where: { playlist: { userId: user.id } },
      take: 30,
      orderBy: { addedAt: "desc" }
    })
  ]);

  const signals = [...likedSongs, ...playlistSongs];
  const excluded = new Set(likedSongs.map((song) => song.videoId));
  const results = await getRecommendations(signals, excluded, user.languagePreferences);

  res.json({ results });
}
