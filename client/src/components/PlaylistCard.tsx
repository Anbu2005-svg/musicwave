import { Link } from "react-router-dom";
import { ListMusic, Trash2 } from "lucide-react";
import type { Playlist } from "../types";

type Props = {
  playlist: Playlist;
  onDelete?: (playlist: Playlist) => void;
  deleting?: boolean;
};

export default function PlaylistCard({ playlist, onDelete, deleting = false }: Props) {
  return (
    <article className="group relative rounded-lg bg-panel p-3 transition hover:bg-zinc-800">
      {onDelete && (
        <button
          className="absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-lg bg-black/75 text-coral opacity-100 transition hover:bg-coral hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onDelete(playlist);
          }}
          disabled={deleting}
          title="Delete playlist"
        >
          <Trash2 size={16} />
        </button>
      )}
      <Link to={`/playlists/${playlist.id}`} className="block">
        <div className="mb-3 grid aspect-square place-items-center overflow-hidden rounded-lg bg-zinc-900">
          {playlist.coverImage ? (
            <img src={playlist.coverImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <ListMusic className="text-zinc-600" size={48} />
          )}
        </div>
        <h3 className="truncate text-sm font-semibold">{playlist.name}</h3>
        <p className="mt-1 line-clamp-2 min-h-8 text-xs text-zinc-500">{playlist.description || "Playlist"}</p>
      </Link>
    </article>
  );
}
