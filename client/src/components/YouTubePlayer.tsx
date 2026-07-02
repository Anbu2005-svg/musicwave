import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "../stores/playerStore";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiReadyPromise: Promise<void> | null = null;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve();
  if (apiReadyPromise) return apiReadyPromise;

  apiReadyPromise = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve();
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(script);
  });

  return apiReadyPromise;
}

export default function YouTubePlayer() {
  const containerId = useRef(`youtube-player-${crypto.randomUUID()}`);
  const playerRef = useRef<any>(null);
  const isPlayingRef = useRef(false);
  const [ready, setReady] = useState(false);
  const current = usePlayerStore((state) => state.current);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const seekRequest = usePlayerStore((state) => state.seekRequest);
  const setPlaybackTime = usePlayerStore((state) => state.setPlaybackTime);
  const repeatCurrent = usePlayerStore((state) => state.repeatCurrent);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const seekBy = usePlayerStore((state) => state.seekBy);
  const next = usePlayerStore((state) => state.next);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    let mounted = true;
    loadYouTubeApi().then(() => {
      if (!mounted || playerRef.current) return;
      playerRef.current = new window.YT.Player(containerId.current, {
        height: "1",
        width: "1",
        videoId: current?.videoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            event.target?.setPlaybackQuality?.("small");
            setReady(true);
            if (isPlayingRef.current) {
              event.target?.playVideo?.();
            }
          },
          onStateChange: (event: any) => {
            if (
              isPlayingRef.current &&
              (event.data === window.YT.PlayerState.CUED || event.data === window.YT.PlayerState.PAUSED)
            ) {
              event.target?.playVideo?.();
              return;
            }
            if (event.data === window.YT.PlayerState.ENDED) {
              if (repeatCurrent) {
                event.target?.seekTo?.(0, true);
                event.target?.playVideo?.();
                return;
              }
              next();
            }
          }
        }
      });
    });

    return () => {
      mounted = false;
    };
  }, [current?.videoId, next, repeatCurrent]);

  useEffect(() => {
    if (!ready || !current || !playerRef.current?.loadVideoById) return;
    playerRef.current.loadVideoById({ videoId: current.videoId, suggestedQuality: "small" });
    if (isPlaying) {
      window.setTimeout(() => playerRef.current?.playVideo?.(), 150);
    }
  }, [current, isPlaying, ready]);

  useEffect(() => {
    if (!current || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.channelTitle,
      artwork: current.thumbnail ? [{ src: current.thumbnail, sizes: "512x512", type: "image/jpeg" }] : []
    });

    navigator.mediaSession.setActionHandler("play", () => {
      if (!isPlaying) togglePlay();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      if (isPlaying) togglePlay();
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => undefined);
    navigator.mediaSession.setActionHandler("nexttrack", next);
    navigator.mediaSession.setActionHandler("seekbackward", () => seekBy(-10));
    navigator.mediaSession.setActionHandler("seekforward", () => seekBy(10));
  }, [current, isPlaying, next, seekBy, togglePlay]);

  useEffect(() => {
    if (!ready || !playerRef.current) return;
    if (isPlaying) {
      playerRef.current.playVideo?.();
    } else {
      playerRef.current.pauseVideo?.();
    }
  }, [isPlaying, ready]);

  useEffect(() => {
    if (ready) {
      playerRef.current?.setVolume?.(volume);
    }
  }, [volume, ready]);

  useEffect(() => {
    if (!ready || !seekRequest || !playerRef.current?.seekTo) return;
    const currentTime = playerRef.current.getCurrentTime?.() ?? 0;
    const duration = playerRef.current.getDuration?.() ?? 0;
    const rawTarget = seekRequest.absolute ? seekRequest.seconds : currentTime + seekRequest.seconds;
    const target = Math.min(Math.max(rawTarget, 0), duration || Number.MAX_SAFE_INTEGER);
    playerRef.current.seekTo(target, true);
  }, [ready, seekRequest]);

  useEffect(() => {
    if (!ready) return;
    const interval = window.setInterval(() => {
      const currentTime = playerRef.current?.getCurrentTime?.() ?? 0;
      const duration = playerRef.current?.getDuration?.() ?? 0;
      setPlaybackTime(currentTime, duration);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [ready, setPlaybackTime]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-0 right-0 -z-10 h-[200px] w-[200px] overflow-hidden opacity-0"
    >
      <div id={containerId.current} className="h-full w-full" />
    </div>
  );
}
