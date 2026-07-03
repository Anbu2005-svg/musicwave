import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreatePlaylistModal from "../components/CreatePlaylistModal";
import LoadingSkeleton from "../components/LoadingSkeleton";
import SongRow from "../components/SongRow";
import { getErrorMessage, playlistsApi } from "../services/api";
import { usePlayerStore } from "../stores/playerStore";
import { useToastStore } from "../stores/toastStore";

export default function PlaylistDetailsPage() {
  const { id = "" } = useParams();
  const [editOpen, setEditOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const playlist = useQuery({ queryKey: ["playlist", id], queryFn: () => playlistsApi.get(id), enabled: !!id });
  const updateMutation = useMutation({
    mutationFn: (input: { name: string; description?: string }) => playlistsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist", id] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      showToast("Playlist updated");
    },
    onError: (error) => showToast(getErrorMessage(error), "error")
  });
  const deleteMutation = useMutation({
    mutationFn: () => playlistsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      showToast("Playlist deleted");
      navigate("/library");
    },
    onError: (error) => showToast(getErrorMessage(error), "error")
  });
  const removeSongMutation = useMutation({
    mutationFn: (videoId: string) => playlistsApi.removeSong(id, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist", id] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      showToast("Song removed");
    },
    onError: (error) => showToast(getErrorMessage(error), "error")
  });

  if (playlist.isLoading) return <LoadingSkeleton rows={8} />;
  if (playlist.error) return <p className="rounded-lg border border-coral/30 bg-coral/10 p-4 text-sm text-rose-100">{getErrorMessage(playlist.error)}</p>;
  if (!playlist.data) return null;

  const songs = playlist.data.songs ?? [];

  return (
    <div>
      <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="grid h-44 w-44 shrink-0 place-items-center overflow-hidden rounded-lg bg-zinc-900">
          {playlist.data.coverImage ? <img src={playlist.data.coverImage} alt="" className="h-full w-full object-cover" /> : <span className="text-zinc-600">Playlist</span>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-wave">Playlist</p>
          <h1 className="mt-2 truncate text-4xl font-black">{playlist.data.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">{playlist.data.description || "No description"}</p>
          <p className="mt-3 text-sm text-zinc-500">{songs.length} songs</p>
          <button
            className="mt-5 inline-flex h-12 items-center gap-3 rounded-full bg-wave px-6 text-base font-black text-black shadow-glow transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => {
              const [firstSong, ...queue] = songs;
              if (!firstSong) return;
              playTrack(firstSong, queue);
            }}
            disabled={!songs.length}
            title="Play playlist"
          >
            <Play size={20} fill="currentColor" className="ml-0.5" />
            Play
          </button>
        </div>
        <div className="flex gap-2">
          <button
            className="grid h-11 w-11 place-items-center rounded-full bg-wave text-black shadow-glow transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => {
              const [firstSong, ...queue] = songs;
              if (!firstSong) return;
              playTrack(firstSong, queue);
            }}
            disabled={!songs.length}
            title="Play playlist"
          >
            <Play size={19} fill="currentColor" className="ml-0.5" />
          </button>
          <button className="grid h-11 w-11 place-items-center rounded-lg bg-zinc-900 hover:bg-zinc-800" onClick={() => setEditOpen(true)} title="Edit playlist">
            <Edit3 size={18} />
          </button>
          <button className="grid h-11 w-11 place-items-center rounded-lg bg-coral/15 text-coral hover:bg-coral/25" onClick={() => deleteMutation.mutate()} title="Delete playlist">
            <Trash2 size={18} />
          </button>
        </div>
      </section>
      <div className="space-y-1">
        {songs.map((song) => (
          <SongRow key={song.videoId} song={song} queue={songs} onRemove={() => removeSongMutation.mutate(song.videoId)} />
        ))}
      </div>
      {songs.length === 0 && <p className="text-sm text-zinc-500">Add songs from search results.</p>}
      <CreatePlaylistModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={async (input) => {
          await updateMutation.mutateAsync(input);
        }}
        initial={playlist.data}
        title="Edit playlist"
      />
    </div>
  );
}
