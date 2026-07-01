import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../utils/prisma.js";
import { songSchema } from "../validators/song.validators.js";

function requireUser(req: AuthRequest) {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }
  return req.user;
}

export async function likeSong(req: AuthRequest, res: Response) {
  const user = requireUser(req);
  const input = songSchema.parse(req.body);
  const song = await prisma.likedSong.upsert({
    where: { userId_videoId: { userId: user.id, videoId: input.videoId } },
    update: {
      title: input.title,
      channelTitle: input.channelTitle,
      thumbnail: input.thumbnail,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null
    },
    create: {
      userId: user.id,
      videoId: input.videoId,
      title: input.title,
      channelTitle: input.channelTitle,
      thumbnail: input.thumbnail,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null
    }
  });

  res.status(201).json({ song });
}

export async function unlikeSong(req: AuthRequest, res: Response) {
  const user = requireUser(req);
  await prisma.likedSong.deleteMany({ where: { userId: user.id, videoId: req.params.videoId } });
  res.status(204).send();
}

export async function listLikedSongs(req: AuthRequest, res: Response) {
  const user = requireUser(req);
  const songs = await prisma.likedSong.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });
  res.json({ songs });
}
