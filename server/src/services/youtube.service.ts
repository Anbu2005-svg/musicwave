import axios from "axios";
import { ApiError } from "../utils/ApiError.js";

export type MusicVideo = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string | null;
  description: string;
};

export type OnlinePlaylist = {
  playlistId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string | null;
  description: string;
  language: string;
  category?: string;
};

const youtube = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3",
  timeout: 10000
});

function requireApiKey() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new ApiError(503, "YouTube API key is not configured on the server");
  }
  return key;
}

function mapSearchItem(item: any): MusicVideo {
  const snippet = item.snippet ?? {};
  return {
    videoId: item.id?.videoId,
    title: snippet.title ?? "Untitled",
    channelTitle: snippet.channelTitle ?? "Unknown artist",
    thumbnail:
      snippet.thumbnails?.maxres?.url ??
      snippet.thumbnails?.high?.url ??
      snippet.thumbnails?.medium?.url ??
      snippet.thumbnails?.default?.url ??
      "",
    publishedAt: snippet.publishedAt ?? null,
    description: snippet.description ?? ""
  };
}

function mapVideoItem(item: any): MusicVideo {
  const snippet = item.snippet ?? {};
  return {
    videoId: item.id,
    title: snippet.title ?? "Untitled",
    channelTitle: snippet.channelTitle ?? "Unknown artist",
    thumbnail:
      snippet.thumbnails?.maxres?.url ??
      snippet.thumbnails?.high?.url ??
      snippet.thumbnails?.medium?.url ??
      snippet.thumbnails?.default?.url ??
      "",
    publishedAt: snippet.publishedAt ?? null,
    description: snippet.description ?? ""
  };
}

function mapPlaylistVideoItem(item: any): MusicVideo {
  const snippet = item.snippet ?? {};
  return {
    videoId: item.id,
    title: snippet.title ?? "Untitled",
    channelTitle: snippet.channelTitle ?? "Unknown artist",
    thumbnail:
      snippet.thumbnails?.maxres?.url ??
      snippet.thumbnails?.high?.url ??
      snippet.thumbnails?.medium?.url ??
      snippet.thumbnails?.default?.url ??
      "",
    publishedAt: snippet.publishedAt ?? null,
    description: snippet.description ?? ""
  };
}

function mapPlaylistItem(item: any, language: string, category?: string): OnlinePlaylist {
  const snippet = item.snippet ?? {};
  return {
    playlistId: item.id?.playlistId,
    title: snippet.title ?? "Untitled playlist",
    channelTitle: snippet.channelTitle ?? "Unknown channel",
    thumbnail:
      snippet.thumbnails?.maxres?.url ??
      snippet.thumbnails?.high?.url ??
      snippet.thumbnails?.medium?.url ??
      snippet.thumbnails?.default?.url ??
      "",
    publishedAt: snippet.publishedAt ?? null,
    description: snippet.description ?? "",
    language,
    category
  };
}

function handleYoutubeError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 403 || status === 429) {
      throw new ApiError(503, "YouTube service is temporarily unavailable");
    }

    if (status === 404) {
      throw new ApiError(404, "Requested YouTube content was not found");
    }

    throw new ApiError(502, "YouTube API request failed");
  }

  throw error;
}

export async function searchMusic(query: string, maxResults = 20) {
  const key = requireApiKey();

  try {
    const { data } = await youtube.get("/search", {
      params: {
        key,
        part: "snippet",
        q: query,
        type: "video",
        videoCategoryId: "10",
        videoEmbeddable: "true",
        videoSyndicated: "true",
        maxResults
      }
    });

    return (data.items ?? []).map(mapSearchItem).filter((item: MusicVideo) => item.videoId);
  } catch (error) {
    handleYoutubeError(error);
  }
}

export async function getTrendingMusic(maxResults = 20) {
  const key = requireApiKey();

  try {
    const { data } = await youtube.get("/videos", {
      params: {
        key,
        part: "snippet,status",
        chart: "mostPopular",
        videoCategoryId: "10",
        regionCode: "US",
        maxResults
      }
    });

    return (data.items ?? [])
      .filter((item: any) => item.status?.embeddable !== false)
      .map(mapVideoItem);
  } catch (error) {
    handleYoutubeError(error);
  }
}

export async function searchPlaylists(query: string, language: string, maxResults = 8, category?: string) {
  const key = requireApiKey();

  try {
    const { data } = await youtube.get("/search", {
      params: {
        key,
        part: "snippet",
        q: query,
        type: "playlist",
        maxResults
      }
    });

    return (data.items ?? [])
      .map((item: any) => mapPlaylistItem(item, language, category))
      .filter((playlist: OnlinePlaylist) => playlist.playlistId);
  } catch (error) {
    handleYoutubeError(error);
  }
}

export async function getPlaylistSongs(playlistId: string, maxResults = 200) {
  const key = requireApiKey();

  try {
    const ids: string[] = [];
    let pageToken: string | undefined;

    while (ids.length < maxResults) {
      const { data } = await youtube.get("/playlistItems", {
        params: {
          key,
          part: "snippet",
          playlistId,
          maxResults: Math.min(50, maxResults - ids.length),
          pageToken
        }
      });

      ids.push(
        ...(data.items ?? [])
          .map((item: any) => item.snippet?.resourceId?.videoId)
          .filter(Boolean)
      );

      pageToken = data.nextPageToken;
      if (!pageToken) break;
    }

    if (!ids.length) return [];

    const videoItems = [];
    for (let index = 0; index < ids.length; index += 50) {
      const { data: videos } = await youtube.get("/videos", {
        params: {
          key,
          part: "snippet,status",
          id: ids.slice(index, index + 50).join(",")
        }
      });
      videoItems.push(...(videos.items ?? []));
    }

    const byId = new Map(
      videoItems
        .filter((item: any) => item.status?.embeddable !== false)
        .map((item: any) => [item.id, mapPlaylistVideoItem(item)])
    );

    return ids.flatMap((id: string) => {
      const song = byId.get(id);
      return song ? [song] : [];
    });
  } catch (error) {
    handleYoutubeError(error);
  }
}

export async function getVideoDetails(videoId: string) {
  const key = requireApiKey();

  try {
    const { data } = await youtube.get("/videos", {
      params: {
        key,
        part: "snippet,status",
        id: videoId
      }
    });

    const item = (data.items ?? []).find((video: any) => video.status?.embeddable !== false);
    if (!item) {
      throw new ApiError(404, "Music video not found or not embeddable");
    }

    return mapVideoItem(item);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    handleYoutubeError(error);
  }
}
