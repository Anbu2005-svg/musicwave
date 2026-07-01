import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreatePlaylistModal from "../components/CreatePlaylistModal";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PlaylistCard from "../components/PlaylistCard";
import { getErrorMessage, playlistsApi } from "../services/api";
import { useToastStore } from "../stores/toastStore";

export default function LibraryPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const playlists = useQuery({ queryKey: ["playlists"], queryFn: playlistsApi.list });
  const createMutation = useMutation({
    mutationFn: playlistsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      showToast("Playlist created");
    },
    onError: (error) => showToast(getErrorMessage(error), "error")
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Library</h1>
          <p className="mt-1 text-sm text-zinc-500">Your playlists and saved collections.</p>
        </div>
        <button
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-wave px-4 font-semibold text-black hover:brightness-110"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={18} />
          New
        </button>
      </div>
      {playlists.isLoading && <LoadingSkeleton rows={5} />}
      {playlists.error && <p className="rounded-lg border border-coral/30 bg-coral/10 p-4 text-sm text-rose-100">{getErrorMessage(playlists.error)}</p>}
      {!!playlists.data?.length && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {playlists.data.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
      {!playlists.isLoading && playlists.data?.length === 0 && <p className="text-sm text-zinc-500">No playlists yet.</p>}
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
