import { ChevronLeft, ChevronRight, LogOut, Menu, Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

type Props = {
  onMenu: () => void;
};

export default function Topbar({ onMenu }: Props) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-[92rem] items-center gap-3 px-4 sm:px-6 lg:px-7">
        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-zinc-300 hover:bg-zinc-800 lg:hidden"
          onClick={onMenu}
          title="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="hidden gap-2 lg:flex">
          <button className="grid h-9 w-9 place-items-center rounded-full bg-black/70 text-zinc-400 hover:text-white" onClick={() => history.back()} title="Back">
            <ChevronLeft size={20} />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-black/70 text-zinc-400 hover:text-white" onClick={() => history.forward()} title="Forward">
            <ChevronRight size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search songs, artists, moods"
            className="h-12 w-full rounded-full border border-white/10 bg-zinc-900/95 py-2 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 hover:border-white/25 focus:border-white"
          />
        </form>
        <div className="hidden min-w-0 rounded-full bg-black/70 py-1 pl-3 pr-1 text-right sm:flex sm:items-center sm:gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-wave text-sm font-black text-black">
            {(user?.name?.[0] ?? "M").toUpperCase()}
          </span>
          <span className="min-w-0">
          <p className="truncate text-sm font-semibold">{user?.name ?? "Listener"}</p>
          <p className="truncate text-xs text-zinc-500">{user?.email}</p>
          </span>
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-full text-zinc-300 hover:bg-zinc-800"
          onClick={logout}
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
