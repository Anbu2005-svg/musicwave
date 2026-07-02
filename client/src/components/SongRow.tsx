import { Heart, ListPlus, Play, Plus, SkipForward, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getErrorMessage, likedApi } from "../services/api";
import { usePlayerStore } from "../stores/playerStore";
import { useToastStore } from "../stores/toastStore";
import type { MusicVideo } from "../types";
import { relativeDate } from "../utils/song";
import AddToPlaylistModal from "./AddToPlaylistModal";

type Props = {
  song: MusicVideo;
  queue?: MusicVideo[];
  onRemove?: () => void;
};

export default function SongRow({ song, queue = [], onRemove }: Props) {
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const playNext = usePlayerStore((state) => state.playNext);
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();
  const liked = useQuery({ queryKey: ["liked"], queryFn: likedApi.list });
  const isLiked = Boolean(onRemove) || Boolean(liked.data?.some((likedSong) => likedSong.videoId === song.videoId));
  const likeMutation = useMutation({
    mutationFn: () => likedApi.like(song),
    onSuccess: (savedSong) => {
      queryClient.setQueryData<MusicVideo[]>(["liked"], (current = []) =>
        current.some((likedSong) => likedSong.videoId === savedSong.videoId) ? current : [savedSong, ...current]
      );
      queryClient.invalidateQueries({ queryKey: ["liked"] });
      showToast("Saved to Liked Songs");
    },
    onError: (error) => showToast(getErrorMessage(error), "error")
  });

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/5 sm:grid-cols-[auto_1fr_10rem_auto]">
      <button
        className="relative h-14 w-14 overflow-hidden rounded-lg bg-zinc-900"
        onClick={() => playTrack(song, queue.filter((item) => item.videoId !== song.videoId))}
        title="Play"
      >
        <img src={song.thumbnail} alt="" className="h-full w-full object-cover" />
        <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition hover:opacity-100">
          <Play size={19} fill="currentColor" />
        </span>
      </button>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{song.title}</p>
        <p className="truncate text-xs text-zinc-500">{song.channelTitle}</p>
      </div>
      <span className="hidden text-sm text-zinc-500 sm:block">{relativeDate(song.publishedAt)}</span>
      <div className="flex items-center">
        <button
          className={`grid h-9 w-9 place-items-center rounded-lg hover:bg-zinc-800 ${isLiked ? "text-coral" : "text-zinc-300"}`}
          onClick={() => {
            if (!isLiked) likeMutation.mutate();
          }}
          title={isLiked ? "Liked" : "Like"}
          disabled={likeMutation.isPending}
        >
          <Heart size={17} fill={isLiked ? "currentColor" : "none"} />
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-lg text-zinc-300 hover:bg-zinc-800" onClick={() => setPlaylistOpen(true)} title="Add to playlist">
          <Plus size={17} />
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-lg text-zinc-300 hover:bg-zinc-800" onClick={() => addToQueue(song)} title="Add to queue">
          <ListPlus size={17} />
        </button>
        <button
          className="grid h-9 w-9 place-items-center rounded-lg text-zinc-300 hover:bg-zinc-800"
          onClick={() => {
            playNext(song);
            showToast("Added to play next");
          }}
          title="Add to next"
        >
          <SkipForward size={17} />
        </button>
        {onRemove && (
          <button className="grid h-9 w-9 place-items-center rounded-lg text-coral hover:bg-zinc-800" onClick={onRemove} title="Remove">
            <Trash2 size={17} />
          </button>
        )}
      </div>
      <AddToPlaylistModal song={song} open={playlistOpen} onClose={() => setPlaylistOpen(false)} />
    </div>
  );
}
