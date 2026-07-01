import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { CheckCircle2, FileInput, Link2, Search, Upload, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage, musicApi, playlistsApi } from "../services/api";
import { useToastStore } from "../stores/toastStore";
import type { MusicVideo } from "../types";

type ImportMatch = {
  source: string;
  match?: MusicVideo;
  status: "pending" | "matched" | "missing";
};

function parseTracks(input: string) {
  const trimmed = input.trim();

  if (!trimmed) return [];

  const jsonTracks = parseJsonTracks(trimmed);
  if (jsonTracks.length) return jsonTracks.slice(0, 100);

  const csvTracks = parseCsvTracks(trimmed);
  if (csvTracks.length) return csvTracks.slice(0, 100);

  return trimmed
    .split(/\r?\n/)
    .map((line) =>
      line
        .trim()
        .replace(/^#EXTINF:[^,]*,/, "")
        .replace(/^\d+[\).\-\s]+/, "")
        .replace(/^["']|["']$/g, "")
        .replace(/\.(mp3|m4a|flac|wav|aac|ogg)$/i, "")
    )
    .map(normalizePlatformText)
    .filter((line) => line.length > 2)
    .filter((line) => !/^https?:\/\//i.test(line))
    .slice(0, 100);
}

function parseJsonTracks(input: string) {
  try {
    const data = JSON.parse(input);
    const rows: unknown[] = Array.isArray(data) ? data : Array.isArray(data.tracks) ? data.tracks : Array.isArray(data.items) ? data.items : [];
    return rows
      .map((item: unknown) => {
        if (typeof item === "string") return item;
        if (!item || typeof item !== "object") return "";
        const row = item as Record<string, any>;
        const track = row.track ?? row;
        const title = track.title ?? track.name ?? track.trackName;
        const artist =
          track.artist ??
          track.artistName ??
          track.artists?.map((entry: any) => entry.name ?? entry).join(" ") ??
          track.album?.artists?.map((entry: any) => entry.name ?? entry).join(" ");
        return [artist, title].filter(Boolean).join(" - ");
      })
      .map(normalizePlatformText)
      .filter(Boolean);
  } catch {
    return [];
  }
}

function parseCsvTracks(input: string) {
  const lines = input.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2 || !lines[0].includes(",")) return [];

  const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase().trim());
  const titleIndex = findHeader(headers, ["title", "track", "track name", "name", "song"]);
  const artistIndex = findHeader(headers, ["artist", "artist name", "artists", "album artist"]);

  if (titleIndex < 0 && artistIndex < 0) return [];

  return lines
    .slice(1)
    .map(splitCsvLine)
    .map((columns) => [columns[artistIndex], columns[titleIndex]].filter(Boolean).join(" - "))
    .map(normalizePlatformText)
    .filter(Boolean);
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (const char of line) {
    if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += char;
    }
  }

  values.push(value.trim());
  return values.map((entry) => entry.replace(/^"|"$/g, ""));
}

function findHeader(headers: string[], options: string[]) {
  return headers.findIndex((header) => options.includes(header));
}

function normalizePlatformText(input: string) {
  return input
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\b(open\.spotify|spotify|youtube|youtu\.be|music\.youtube|apple music|jiosaavn|gaana|wynk|soundcloud)\b/gi, "")
    .replace(/\s+[-–—]\s+/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ImportPlaylistPage() {
  const [playlistName, setPlaylistName] = useState("Imported Playlist");
  const [rawTracks, setRawTracks] = useState("");
  const [matches, setMatches] = useState<ImportMatch[]>([]);
  const [matching, setMatching] = useState(false);
  const [importing, setImporting] = useState(false);
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();

  const parsedTracks = useMemo(() => parseTracks(rawTracks), [rawTracks]);
  const matchedCount = matches.filter((item) => item.match).length;

  async function onFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setPlaylistName(file.name.replace(/\.(txt|csv|json|m3u8?|xspf)$/i, "") || playlistName);
    setRawTracks((current) => [current, text].filter(Boolean).join("\n"));
    setMatches([]);
  }

  function addPlatformLink() {
    const url = window.prompt("Paste a playlist or track link from Spotify, YouTube, Apple Music, SoundCloud, JioSaavn, Gaana, or another app");
    if (!url) return;
    setRawTracks((current) => [current, url].filter(Boolean).join("\n"));
    showToast("Link added. Add track names too if the link does not contain readable song details.");
  }

  async function matchTracks(event?: FormEvent) {
    event?.preventDefault();
    if (!parsedTracks.length) {
      showToast("Paste at least one song", "error");
      return;
    }

    setMatching(true);
    const nextMatches: ImportMatch[] = [];

    for (const track of parsedTracks) {
      try {
        const results = await musicApi.search(track);
        nextMatches.push({ source: track, match: results[0], status: results[0] ? "matched" : "missing" });
      } catch {
        nextMatches.push({ source: track, status: "missing" });
      }
      setMatches([...nextMatches]);
    }

    setMatching(false);
  }

  async function importPlaylist() {
    const songs = matches.flatMap((item) => (item.match ? [item.match] : []));
    if (!songs.length) {
      showToast("No matched songs to import", "error");
      return;
    }

    setImporting(true);
    try {
      const playlist = await playlistsApi.create({
        name: playlistName.trim() || "Imported Playlist",
        description: `Imported from ${songs.length} matched song${songs.length === 1 ? "" : "s"}.`
      });

      for (const song of songs) {
        await playlistsApi.addSong(playlist.id, song);
      }

      showToast("Playlist imported");
      navigate(`/playlists/${playlist.id}`);
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div>
      <section className="mb-8">
        <p className="text-sm font-semibold text-wave">Import playlist</p>
        <h1 className="mt-2 text-3xl font-black">Bring songs from other apps</h1>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.75fr)]">
        <form onSubmit={matchTracks} className="rounded-lg border border-line bg-zinc-950/60 p-5">
          <label className="mb-4 block text-sm font-medium">
            Playlist name
            <input
              value={playlistName}
              onChange={(event) => setPlaylistName(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-line bg-zinc-900 px-3 outline-none focus:border-wave"
              maxLength={100}
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Songs
            <textarea
              value={rawTracks}
              onChange={(event) => setRawTracks(event.target.value)}
              placeholder={"Paste one song per line\nExample:\nAnirudh - Arabic Kuthu\nA.R. Rahman - Kun Faya Kun\nTaylor Swift - Style"}
              className="mt-2 min-h-[22rem] w-full resize-y rounded-lg border border-line bg-zinc-900 p-3 outline-none focus:border-wave"
              required
            />
          </label>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-line px-4 font-semibold hover:border-wave">
              <Upload size={18} />
              Upload file
              <input
                type="file"
                accept=".txt,.csv,.json,.m3u,.m3u8,.xspf,text/plain,text/csv,application/json"
                className="hidden"
                onChange={onFileUpload}
              />
            </label>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line px-4 font-semibold hover:border-wave"
              onClick={addPlatformLink}
            >
              <Link2 size={18} />
              Add link
            </button>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-wave px-5 font-semibold text-black hover:brightness-110 disabled:opacity-50" disabled={matching || !parsedTracks.length}>
              <Search size={18} />
              {matching ? "Matching..." : `Match ${parsedTracks.length || ""} songs`}
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line px-5 font-semibold hover:border-wave disabled:opacity-50"
              onClick={importPlaylist}
              disabled={importing || matchedCount === 0}
            >
              <FileInput size={18} />
              {importing ? "Importing..." : `Import ${matchedCount || ""} matches`}
            </button>
          </div>
        </form>

        <aside className="rounded-lg border border-line bg-zinc-950/60 p-5">
          <h2 className="mb-3 text-lg font-bold">Matched songs</h2>
          {!matches.length && (
            <div className="space-y-3 text-sm text-zinc-500">
              <p>Paste songs, upload a backup/export file, or add platform links, then match to preview YouTube results.</p>
              <p>Supported uploads: TXT, CSV, JSON, M3U, M3U8, XSPF-style text. Platform exports work best when they include readable song and artist names.</p>
            </div>
          )}
          <div className="space-y-3">
            {matches.map((item) => (
              <div key={item.source} className="rounded-lg bg-panel p-3">
                <div className="mb-2 flex items-center gap-2 text-xs text-zinc-400">
                  {item.match ? <CheckCircle2 size={15} className="text-wave" /> : <XCircle size={15} className="text-coral" />}
                  <span className="truncate">{item.source}</span>
                </div>
                {item.match ? (
                  <div className="flex gap-3">
                    <img src={item.match.thumbnail} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.match.title}</p>
                      <p className="truncate text-xs text-zinc-500">{item.match.channelTitle}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">No match found.</p>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
