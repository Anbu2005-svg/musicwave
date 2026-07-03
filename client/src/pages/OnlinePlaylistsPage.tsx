import { ExternalLink, Play, Save } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { getErrorMessage, musicApi, playlistsApi } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { usePlayerStore } from "../stores/playerStore";
import { useToastStore } from "../stores/toastStore";
import type { OnlinePlaylist } from "../types";

function PlaylistCard({
  playlist,
  busy,
  onPlay,
  onSave
}: {
  playlist: OnlinePlaylist;
  busy: boolean;
  onPlay: (playlist: OnlinePlaylist) => void;
  onSave: (playlist: OnlinePlaylist) => void;
}) {
  return (
    <article className="group rounded-lg bg-panel p-3 transition hover:bg-zinc-800/80">
      <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-zinc-900">
        <img src={playlist.thumbnail} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
        <span className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white">
          {playlist.language}
        </span>
      </div>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5">{playlist.title}</h3>
          <p className="mt-1 truncate text-xs text-zinc-400">{playlist.channelTitle}</p>
        </div>
        <a
          href={`https://www.youtube.com/playlist?list=${playlist.playlistId}`}
          target="_blank"
          rel="noreferrer"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-white"
          title="Open on YouTube"
        >
          <ExternalLink size={16} />
        </a>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-wave px-3 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-50"
          onClick={() => onPlay(playlist)}
          disabled={busy}
        >
          <Play size={16} fill="currentColor" />
          Play
        </button>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm font-semibold hover:border-wave disabled:opacity-50"
          onClick={() => onSave(playlist)}
          disabled={busy}
        >
          <Save size={16} />
          Save
        </button>
      </div>
    </article>
  );
}

export default function OnlinePlaylistsPage() {
  const [busyPlaylistId, setBusyPlaylistId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const user = useAuthStore((state) => state.user);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const languages = user?.languagePreferences ?? [];
  const playlists = useQuery({
    queryKey: ["music", "preferred-playlists", languages],
    queryFn: musicApi.preferredPlaylists
  });

  const categories = ["All", ...Array.from(new Set((playlists.data ?? []).map((playlist) => playlist.category).filter(Boolean)))] as string[];
  const filteredPlaylists = activeCategory === "All"
    ? playlists.data ?? []
    : (playlists.data ?? []).filter((playlist) => playlist.category === activeCategory);
  const grouped = filteredPlaylists.reduce<Record<string, OnlinePlaylist[]>>((acc, playlist) => {
    acc[playlist.language] = [...(acc[playlist.language] ?? []), playlist];
    return acc;
  }, {});

  async function loadPlaylistSongs(playlist: OnlinePlaylist) {
    setBusyPlaylistId(playlist.playlistId);
    try {
      const songs = await musicApi.playlistSongs(playlist.playlistId);
      if (!songs.length) {
        showToast("No playable songs found in this online playlist", "error");
        return [];
      }
      return songs;
    } catch (error) {
      showToast(getErrorMessage(error), "error");
      return [];
    } finally {
      setBusyPlaylistId(null);
    }
  }

  async function playOnlinePlaylist(playlist: OnlinePlaylist) {
    const songs = await loadPlaylistSongs(playlist);
    if (!songs.length) return;
    const [first, ...queue] = songs;
    playTrack(first, queue);
    showToast(`Playing ${playlist.title}`);
  }

  async function saveOnlinePlaylist(playlist: OnlinePlaylist) {
    const songs = await loadPlaylistSongs(playlist);
    if (!songs.length) return;

    setBusyPlaylistId(playlist.playlistId);
    try {
      const saved = await playlistsApi.create({
        name: playlist.title.slice(0, 100),
        description: `Saved from online ${playlist.language} playlist by ${playlist.channelTitle}.`,
        source: "ONLINE"
      });

      const savedCount = await playlistsApi.addSongs(saved.id, songs);

      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["playlist", saved.id] });
      showToast(`Saved ${savedCount} songs`);
      navigate(`/playlists/${saved.id}`);
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setBusyPlaylistId(null);
    }
  }

  return (
    <div>
      <section className="mb-8">
        <p className="text-sm font-semibold text-wave">Online playlists</p>
        <h1 className="mt-2 text-3xl font-black">All playlists for your languages</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Browse latest releases, yearly hits, classics, and mood playlists from new to old.
        </p>
      </section>

      {playlists.isLoading && <LoadingSkeleton rows={8} />}
      {playlists.error && <p className="rounded-lg border border-coral/30 bg-coral/10 p-4 text-sm text-rose-100">{getErrorMessage(playlists.error)}</p>}
      {!playlists.isLoading && !playlists.error && playlists.data?.length === 0 && (
        <p className="text-sm text-zinc-500">No playlist suggestions found yet.</p>
      )}

      {!!categories.length && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`h-9 shrink-0 rounded-full px-4 text-sm font-bold transition ${
                activeCategory === category
                  ? "bg-white text-black"
                  : "bg-white/10 text-zinc-300 hover:bg-white/15 hover:text-white"
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-9">
        {Object.entries(grouped).map(([language, items]) => (
          <section key={language}>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="text-xl font-bold">{language} playlists</h2>
              <span className="text-sm text-zinc-500">{items.length} found</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((playlist) => (
                <PlaylistCard
                  key={playlist.playlistId}
                  playlist={playlist}
                  busy={busyPlaylistId === playlist.playlistId}
                  onPlay={playOnlinePlaylist}
                  onSave={saveOnlinePlaylist}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
