import { useEffect, useRef } from "react";
import { usePlayerStore } from "../stores/playerStore";

type WakeLockSentinel = {
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
};

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinel>;
  };
};

export function usePlaybackWakeLock() {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const current = usePlayerStore((state) => state.current);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    let cancelled = false;
    const navigatorWithWakeLock = navigator as NavigatorWithWakeLock;

    const releaseWakeLock = async () => {
      const wakeLock = wakeLockRef.current;
      wakeLockRef.current = null;
      if (wakeLock) {
        await wakeLock.release().catch(() => undefined);
      }
    };

    const requestWakeLock = async () => {
      if (!current || !isPlaying) {
        await releaseWakeLock();
        return;
      }

      if (!navigatorWithWakeLock.wakeLock || wakeLockRef.current) return;

      try {
        const wakeLock = await navigatorWithWakeLock.wakeLock.request("screen");
        if (cancelled || !isPlaying) {
          await wakeLock.release().catch(() => undefined);
          return;
        }
        wakeLockRef.current = wakeLock;
        wakeLock.addEventListener("release", () => {
          if (wakeLockRef.current === wakeLock) {
            wakeLockRef.current = null;
          }
        });
      } catch {
        // Wake Lock is best-effort and may be denied by the browser or device.
      }
    };

    const handleVisibilityChange = () => {
      void requestWakeLock();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    void requestWakeLock();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void releaseWakeLock();
    };
  }, [current, isPlaying]);
}
