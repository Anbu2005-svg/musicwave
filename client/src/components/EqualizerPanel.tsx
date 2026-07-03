import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { usePlayerStore, type PlaybackQuality } from "../stores/playerStore";

const equalizerPresets = [
  { name: "Balanced", bands: [45, 58, 62, 58, 45] },
  { name: "Bass", bands: [86, 78, 56, 42, 34] },
  { name: "Vocal", bands: [38, 48, 82, 72, 46] },
  { name: "Bright", bands: [35, 46, 58, 76, 88] },
  { name: "Night", bands: [28, 38, 45, 38, 28] }
];

const qualityOptions: { label: string; value: PlaybackQuality }[] = [
  { label: "Saver", value: "small" },
  { label: "Normal", value: "medium" },
  { label: "High", value: "large" },
  { label: "HD", value: "hd720" },
  { label: "Auto", value: "default" }
];

export default function EqualizerPanel() {
  const [equalizerPreset, setEqualizerPreset] = useState(
    () => localStorage.getItem("musicwave_equalizer") ?? "Balanced"
  );
  const playbackQuality = usePlayerStore((state) => state.playbackQuality);
  const setPlaybackQuality = usePlayerStore((state) => state.setPlaybackQuality);
  const selectedPreset = equalizerPresets.find((preset) => preset.name === equalizerPreset) ?? equalizerPresets[0];

  function selectEqualizerPreset(name: string) {
    setEqualizerPreset(name);
    localStorage.setItem("musicwave_equalizer", name);
  }

  return (
    <section className="rounded-lg border border-line bg-zinc-950 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-bold text-white">
            <SlidersHorizontal size={17} />
            Equalizer
          </p>
          <p className="mt-1 truncate text-xs text-zinc-500">{equalizerPreset} preset</p>
        </div>
        <div className="flex h-10 items-end gap-1">
          {selectedPreset.bands.map((band, index) => (
            <span
              key={`${selectedPreset.name}-${index}`}
              className="w-1.5 rounded-full bg-wave"
              style={{ height: `${Math.max(10, band / 2)}px` }}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {equalizerPresets.map((preset) => (
          <button
            key={preset.name}
            className={`rounded-lg px-3 py-2 text-left text-xs font-bold transition ${
              preset.name === equalizerPreset
                ? "bg-wave text-black"
                : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            }`}
            onClick={() => selectEqualizerPreset(preset.name)}
          >
            {preset.name}
          </button>
        ))}
      </div>
      <div className="mt-4 border-t border-line pt-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">Playback quality</p>
        <div className="grid grid-cols-2 gap-2">
          {qualityOptions.map((option) => (
            <button
              key={option.value}
              className={`rounded-lg px-3 py-2 text-left text-xs font-bold transition ${
                option.value === playbackQuality
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
              onClick={() => setPlaybackQuality(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
