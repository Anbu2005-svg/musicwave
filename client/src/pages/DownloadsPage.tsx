import { Download, HardDriveDownload, Play, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import SongRow from "../components/SongRow";
import { useDownloadStore } from "../stores/downloadStore";
import { usePlayerStore } from "../stores/playerStore";

function formatBytes(bytes?: number) {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export default function DownloadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const downloadedSongs = useDownloadStore((state) => state.downloadedSongs);
  const deleteDownload = useDownloadStore((state) => state.deleteDownload);
  const playTrack = usePlayerStore((state) => state.playTrack);

  const filteredSongs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return downloadedSongs;
    return downloadedSongs.filter(
      (s) => s.title.toLowerCase().includes(q) || s.channelTitle.toLowerCase().includes(q)
    );
  }, [downloadedSongs, searchQuery]);

  const totalSize = useMemo(() => {
    return downloadedSongs.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);
  }, [downloadedSongs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-xl bg-wave/20 text-wave">
            <HardDriveDownload size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold text-wave">Offline Collection</p>
            <h1 className="text-3xl font-black">Downloads</h1>
            <p className="text-xs text-zinc-400">
              {downloadedSongs.length} {downloadedSongs.length === 1 ? "song" : "songs"} • {formatBytes(totalSize)}
            </p>
          </div>
        </div>

        {downloadedSongs.length > 0 && (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-wave px-6 py-2.5 text-sm font-semibold text-black shadow-glow transition hover:scale-105"
            onClick={() => playTrack(downloadedSongs[0], downloadedSongs.slice(1))}
          >
            <Play size={18} fill="currentColor" />
            Play All Offline
          </button>
        )}
      </div>

      {downloadedSongs.length > 0 && (
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search downloaded songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-white/10 bg-zinc-900/80 py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-wave"
          />
        </div>
      )}

      {filteredSongs.length > 0 ? (
        <div className="space-y-1">
          {filteredSongs.map((song) => (
            <SongRow
              key={song.videoId}
              song={song}
              queue={filteredSongs}
              onRemove={() => deleteDownload(song.videoId)}
            />
          ))}
        </div>
      ) : downloadedSongs.length > 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">No downloaded songs match your search.</p>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-8 text-center">
          <Download size={40} className="mx-auto mb-3 text-zinc-600" />
          <h2 className="text-lg font-bold">No Downloaded Songs Yet</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Click the download icon 📥 on any song or playlist to save it for offline listening.
          </p>
        </div>
      )}
    </div>
  );
}
