export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  languagePreferences?: string[];
  createdAt?: string;
};

export type MusicVideo = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string | null;
  description?: string;
};

export type StoredSong = MusicVideo & {
  id?: string;
  createdAt?: string;
  addedAt?: string;
};

export type Playlist = {
  id: string;
  name: string;
  description?: string | null;
  source?: "USER" | "ONLINE";
  coverImage?: string | null;
  createdAt: string;
  updatedAt: string;
  songs?: StoredSong[];
};

export type OnlinePlaylist = {
  playlistId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string | null;
  description?: string;
  language: string;
  category?: string;
};
