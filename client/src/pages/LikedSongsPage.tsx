import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Heart } from "lucide-react";
import LoadingSkeleton from "../components/LoadingSkeleton";
import SongRow from "../components/SongRow";
import { getErrorMessage, likedApi } from "../services/api";
import { useToastStore } from "../stores/toastStore";
import { downloadPlaylist } from "../utils/download";

export default function LikedSongsPage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const liked = useQuery({ queryKey: ["liked"], queryFn: likedApi.list });
  const unlikeMutation = useMutation({
    mutationFn: likedApi.unlike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liked"] });
      showToast("Removed from Liked Songs");
    },
    onError: (error) => showToast(getErrorMessage(error), "error")
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-lg bg-coral/20 text-coral">
            <Heart size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-coral">Collection</p>
            <h1 className="text-3xl font-black">Liked Songs</h1>
          </div>
        </div>
        {liked.data && liked.data.length > 0 && (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800"
            onClick={() => downloadPlaylist(liked.data!, "Liked Songs")}
          >
            <Download size={18} />
            Download All
          </button>
        )}
      </div>
      {liked.isLoading && <LoadingSkeleton rows={8} />}
      {liked.error && <p className="rounded-lg border border-coral/30 bg-coral/10 p-4 text-sm text-rose-100">{getErrorMessage(liked.error)}</p>}
      <div className="space-y-1">
        {liked.data?.map((song) => (
          <SongRow key={song.videoId} song={song} queue={liked.data} onRemove={() => unlikeMutation.mutate(song.videoId)} />
        ))}
      </div>
      {!liked.isLoading && liked.data?.length === 0 && <p className="text-sm text-zinc-500">Songs you like will appear here.</p>}
    </div>
  );
}
