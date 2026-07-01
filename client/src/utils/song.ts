import type { MusicVideo } from "../types";

export function normalizeSong(song: MusicVideo): MusicVideo {
  return {
    videoId: song.videoId,
    title: song.title,
    channelTitle: song.channelTitle,
    thumbnail: song.thumbnail,
    publishedAt: song.publishedAt ?? null,
    description: song.description ?? ""
  };
}

export function relativeDate(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value)
  );
}
