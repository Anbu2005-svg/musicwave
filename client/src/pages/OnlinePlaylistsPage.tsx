import { ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { getErrorMessage, musicApi } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import type { OnlinePlaylist } from "../types";

function PlaylistCard({ playlist }: { playlist: OnlinePlaylist }) {
  return (
    <a
      href={`https://www.youtube.com/playlist?list=${playlist.playlistId}`}
      target="_blank"
      rel="noreferrer"
      className="group rounded-lg bg-panel p-3 transition hover:bg-zinc-800/80"
    >
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
        <ExternalLink size={16} className="mt-0.5 shrink-0 text-zinc-400" />
      </div>
    </a>
  );
}

export default function OnlinePlaylistsPage() {
  const user = useAuthStore((state) => state.user);
  const languages = user?.languagePreferences ?? [];
  const playlists = useQuery({
    queryKey: ["music", "preferred-playlists", languages],
    queryFn: musicApi.preferredPlaylists
  });

  const grouped = (playlists.data ?? []).reduce<Record<string, OnlinePlaylist[]>>((acc, playlist) => {
    acc[playlist.language] = [...(acc[playlist.language] ?? []), playlist];
    return acc;
  }, {});

  return (
    <div>
      <section className="mb-8">
        <p className="text-sm font-semibold text-wave">Online playlists</p>
        <h1 className="mt-2 text-3xl font-black">Suggested for your languages</h1>
      </section>

      {playlists.isLoading && <LoadingSkeleton rows={8} />}
      {playlists.error && <p className="rounded-lg border border-coral/30 bg-coral/10 p-4 text-sm text-rose-100">{getErrorMessage(playlists.error)}</p>}
      {!playlists.isLoading && !playlists.error && playlists.data?.length === 0 && (
        <p className="text-sm text-zinc-500">No playlist suggestions found yet.</p>
      )}

      <div className="space-y-9">
        {Object.entries(grouped).map(([language, items]) => (
          <section key={language}>
            <h2 className="mb-4 text-xl font-bold">{language} playlists</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((playlist) => (
                <PlaylistCard key={playlist.playlistId} playlist={playlist} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
