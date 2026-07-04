import { z } from "zod";

const httpUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }, "URL must use http or https");

export const songSchema = z.object({
  videoId: z.string().trim().regex(/^[a-zA-Z0-9_-]{5,40}$/),
  title: z.string().trim().min(1).max(300),
  channelTitle: z.string().trim().min(1).max(200),
  thumbnail: httpUrlSchema,
  publishedAt: z.string().datetime().optional().nullable()
});

export type SongInput = z.infer<typeof songSchema>;
