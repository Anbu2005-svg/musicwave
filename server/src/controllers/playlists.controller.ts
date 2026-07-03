import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../utils/prisma.js";
import { createPlaylistSchema, playlistSchema } from "../validators/playlist.validators.js";
import { songSchema } from "../validators/song.validators.js";

function requireUser(req: AuthRequest) {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }
  return req.user;
}

async function findOwnedPlaylist(id: string, userId: string) {
  const playlist = await prisma.playlist.findFirst({
    where: { id, userId },
    include: { songs: { orderBy: { addedAt: "asc" } } }
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return playlist;
}

function withCover<T extends { songs?: { thumbnail: string }[] }>(playlist: T) {
  return {
    ...playlist,
    coverImage: playlist.songs?.[0]?.thumbnail ?? null
  };
}

export async function createPlaylist(req: AuthRequest, res: Response) {
  const user = requireUser(req);
  const input = createPlaylistSchema.parse(req.body);
  const playlist = await prisma.playlist.create({
    data: { ...input, userId: user.id, source: input.source ?? "USER" },
    include: { songs: true }
  });

  res.status(201).json({ playlist: withCover(playlist) });
}

export async function listPlaylists(req: AuthRequest, res: Response) {
  const user = requireUser(req);
  const playlists = await prisma.playlist.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { songs: { orderBy: { addedAt: "asc" } } }
  });

  res.json({ playlists: playlists.map(withCover) });
}

export async function getPlaylist(req: AuthRequest, res: Response) {
  const user = requireUser(req);
  const playlist = await findOwnedPlaylist(req.params.id, user.id);
  res.json({ playlist: withCover(playlist) });
}

export async function updatePlaylist(req: AuthRequest, res: Response) {
  const user = requireUser(req);
  await findOwnedPlaylist(req.params.id, user.id);
  const input = playlistSchema.parse(req.body);
  const playlist = await prisma.playlist.update({
    where: { id: req.params.id },
    data: input,
    include: { songs: { orderBy: { addedAt: "asc" } } }
  });

  res.json({ playlist: withCover(playlist) });
}

export async function deletePlaylist(req: AuthRequest, res: Response) {
  const user = requireUser(req);
  await findOwnedPlaylist(req.params.id, user.id);
  await prisma.playlist.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

export async function addSong(req: AuthRequest, res: Response) {
  const user = requireUser(req);
  await findOwnedPlaylist(req.params.id, user.id);
  const input = songSchema.parse(req.body);
  const song = await prisma.playlistSong.upsert({
    where: {
      playlistId_videoId: {
        playlistId: req.params.id,
        videoId: input.videoId
      }
    },
    update: {
      title: input.title,
      channelTitle: input.channelTitle,
      thumbnail: input.thumbnail,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null
    },
    create: {
      playlistId: req.params.id,
      videoId: input.videoId,
      title: input.title,
      channelTitle: input.channelTitle,
      thumbnail: input.thumbnail,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null
    }
  });

  await prisma.playlist.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
  res.status(201).json({ song });
}

export async function addSongs(req: AuthRequest, res: Response) {
  const user = requireUser(req);
  await findOwnedPlaylist(req.params.id, user.id);
  const input = songSchema.array().min(1).max(250).parse(req.body.songs);
  const songs = input.map((song) => ({
    playlistId: req.params.id,
    videoId: song.videoId,
    title: song.title,
    channelTitle: song.channelTitle,
    thumbnail: song.thumbnail,
    publishedAt: song.publishedAt ? new Date(song.publishedAt) : null
  }));

  const result = await prisma.playlistSong.createMany({
    data: songs,
    skipDuplicates: true
  });

  await prisma.playlist.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
  res.status(201).json({ count: result.count });
}

export async function removeSong(req: AuthRequest, res: Response) {
  const user = requireUser(req);
  await findOwnedPlaylist(req.params.id, user.id);
  await prisma.playlistSong.deleteMany({
    where: { playlistId: req.params.id, videoId: req.params.videoId }
  });
  res.status(204).send();
}
