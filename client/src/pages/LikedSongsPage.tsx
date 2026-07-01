import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import LoadingSkeleton from "../components/LoadingSkeleton";
import SongRow from "../components/SongRow";
import { getErrorMessage, likedApi } from "../services/api";
import { useToastStore } from "../stores/toastStore";

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
      <div className="mb-6 flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-lg bg-coral/20 text-coral">
          <Heart size={28} />
        </div>
        <div>
          <p className="text-sm font-semibold text-coral">Collection</p>
          <h1 className="text-3xl font-black">Liked Songs</h1>
        </div>
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
