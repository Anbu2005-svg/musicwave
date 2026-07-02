import { useQuery } from "@tanstack/react-query";
import { Radio, Search } from "lucide-react";
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
      <div className="mb-6 rounded-lg bg-gradient-to-b from-zinc-800/80 to-zinc-950/30 p-5">
        <p className="mb-2 flex items-center gap-2 text-sm font-bold text-wave">
          <Radio size={17} />
          Discover
        </p>
        <h1 className="text-3xl font-black sm:text-5xl">Search MusicWave</h1>
        <div className="relative mt-5 max-w-3xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Find music on YouTube"
            className="h-14 w-full rounded-full border border-white/10 bg-zinc-900 py-2 pl-12 pr-4 text-base outline-none placeholder:text-zinc-500 hover:border-white/25 focus:border-white"
            autoFocus
          />
        </div>
      </div>
      {search.isLoading && <LoadingSkeleton rows={8} />}
      {search.error && <p className="rounded-lg border border-coral/30 bg-coral/10 p-4 text-sm text-rose-100">{getErrorMessage(search.error)}</p>}
      {!debounced && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Tamil hits", "Hindi melodies", "English pop", "Workout mix"].map((prompt) => (
            <button
              key={prompt}
              className="rounded-lg bg-zinc-900/70 p-5 text-left text-lg font-black transition hover:bg-zinc-800"
              onClick={() => setTerm(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
      <div className="space-y-1">
        {search.data?.map((song) => (
          <SongRow key={song.videoId} song={song} queue={search.data} />
        ))}
      </div>
    </div>
  );
}
