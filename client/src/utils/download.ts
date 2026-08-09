import { useDownloadStore } from "../stores/downloadStore";
import type { MusicVideo } from "../types";

export async function downloadSong(song: MusicVideo) {
  return useDownloadStore.getState().downloadTrack(song);
}

export async function downloadPlaylist(songs: MusicVideo[], title?: string) {
  return useDownloadStore.getState().downloadPlaylist(songs, title);
}
