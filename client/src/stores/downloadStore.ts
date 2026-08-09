import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { del, get, set } from "idb-keyval";
import { create } from "zustand";
import { api } from "../services/api";
import { useToastStore } from "./toastStore";
import type { MusicVideo } from "../types";

export type DownloadedTrack = MusicVideo & {
  downloadedAt: number;
  fileSize?: number;
  localPath?: string;
};

type DownloadState = {
  downloadedSongs: DownloadedTrack[];
  downloadingIds: Set<string>;
  init: () => Promise<void>;
  downloadTrack: (song: MusicVideo) => Promise<boolean>;
  downloadPlaylist: (songs: MusicVideo[], playlistTitle?: string) => Promise<void>;
  deleteDownload: (videoId: string) => Promise<void>;
  isDownloaded: (videoId: string) => boolean;
  isDownloading: (videoId: string) => boolean;
  getOfflineAudioUrl: (videoId: string) => Promise<string | null>;
};

const METADATA_KEY = "musicwave_downloaded_metadata";

function loadSavedMetadata(): DownloadedTrack[] {
  try {
    const raw = localStorage.getItem(METADATA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMetadata(songs: DownloadedTrack[]) {
  try {
    localStorage.setItem(METADATA_KEY, JSON.stringify(songs));
  } catch (err) {
    console.error("Failed to save download metadata:", err);
  }
}

async function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}

export const useDownloadStore = create<DownloadState>((setStore, getStore) => ({
  downloadedSongs: loadSavedMetadata(),
  downloadingIds: new Set<string>(),

  init: async () => {
    // Refresh and sync state if needed
    const saved = loadSavedMetadata();
    setStore({ downloadedSongs: saved });
  },

  isDownloaded: (videoId: string) => {
    return getStore().downloadedSongs.some((s) => s.videoId === videoId);
  },

  isDownloading: (videoId: string) => {
    return getStore().downloadingIds.has(videoId);
  },

  downloadTrack: async (song: MusicVideo) => {
    const { isDownloaded, isDownloading, downloadedSongs, downloadingIds } = getStore();
    const showToast = useToastStore.getState().showToast;

    if (isDownloaded(song.videoId)) {
      showToast(`"${song.title.slice(0, 25)}" is already downloaded`);
      return true;
    }

    if (isDownloading(song.videoId)) {
      showToast(`"${song.title.slice(0, 25)}" is currently downloading`);
      return false;
    }

    // Add to downloading set
    const nextDownloading = new Set(downloadingIds);
    nextDownloading.add(song.videoId);
    setStore({ downloadingIds: nextDownloading });

    showToast(`Downloading "${song.title.slice(0, 25)}..."`, "success");

    try {
      // 1. Fetch MP3 stream as Blob from server
      const response = await api.get(`/music/download/${song.videoId}`, {
        params: { title: song.title },
        responseType: "blob",
        timeout: 120000 // 2 min timeout for full song stream
      });

      const blob: Blob = response.data;
      const fileSize = blob.size;

      // 2. Save Blob to IndexedDB for offline playing inside app
      await set(`mw_audio_${song.videoId}`, blob);

      let localPath: string | undefined = undefined;
      const safeTitle = song.title.replace(/[/\\?%*:|"<>]/g, "_").trim() || "song";
      const filename = `${safeTitle}.mp3`;

      // 3. On Native Capacitor Android, also save to phone's Documents/MusicWave folder
      if (Capacitor.isNativePlatform()) {
        try {
          const base64Data = await convertBlobToBase64(blob);
          const savedFile = await Filesystem.writeFile({
            path: `MusicWave/${filename}`,
            data: base64Data,
            directory: Directory.Documents,
            recursive: true
          });
          localPath = savedFile.uri;
        } catch (fsErr) {
          console.warn("Could not write file to device storage:", fsErr);
        }
      } else {
        // 4. On Web browser, trigger standard file download element
        try {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } catch {
          // ignore web anchor error
        }
      }

      // 5. Update metadata list
      const newTrack: DownloadedTrack = {
        ...song,
        downloadedAt: Date.now(),
        fileSize,
        localPath
      };

      const updatedSongs = [newTrack, ...downloadedSongs.filter((s) => s.videoId !== song.videoId)];
      saveMetadata(updatedSongs);

      const finishDownloading = new Set(getStore().downloadingIds);
      finishDownloading.delete(song.videoId);

      setStore({
        downloadedSongs: updatedSongs,
        downloadingIds: finishDownloading
      });

      showToast(`Downloaded "${song.title.slice(0, 25)}"`, "success");
      return true;
    } catch (err) {
      console.error("Download failed:", err);
      showToast(`Failed to download "${song.title.slice(0, 25)}"`, "error");

      const finishDownloading = new Set(getStore().downloadingIds);
      finishDownloading.delete(song.videoId);
      setStore({ downloadingIds: finishDownloading });
      return false;
    }
  },

  downloadPlaylist: async (songs: MusicVideo[], playlistTitle?: string) => {
    const showToast = useToastStore.getState().showToast;

    if (!songs.length) {
      showToast("No songs in playlist to download", "error");
      return;
    }

    const title = playlistTitle ? `"${playlistTitle}"` : "playlist";
    showToast(`Starting download for ${songs.length} songs in ${title}`, "success");

    let count = 0;
    for (const song of songs) {
      const success = await getStore().downloadTrack(song);
      if (success) count++;
    }

    showToast(`Downloaded ${count} of ${songs.length} songs from ${title}`, "success");
  },

  deleteDownload: async (videoId: string) => {
    const showToast = useToastStore.getState().showToast;
    const { downloadedSongs } = getStore();

    try {
      const track = downloadedSongs.find((s) => s.videoId === videoId);

      // Delete from IndexedDB
      await del(`mw_audio_${videoId}`);

      // If native file exists, delete from filesystem
      if (Capacitor.isNativePlatform() && track?.localPath) {
        try {
          const safeTitle = (track.title || "song").replace(/[/\\?%*:|"<>]/g, "_").trim();
          await Filesystem.deleteFile({
            path: `MusicWave/${safeTitle}.mp3`,
            directory: Directory.Documents
          });
        } catch {
          // ignore
        }
      }

      const updated = downloadedSongs.filter((s) => s.videoId !== videoId);
      saveMetadata(updated);
      setStore({ downloadedSongs: updated });
      showToast("Removed from Downloads");
    } catch (err) {
      console.error("Failed to delete download:", err);
      showToast("Failed to remove download", "error");
    }
  },

  getOfflineAudioUrl: async (videoId: string) => {
    try {
      const blob: Blob | undefined = await get(`mw_audio_${videoId}`);
      if (blob) {
        return window.URL.createObjectURL(blob);
      }
    } catch (err) {
      console.error("Failed to load offline blob:", err);
    }
    return null;
  }
}));
