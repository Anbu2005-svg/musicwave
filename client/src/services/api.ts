import axios from "axios";
import type { MusicVideo, OnlinePlaylist, Playlist, StoredSong, User } from "../types";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("musicwave_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message ?? "Request failed";
  }
  return error instanceof Error ? error.message : "Something went wrong";
}

export const authApi = {
  async login(input: { email: string; password: string }) {
    const { data } = await api.post<{ user: User; token: string }>("/auth/login", input);
    return data;
  },
  async me() {
    const { data } = await api.get<{ user: User }>("/auth/me");
    return data.user;
  },
  async updatePreferences(languages: string[]) {
    const { data } = await api.put<{ user: User }>("/auth/preferences", { languages });
    return data.user;
  }
};

export const musicApi = {
  async search(q: string) {
    const { data } = await api.get<{ results: MusicVideo[] }>("/music/search", { params: { q } });
    return data.results;
  },
  async trending() {
    const { data } = await api.get<{ results: MusicVideo[] }>("/music/trending");
    return data.results;
  },
  async details(videoId: string) {
    const { data } = await api.get<{ result: MusicVideo }>(`/music/details/${videoId}`);
    return data.result;
  },
  async recommendations() {
    const { data } = await api.get<{ results: MusicVideo[] }>("/recommendations");
    return data.results;
  },
  async preferred() {
    const { data } = await api.get<{ results: MusicVideo[] }>("/music/preferred");
    return data.results;
  },
  async preferredPlaylists() {
    const { data } = await api.get<{ results: OnlinePlaylist[] }>("/music/preferred-playlists");
    return data.results;
  },
  async playlistSongs(playlistId: string) {
    const { data } = await api.get<{ results: MusicVideo[] }>(`/music/playlists/${playlistId}/songs`);
    return data.results;
  }
};

export const playlistsApi = {
  async list() {
    const { data } = await api.get<{ playlists: Playlist[] }>("/playlists");
    return data.playlists;
  },
  async get(id: string) {
    const { data } = await api.get<{ playlist: Playlist }>(`/playlists/${id}`);
    return data.playlist;
  },
  async create(input: { name: string; description?: string; source?: "USER" | "ONLINE" }) {
    const { data } = await api.post<{ playlist: Playlist }>("/playlists", input);
    return data.playlist;
  },
  async update(id: string, input: { name: string; description?: string }) {
    const { data } = await api.put<{ playlist: Playlist }>(`/playlists/${id}`, input);
    return data.playlist;
  },
  async remove(id: string) {
    await api.delete(`/playlists/${id}`);
  },
  async addSong(id: string, song: MusicVideo) {
    const { data } = await api.post<{ song: StoredSong }>(`/playlists/${id}/songs`, song);
    return data.song;
  },
  async addSongs(id: string, songs: MusicVideo[]) {
    const { data } = await api.post<{ count: number }>(`/playlists/${id}/songs/bulk`, { songs });
    return data.count;
  },
  async removeSong(id: string, videoId: string) {
    await api.delete(`/playlists/${id}/songs/${videoId}`);
  }
};

export const likedApi = {
  async list() {
    const { data } = await api.get<{ songs: StoredSong[] }>("/liked");
    return data.songs;
  },
  async like(song: MusicVideo) {
    const { data } = await api.post<{ song: StoredSong }>("/liked", song);
    return data.song;
  },
  async unlike(videoId: string) {
    await api.delete(`/liked/${videoId}`);
  }
};
