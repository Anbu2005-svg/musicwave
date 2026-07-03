import { create } from "zustand";
import type { MusicVideo } from "../types";

export type PlaybackQuality = "small" | "medium" | "large" | "hd720" | "default";

type PlayerState = {
  current: MusicVideo | null;
  queue: MusicVideo[];
  history: MusicVideo[];
  isPlaying: boolean;
  volume: number;
  playbackQuality: PlaybackQuality;
  skipSeconds: number;
  currentTime: number;
  duration: number;
  seekRequest: { id: number; seconds: number; absolute?: boolean } | null;
  repeatCurrent: boolean;
  sleepTimerEndsAt: number | null;
  queueOpen: boolean;
  playTrack: (track: MusicVideo, queue?: MusicVideo[]) => void;
  togglePlay: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  addToQueue: (track: MusicVideo) => void;
  playNext: (track: MusicVideo) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  shuffleQueue: () => void;
  toggleRepeat: () => void;
  startSleepTimer: (minutes: number) => void;
  clearSleepTimer: () => void;
  removeFromQueue: (videoId: string) => void;
  clearQueue: () => void;
  seekBy: (seconds: number) => void;
  seekTo: (seconds: number) => void;
  setPlaybackTime: (currentTime: number, duration: number) => void;
  setPlaybackQuality: (quality: PlaybackQuality) => void;
  setSkipSeconds: (seconds: number) => void;
  setVolume: (volume: number) => void;
  setQueueOpen: (open: boolean) => void;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  current: null,
  queue: [],
  history: [],
  isPlaying: false,
  volume: 70,
  playbackQuality: (localStorage.getItem("musicwave_playback_quality") as PlaybackQuality | null) ?? "small",
  skipSeconds: 10,
  currentTime: 0,
  duration: 0,
  seekRequest: null,
  repeatCurrent: false,
  sleepTimerEndsAt: null,
  queueOpen: false,
  playTrack: (track, queue = []) =>
    set((state) => ({
      current: track,
      queue,
      history: state.current ? [state.current, ...state.history].slice(0, 30) : state.history,
      currentTime: 0,
      duration: 0,
      isPlaying: true
    })),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  pause: () => set({ isPlaying: false }),
  next: () => {
    const { current, queue } = get();
    const [nextTrack, ...rest] = queue;
    if (!nextTrack) {
      set({ isPlaying: false });
      return;
    }
    set((state) => ({
      current: nextTrack,
      queue: rest,
      history: current ? [current, ...state.history].slice(0, 30) : state.history,
      currentTime: 0,
      duration: 0,
      isPlaying: true
    }));
  },
  previous: () => {
    const { history, current, queue } = get();
    const [previousTrack, ...rest] = history;
    if (!previousTrack) return;
    set({
      current: previousTrack,
      history: rest,
      queue: current ? [current, ...queue] : queue,
      currentTime: 0,
      duration: 0,
      isPlaying: true
    });
  },
  addToQueue: (track) =>
    set((state) => ({
      queue: state.queue.some((song) => song.videoId === track.videoId)
        ? state.queue
        : [...state.queue, track]
    })),
  playNext: (track) =>
    set((state) => ({
      queue: [track, ...state.queue.filter((song) => song.videoId !== track.videoId)]
    })),
  reorderQueue: (fromIndex, toIndex) =>
    set((state) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= state.queue.length ||
        toIndex >= state.queue.length
      ) {
        return state;
      }

      const queue = [...state.queue];
      const [moved] = queue.splice(fromIndex, 1);
      queue.splice(toIndex, 0, moved);
      return { queue };
    }),
  shuffleQueue: () =>
    set((state) => ({
      queue: [...state.queue].sort(() => Math.random() - 0.5)
    })),
  toggleRepeat: () => set((state) => ({ repeatCurrent: !state.repeatCurrent })),
  startSleepTimer: (minutes) => set({ sleepTimerEndsAt: Date.now() + minutes * 60 * 1000 }),
  clearSleepTimer: () => set({ sleepTimerEndsAt: null }),
  removeFromQueue: (videoId) =>
    set((state) => ({ queue: state.queue.filter((song) => song.videoId !== videoId) })),
  clearQueue: () => set({ queue: [] }),
  seekBy: (seconds) =>
    set((state) => ({
      seekRequest: { id: (state.seekRequest?.id ?? 0) + 1, seconds }
    })),
  seekTo: (seconds) =>
    set((state) => ({
      seekRequest: { id: (state.seekRequest?.id ?? 0) + 1, seconds, absolute: true }
    })),
  setPlaybackTime: (currentTime, duration) => set({ currentTime, duration }),
  setPlaybackQuality: (playbackQuality) => {
    localStorage.setItem("musicwave_playback_quality", playbackQuality);
    set({ playbackQuality });
  },
  setSkipSeconds: (seconds) => set({ skipSeconds: Math.min(120, Math.max(5, seconds)) }),
  setVolume: (volume) => set({ volume }),
  setQueueOpen: (queueOpen) => set({ queueOpen })
}));
