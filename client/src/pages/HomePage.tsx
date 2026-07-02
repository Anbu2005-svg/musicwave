import { useQuery } from "@tanstack/react-query";
import { Heart, Import, Library, Radio, Search } from "lucide-react";
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

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
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
  const quickLinks = [
    { to: "/liked", label: "Liked Songs", icon: Heart, tone: "bg-coral/25 text-coral" },
    { to: "/library", label: "Your Library", icon: Library, tone: "bg-wave/20 text-wave" },
    { to: "/online-playlists", label: "Online Playlists", icon: Radio, tone: "bg-azure/20 text-azure" },
    { to: "/import-playlist", label: "Import Playlist", icon: Import, tone: "bg-violet-500/20 text-violet-300" }
  ];

  return (
    <div>
      <section className="mb-7 rounded-lg bg-gradient-to-b from-zinc-800/85 to-zinc-950/30 p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-wave">{timeGreeting()}, {user?.name?.split(" ")[0] ?? "Listener"}</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-5xl">What do you want to hear?</h1>
          </div>
          <Link to="/search" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 font-bold text-black hover:scale-[1.02]">
            <Search size={18} />
            Search music
          </Link>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map(({ to, label, icon: Icon, tone }) => (
            <Link key={to} to={to} className="flex h-16 items-center gap-3 overflow-hidden rounded-lg bg-white/10 font-bold transition hover:bg-white/15">
              <span className={`grid h-16 w-16 shrink-0 place-items-center ${tone}`}>
                <Icon size={24} />
              </span>
              <span className="truncate pr-3">{label}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="mb-9">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Recently saved</h2>
          <Link className="text-sm font-bold text-zinc-400 hover:text-white" to="/library">
            Show all
          </Link>
        </div>
        {playlists.isLoading && <LoadingSkeleton rows={3} />}
        {!!playlists.data?.length && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {playlists.data.slice(0, 6).map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </section>
      <SongSection title={`${preferenceLabel} Music`} songs={preferred.data} loading={preferred.isLoading} error={preferred.error} />
      <SongSection title="Recommended For You" songs={recommended.data} loading={recommended.isLoading} error={recommended.error} />
      <SongSection title="Trending Music" songs={trending.data} loading={trending.isLoading} error={trending.error} />
      <SongSection title="Popular Music" songs={popular.data} loading={popular.isLoading} error={popular.error} />
    </div>
  );
}
