import { z } from "zod";

export const songSchema = z.object({
  videoId: z.string().trim().min(5).max(40),
  title: z.string().trim().min(1).max(300),
  channelTitle: z.string().trim().min(1).max(200),
  thumbnail: z.string().trim().url(),
  publishedAt: z.string().datetime().optional().nullable()
});

export type SongInput = z.infer<typeof songSchema>;
