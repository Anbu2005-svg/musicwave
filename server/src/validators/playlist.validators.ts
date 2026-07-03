import { z } from "zod";

export const playlistSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(300).optional().nullable()
});

export const createPlaylistSchema = playlistSchema.extend({
  source: z.enum(["USER", "ONLINE"]).optional()
});
