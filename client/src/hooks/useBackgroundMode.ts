import { useEffect } from "react";
import { usePlayerStore } from "../stores/playerStore";

/**
 * Best-effort Android background mode for the Capacitor WebView.
 *
 * YouTube IFrame playback can still be paused by Android or YouTube when the
 * app is backgrounded. This hook keeps the WebView alive where the installed
 * native plugin and device policy allow it.
 */
export function useBackgroundMode() {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const current = usePlayerStore((state) => state.current);

  useEffect(() => {
    let cancelled = false;

    if (!current || !isPlaying) {
      import("@anuradev/capacitor-background-mode")
        .then(({ BackgroundMode }) => BackgroundMode.disable())
        .catch(() => {
          /* not on native - ignore */
        });
      return;
    }

    import("@anuradev/capacitor-background-mode")
      .then(async ({ BackgroundMode }) => {
        const notificationPermission = await BackgroundMode.checkNotificationsPermission?.().catch(() => undefined);
        if (notificationPermission?.notifications === "prompt" || notificationPermission?.notifications === "prompt-with-rationale") {
          await BackgroundMode.requestNotificationsPermission?.().catch(() => undefined);
        }

        const microphonePermission = await BackgroundMode.checkMicrophonePermission?.().catch(() => undefined);
        if (microphonePermission?.microphone !== "granted") {
          await BackgroundMode.requestMicrophonePermission?.().catch(() => undefined);
        }

        const batteryOptimization = await BackgroundMode.checkBatteryOptimizations?.().catch(() => undefined);
        if (batteryOptimization?.enabled) {
          await BackgroundMode.requestDisableBatteryOptimizations?.().catch(() => undefined);
        }

        await BackgroundMode.disableWebViewOptimizations?.().catch(() => undefined);
        if (cancelled) return;

        await BackgroundMode.enable({
          title: "MusicWave",
          text: current.title ?? "Playing music",
          subText: current.channelTitle ?? "MusicWave",
          icon: "ic_launcher",
          channelName: "MusicWave Playback",
          channelDescription: "Keeps MusicWave playback active",
          disableWebViewOptimization: true,
          hidden: true,
          resume: true,
          silent: true,
          visibility: "secret"
        });
      })
      .catch(() => {
        /* not on native - ignore */
      });

    return () => {
      cancelled = true;
      import("@anuradev/capacitor-background-mode")
        .then(({ BackgroundMode }) => BackgroundMode.disable())
        .catch(() => {
          /* not on native - ignore */
        });
    };
  }, [isPlaying, current]);
}
