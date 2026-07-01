import { LogOut, Menu, Search } from "lucide-react";
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
    <header className="sticky top-0 z-30 border-b border-line bg-ink/86 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-zinc-300 hover:bg-zinc-800 lg:hidden"
          onClick={onMenu}
          title="Open menu"
        >
          <Menu size={20} />
        </button>
        <form onSubmit={onSubmit} className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search songs, artists, moods"
            className="h-11 w-full rounded-lg border border-line bg-zinc-900 py-2 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-wave"
          />
        </form>
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-sm font-semibold">{user?.name ?? "Listener"}</p>
          <p className="truncate text-xs text-zinc-500">{user?.email}</p>
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-zinc-300 hover:bg-zinc-800"
          onClick={logout}
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
