import { Heart, ListPlus, Play, Plus, SkipForward } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getErrorMessage, likedApi } from "../services/api";
import { usePlayerStore } from "../stores/playerStore";
import { useToastStore } from "../stores/toastStore";
import type { MusicVideo } from "../types";
import AddToPlaylistModal from "./AddToPlaylistModal";

type Props = {
  song: MusicVideo;
  queue?: MusicVideo[];
};

export default function SongCard({ song, queue = [] }: Props) {
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const playNext = usePlayerStore((state) => state.playNext);
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();
  const liked = useQuery({ queryKey: ["liked"], queryFn: likedApi.list });
  const isLiked = Boolean(liked.data?.some((likedSong) => likedSong.videoId === song.videoId));
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
    <article className="group w-44 shrink-0 rounded-lg bg-zinc-900/70 p-3 transition duration-200 hover:bg-zinc-800 hover:shadow-xl hover:shadow-black/30">
      <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-zinc-900">
        <img src={song.thumbnail} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
        <button
          className="absolute bottom-2 right-2 grid h-11 w-11 translate-y-2 place-items-center rounded-full bg-wave text-black opacity-0 shadow-glow transition hover:scale-105 group-hover:translate-y-0 group-hover:opacity-100"
          onClick={() => playTrack(song, queue.filter((item) => item.videoId !== song.videoId))}
          title="Play"
        >
          <Play size={20} fill="currentColor" />
        </button>
      </div>
      <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5">{song.title}</h3>
      <p className="mt-1 truncate text-xs text-zinc-400">{song.channelTitle}</p>
      <div className="mt-3 flex items-center gap-1">
        <button
          className={`grid h-8 w-8 place-items-center rounded-lg hover:bg-zinc-700 ${isLiked ? "text-coral" : ""}`}
          onClick={() => {
            if (!isLiked) likeMutation.mutate();
          }}
          title={isLiked ? "Liked" : "Like"}
          disabled={likeMutation.isPending}
        >
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-lg hover:bg-zinc-700" onClick={() => setPlaylistOpen(true)} title="Add to playlist">
          <Plus size={16} />
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-lg hover:bg-zinc-700" onClick={() => addToQueue(song)} title="Add to queue">
          <ListPlus size={16} />
        </button>
        <button
          className="grid h-8 w-8 place-items-center rounded-lg hover:bg-zinc-700"
          onClick={() => {
            playNext(song);
            showToast("Added to play next");
          }}
          title="Add to next"
        >
          <SkipForward size={16} />
        </button>
      </div>
      <AddToPlaylistModal song={song} open={playlistOpen} onClose={() => setPlaylistOpen(false)} />
    </article>
  );
}
