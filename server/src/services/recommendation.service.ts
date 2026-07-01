import { searchMusic, type MusicVideo } from "./youtube.service.js";

const fallbackQueries = [
  "top songs",
  "latest music",
  "pop music",
  "lofi music"
];

const stopWords = new Set([
  "official",
  "video",
  "lyrics",
  "lyric",
  "audio",
  "song",
  "music",
  "feat",
  "ft",
  "the",
  "and",
  "with"
]);

type SongSignal = {
  videoId: string;
  title: string;
  channelTitle: string;
};

function languageQueries(languagePreferences: string[]) {
  return languagePreferences.map((language) => `${language} latest songs`);
}

export function buildRecommendationQueries(signals: SongSignal[], languagePreferences: string[] = []) {
  const preferredQueries = languageQueries(languagePreferences);

  if (!signals.length) {
    return preferredQueries.length ? preferredQueries : [...fallbackQueries, "English songs", "Hindi songs"];
  }

  const counts = new Map<string, number>();

  for (const signal of signals) {
    const words = `${signal.title} ${signal.channelTitle}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    for (const word of words) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  const keywords = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => `${word} music`);

  return [...preferredQueries, ...(keywords.length ? keywords : fallbackQueries)];
}

export async function getRecommendations(signals: SongSignal[], excludedVideoIds: Set<string>, languagePreferences: string[] = []) {
  const queries = buildRecommendationQueries(signals, languagePreferences);
  const videos: MusicVideo[] = [];
  const seen = new Set<string>(excludedVideoIds);

  for (const query of queries.slice(0, 4)) {
    const results = await searchMusic(query, 8);
    for (const video of results) {
      if (!seen.has(video.videoId)) {
        seen.add(video.videoId);
        videos.push(video);
      }
    }
  }

  return videos.slice(0, 24);
}
