import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { getPlaylistSongs, getTrendingMusic, getVideoDetails, searchMusic, searchPlaylists } from "../services/youtube.service.js";
import type { AuthRequest } from "../middleware/auth.js";

const youtubeVideoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
const youtubePlaylistIdPattern = /^[a-zA-Z0-9_-]{10,80}$/;

const playlistDiscoveryCategories = [
  { label: "Latest", query: (language: string) => `${language} latest songs playlist 2026 new releases` },
  { label: "New Songs", query: (language: string) => `${language} new songs playlist 2025 2026` },
  { label: "2024 Hits", query: (language: string) => `${language} songs playlist 2024 hits` },
  { label: "All Time Hits", query: (language: string) => `${language} all time hit songs playlist` },
  { label: "Classics", query: (language: string) => `${language} old classic songs playlist` },
  { label: "90s", query: (language: string) => `${language} 90s songs playlist` },
  { label: "2000s", query: (language: string) => `${language} 2000s songs playlist` },
  { label: "Melody", query: (language: string) => `${language} melody songs playlist` },
  { label: "Dance", query: (language: string) => `${language} dance songs playlist` },
  { label: "Romantic", query: (language: string) => `${language} romantic songs playlist` }
];

export async function search(req: Request, res: Response) {
  const q = String(req.query.q ?? "").trim();
  if (!q) {
    throw new ApiError(400, "Search query is required");
  }
  if (q.length > 100) {
    throw new ApiError(400, "Search query is too long");
  }

  const results = await searchMusic(q);
  res.json({ results });
}

export async function trending(_req: Request, res: Response) {
  const results = await getTrendingMusic();
  res.json({ results });
}

export async function preferred(req: AuthRequest, res: Response) {
  const languages = req.user?.languagePreferences ?? [];
  const queries = languages.length ? languages.map((language) => `${language} songs`) : ["English songs", "Hindi songs"];
  const results = [];
  const seen = new Set<string>();

  for (const query of queries.slice(0, 6)) {
    const songs = await searchMusic(query, 6);
    for (const song of songs) {
      if (!seen.has(song.videoId)) {
        seen.add(song.videoId);
        results.push(song);
      }
    }
  }

  res.json({ results: results.slice(0, 24) });
}

export async function preferredPlaylists(req: AuthRequest, res: Response) {
  const languages = req.user?.languagePreferences?.length ? req.user.languagePreferences : ["English", "Hindi"];
  const results = [];
  const seen = new Set<string>();

  for (const language of languages.slice(0, 6)) {
    for (const category of playlistDiscoveryCategories) {
      const playlists = await searchPlaylists(category.query(language), language, 5, category.label);
      for (const playlist of playlists) {
        if (!seen.has(playlist.playlistId)) {
          seen.add(playlist.playlistId);
          results.push(playlist);
        }
      }
    }
  }

  res.json({ results: results.slice(0, 240) });
}

export async function playlistSongs(req: Request, res: Response) {
  const playlistId = String(req.params.playlistId ?? "").trim();
  if (!youtubePlaylistIdPattern.test(playlistId)) {
    throw new ApiError(400, "Valid playlist ID is required");
  }

  const results = await getPlaylistSongs(playlistId);
  res.json({ results });
}

export async function details(req: Request, res: Response) {
  const videoId = String(req.params.videoId ?? "").trim();
  if (!youtubeVideoIdPattern.test(videoId)) {
    throw new ApiError(400, "Valid video ID is required");
  }

  const result = await getVideoDetails(videoId);
  res.json({ result });
}
