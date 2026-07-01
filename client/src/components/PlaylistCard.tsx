import { Link } from "react-router-dom";
import { ListMusic } from "lucide-react";
import type { Playlist } from "../types";

export default function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <Link to={`/playlists/${playlist.id}`} className="block rounded-lg bg-panel p-3 transition hover:bg-zinc-800">
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
  );
}
