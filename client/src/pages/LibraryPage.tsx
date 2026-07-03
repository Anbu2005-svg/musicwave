import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Grid2X2, Plus } from "lucide-react";
import { useState } from "react";
import CreatePlaylistModal from "../components/CreatePlaylistModal";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PlaylistCard from "../components/PlaylistCard";
import { getErrorMessage, playlistsApi } from "../services/api";
import { useToastStore } from "../stores/toastStore";
import type { Playlist } from "../types";

type LibraryTab = "playlists" | "online";

function isOnlineMix(playlist: Playlist) {
  return playlist.source === "ONLINE" || playlist.description?.toLowerCase().startsWith("saved from online");
}

export default function LibraryPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<LibraryTab>("playlists");
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const playlists = useQuery({ queryKey: ["playlists"], queryFn: playlistsApi.list });
  const userPlaylists = playlists.data?.filter((playlist) => !isOnlineMix(playlist)) ?? [];
  const onlineMixes = playlists.data?.filter(isOnlineMix) ?? [];
  const visiblePlaylists = activeTab === "playlists" ? userPlaylists : onlineMixes;
  const createMutation = useMutation({
    mutationFn: playlistsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      showToast("Playlist created");
    },
    onError: (error) => showToast(getErrorMessage(error), "error")
  });
  const deleteMutation = useMutation({
    mutationFn: (playlist: Playlist) => playlistsApi.remove(playlist.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      showToast("Playlist deleted");
    },
    onError: (error) => showToast(getErrorMessage(error), "error")
  });

  function deletePlaylist(playlist: Playlist) {
    const confirmed = window.confirm(`Delete "${playlist.name}" from your library?`);
    if (!confirmed) return;
    deleteMutation.mutate(playlist);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 rounded-lg bg-gradient-to-b from-zinc-800/80 to-zinc-950/30 p-5">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-400">
            <Grid2X2 size={17} />
            Collection
          </p>
          <h1 className="text-3xl font-black sm:text-5xl">Your Library</h1>
          <p className="mt-1 text-sm text-zinc-500">Your playlists and saved collections.</p>
        </div>
        <button
          className="inline-flex h-11 items-center gap-2 rounded-full bg-wave px-5 font-bold text-black hover:scale-[1.02]"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={18} />
          New
        </button>
      </div>
      {playlists.isLoading && <LoadingSkeleton rows={5} />}
      {playlists.error && <p className="rounded-lg border border-coral/30 bg-coral/10 p-4 text-sm text-rose-100">{getErrorMessage(playlists.error)}</p>}
      {!!playlists.data?.length && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              activeTab === "playlists" ? "bg-white text-black" : "bg-white/10 text-zinc-300 hover:bg-white/15 hover:text-white"
            }`}
            onClick={() => setActiveTab("playlists")}
          >
            Playlists {userPlaylists.length ? `(${userPlaylists.length})` : ""}
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              activeTab === "online" ? "bg-white text-black" : "bg-white/10 text-zinc-300 hover:bg-white/15 hover:text-white"
            }`}
            onClick={() => setActiveTab("online")}
          >
            Saved online mixes {onlineMixes.length ? `(${onlineMixes.length})` : ""}
          </button>
        </div>
      )}
      {!!playlists.data?.length && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {visiblePlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onDelete={deletePlaylist}
              deleting={deleteMutation.isPending && deleteMutation.variables?.id === playlist.id}
            />
          ))}
        </div>
      )}
      {!playlists.isLoading && playlists.data?.length === 0 && <p className="text-sm text-zinc-500">No playlists yet.</p>}
      {!playlists.isLoading && !!playlists.data?.length && visiblePlaylists.length === 0 && (
        <p className="text-sm text-zinc-500">
          {activeTab === "playlists" ? "No manual playlists yet." : "No saved online mixes yet."}
        </p>
      )}
      <CreatePlaylistModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async (input) => {
          await createMutation.mutateAsync(input);
        }}
      />
    </div>
  );
}
