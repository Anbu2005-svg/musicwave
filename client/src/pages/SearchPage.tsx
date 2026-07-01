import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import LoadingSkeleton from "../components/LoadingSkeleton";
import SongRow from "../components/SongRow";
import { useDebounce } from "../hooks/useDebounce";
import { getErrorMessage, musicApi } from "../services/api";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState(params.get("q") ?? "");
  const debounced = useDebounce(term.trim(), 450);
  const search = useQuery({
    queryKey: ["music", "search", debounced],
    queryFn: () => musicApi.search(debounced),
    enabled: debounced.length > 1
  });

  useEffect(() => {
    const current = params.get("q") ?? "";
    if (current !== term) setTerm(current);
  }, [params]);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debounced) next.set("q", debounced);
    else next.delete("q");
    setParams(next, { replace: true });
  }, [debounced]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black">Search</h1>
        <div className="relative mt-4 max-w-2xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Find music on YouTube"
            className="h-12 w-full rounded-lg border border-line bg-zinc-900 py-2 pl-11 pr-4 outline-none focus:border-wave"
            autoFocus
          />
        </div>
      </div>
      {search.isLoading && <LoadingSkeleton rows={8} />}
      {search.error && <p className="rounded-lg border border-coral/30 bg-coral/10 p-4 text-sm text-rose-100">{getErrorMessage(search.error)}</p>}
      {!debounced && <p className="text-sm text-zinc-500">Start typing to search for music.</p>}
      <div className="space-y-1">
        {search.data?.map((song) => (
          <SongRow key={song.videoId} song={song} queue={search.data} />
        ))}
      </div>
    </div>
  );
}
