import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { getErrorMessage, playlistsApi } from "../services/api";
import { useToastStore } from "../stores/toastStore";
import type { MusicVideo } from "../types";

type Props = {
  song: MusicVideo;
  open: boolean;
  onClose: () => void;
};

export default function AddToPlaylistModal({ song, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const { data: playlists = [] } = useQuery({ queryKey: ["playlists"], queryFn: playlistsApi.list, enabled: open });
  const addMutation = useMutation({
    mutationFn: (playlistId: string) => playlistsApi.addSong(playlistId, song),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      showToast("Added to playlist");
      onClose();
    },
    onError: (error) => showToast(getErrorMessage(error), "error")
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg border border-line bg-zinc-950 p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add to playlist</h2>
          <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-zinc-800" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-2">
          {playlists.length === 0 && <p className="text-sm text-zinc-500">Create a playlist from Library first.</p>}
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-zinc-900"
              onClick={() => addMutation.mutate(playlist.id)}
            >
              <img
                src={playlist.coverImage ?? song.thumbnail}
                alt=""
                className="h-12 w-12 rounded-lg object-cover"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{playlist.name}</span>
                <span className="text-xs text-zinc-500">{playlist.songs?.length ?? 0} songs</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
