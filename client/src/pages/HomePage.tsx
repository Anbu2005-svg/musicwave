import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PlaylistCard from "../components/PlaylistCard";
import SongCard from "../components/SongCard";
import { getErrorMessage, musicApi, playlistsApi } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import type { MusicVideo } from "../types";

function SongSection({ title, songs, loading, error }: { title: string; songs?: MusicVideo[]; loading?: boolean; error?: unknown }) {
  return (
    <section className="mb-9">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {loading && <LoadingSkeleton rows={3} />}
      {Boolean(error) && <p className="rounded-lg border border-coral/30 bg-coral/10 p-4 text-sm text-rose-100">{getErrorMessage(error)}</p>}
      {!!songs?.length && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {songs.map((song) => (
            <SongCard key={song.videoId} song={song} queue={songs} />
          ))}
        </div>
      )}
      {!loading && !error && songs?.length === 0 && <p className="text-sm text-zinc-500">Nothing here yet.</p>}
    </section>
  );
}

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const languagePreferences = user?.languagePreferences ?? [];
  const preferenceLabel = languagePreferences.length ? languagePreferences.join(", ") : "English and Indian";
  const trending = useQuery({ queryKey: ["music", "trending"], queryFn: musicApi.trending });
  const preferred = useQuery({ queryKey: ["music", "preferred", languagePreferences], queryFn: musicApi.preferred });
  const recommended = useQuery({ queryKey: ["music", "recommendations", languagePreferences], queryFn: musicApi.recommendations });
  const popularQuery = languagePreferences[0] ? `${languagePreferences[0]} popular songs` : "popular music";
  const popular = useQuery({ queryKey: ["music", "popular", popularQuery], queryFn: () => musicApi.search(popularQuery) });
  const playlists = useQuery({ queryKey: ["playlists"], queryFn: playlistsApi.list });

  return (
    <div>
      <section className="mb-9 flex flex-col gap-4 rounded-lg border border-line bg-zinc-950/60 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-wave">Good to see you, {user?.name?.split(" ")[0] ?? "Listener"}</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-5xl">Tune the day your way.</h1>
        </div>
        <Link to="/search" className="inline-flex h-11 items-center justify-center rounded-lg bg-wave px-5 font-semibold text-black hover:brightness-110">
          Search music
        </Link>
      </section>
      <SongSection title={`${preferenceLabel} Music`} songs={preferred.data} loading={preferred.isLoading} error={preferred.error} />
      <SongSection title="Recommended For You" songs={recommended.data} loading={recommended.isLoading} error={recommended.error} />
      <SongSection title="Trending Music" songs={trending.data} loading={trending.isLoading} error={trending.error} />
      <SongSection title="Popular Music" songs={popular.data} loading={popular.isLoading} error={popular.error} />
      <section className="mb-9">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Playlists</h2>
          <Link className="text-sm font-semibold text-wave" to="/library">
            View all
          </Link>
        </div>
        {playlists.isLoading && <LoadingSkeleton rows={3} />}
        {!!playlists.data?.length && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {playlists.data.slice(0, 5).map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
        {!playlists.isLoading && playlists.data?.length === 0 && <p className="text-sm text-zinc-500">Create your first playlist in Library.</p>}
      </section>
    </div>
  );
}
