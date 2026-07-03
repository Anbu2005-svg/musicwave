import { FastForward, ListMusic, Pause, Play, Plus, Repeat, Rewind, Shuffle, SkipBack, SkipForward, Timer, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePlayerStore } from "../stores/playerStore";
import AddToPlaylistModal from "./AddToPlaylistModal";
import YouTubePlayer from "./YouTubePlayer";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const rounded = Math.floor(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainingSeconds = rounded % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function PlayerBar() {
  const [now, setNow] = useState(Date.now());
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const current = usePlayerStore((state) => state.current);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const skipSeconds = usePlayerStore((state) => state.skipSeconds);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const repeatCurrent = usePlayerStore((state) => state.repeatCurrent);
  const sleepTimerEndsAt = usePlayerStore((state) => state.sleepTimerEndsAt);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const pause = usePlayerStore((state) => state.pause);
  const next = usePlayerStore((state) => state.next);
  const previous = usePlayerStore((state) => state.previous);
  const seekBy = usePlayerStore((state) => state.seekBy);
  const seekTo = usePlayerStore((state) => state.seekTo);
  const shuffleQueue = usePlayerStore((state) => state.shuffleQueue);
  const toggleRepeat = usePlayerStore((state) => state.toggleRepeat);
  const startSleepTimer = usePlayerStore((state) => state.startSleepTimer);
  const clearSleepTimer = usePlayerStore((state) => state.clearSleepTimer);
  const setSkipSeconds = usePlayerStore((state) => state.setSkipSeconds);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const setQueueOpen = usePlayerStore((state) => state.setQueueOpen);

  useEffect(() => {
    if (!sleepTimerEndsAt) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [sleepTimerEndsAt]);

  useEffect(() => {
    if (!sleepTimerEndsAt || now < sleepTimerEndsAt) return;
    pause();
    clearSleepTimer();
  }, [clearSleepTimer, now, pause, sleepTimerEndsAt]);

  const sleepRemaining = useMemo(() => {
    if (!sleepTimerEndsAt) return "";
    const remaining = Math.max(0, Math.ceil((sleepTimerEndsAt - now) / 1000));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [now, sleepTimerEndsAt]);

  if (!current) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/95 px-3 py-3 text-white backdrop-blur lg:left-[18.5rem]">
      <div className="mx-auto grid max-w-7xl gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,2fr)_minmax(0,1fr)] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <img src={current.thumbnail} alt="" className="h-12 w-12 rounded-lg object-cover sm:h-14 sm:w-14" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{current.title}</p>
            <p className="truncate text-xs text-zinc-400">{current.channelTitle}</p>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-center gap-1 sm:gap-2">
            <button className="grid h-8 w-8 place-items-center rounded-full text-emerald-500 hover:bg-white/10" onClick={shuffleQueue} title="Shuffle queue">
              <Shuffle size={17} />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-full text-zinc-300 hover:bg-white/10" onClick={previous} title="Previous">
              <SkipBack size={18} fill="currentColor" />
            </button>
            <button className="grid h-11 w-11 place-items-center rounded-full bg-white text-black shadow-lg transition hover:scale-105" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" className="ml-0.5" />}
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-full text-zinc-300 hover:bg-white/10" onClick={next} title="Next">
              <SkipForward size={18} fill="currentColor" />
            </button>
            <button
              className={`grid h-8 w-8 place-items-center rounded-full hover:bg-white/10 ${repeatCurrent ? "text-emerald-500" : "text-zinc-300"}`}
              onClick={toggleRepeat}
              title="Repeat current"
            >
              <Repeat size={17} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-10 text-right text-xs tabular-nums text-zinc-300">{formatTime(currentTime)}</span>
            <input
              aria-label="Playback progress"
              type="range"
              min="0"
              max={Math.max(duration, 1)}
              step="1"
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => seekTo(Number(event.target.value))}
              className="h-1 flex-1 accent-wave"
            />
            <span className="w-10 text-xs tabular-nums text-zinc-300">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
          <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" onClick={() => seekBy(-skipSeconds)} title={`Back ${skipSeconds}s`}>
            <Rewind size={17} />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" onClick={() => seekBy(skipSeconds)} title={`Forward ${skipSeconds}s`}>
            <FastForward size={17} />
          </button>
          <input
            aria-label="Skip seconds"
            type="number"
            min="5"
            max="120"
            step="5"
            value={skipSeconds}
            onChange={(event) => setSkipSeconds(Number(event.target.value) || 10)}
            className="h-9 w-16 rounded-full border border-white/10 bg-zinc-900 px-2 text-sm outline-none focus:border-wave"
            title="Seek seconds"
          />
          <button
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"
            onClick={() => setQueueOpen(true)}
            title="Open queue"
          >
            <ListMusic size={17} />
          </button>
          <button
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"
            onClick={() => setPlaylistOpen(true)}
            title="Add current song to playlist"
          >
            <Plus size={17} />
          </button>
          <button
            className={`inline-flex h-9 items-center gap-1 rounded-full px-2 text-sm hover:bg-white/10 ${sleepTimerEndsAt ? "text-wave" : ""}`}
            onClick={() => (sleepTimerEndsAt ? clearSleepTimer() : startSleepTimer(60))}
            title={sleepTimerEndsAt ? "Cancel sleep timer" : "Pause after 1 hour"}
          >
            <Timer size={17} />
            <span className="tabular-nums">{sleepTimerEndsAt ? sleepRemaining : "1h"}</span>
          </button>
          <Volume2 size={17} className="hidden text-zinc-400 sm:block" />
          <input
            aria-label="Volume"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="hidden w-20 accent-wave sm:block"
          />
        </div>
      </div>
      <YouTubePlayer />
      <AddToPlaylistModal song={current} open={playlistOpen} onClose={() => setPlaylistOpen(false)} />
    </footer>
  );
}
