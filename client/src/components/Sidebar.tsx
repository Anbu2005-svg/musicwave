import { FileInput, Globe2, Heart, Home, Library, ListMusic, Plus, Radio, Search, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import EqualizerPanel from "./EqualizerPanel";

const primaryLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search }
];

const libraryLinks = [
  { to: "/library", label: "Your Library", icon: Library },
  { to: "/online-playlists", label: "Online Playlists", icon: Radio },
  { to: "/import-playlist", label: "Import", icon: FileInput },
  { to: "/liked", label: "Liked Songs", icon: Heart }
];

type Props = {
  open: boolean;
  onClose: () => void;
  onPreferences: () => void;
};

export default function Sidebar({ open, onClose, onPreferences }: Props) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-72 flex-col gap-3 overflow-y-auto bg-black p-3 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="rounded-lg bg-zinc-950 p-3">
          <div className="mb-4 flex items-center justify-between">
          <NavLink to="/" className="flex min-w-0 items-center gap-3" onClick={onClose}>
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-wave text-xl font-black text-black">
              M
            </span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-bold">MusicWave</span>
              <span className="text-xs text-zinc-400">YouTube-powered music</span>
            </span>
          </NavLink>
          <button
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-300 hover:bg-zinc-800 lg:hidden"
            onClick={onClose}
            title="Close menu"
          >
            <X size={18} />
          </button>
          </div>
          <nav className="space-y-1">
            {primaryLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={`${label}-${to}`}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="rounded-lg bg-zinc-950 p-3">
          <div className="mb-2 flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3 text-sm font-bold text-zinc-300">
              <ListMusic size={20} />
              Collection
            </div>
            <NavLink
              to="/library"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
              title="Create playlist"
            >
              <Plus size={18} />
            </NavLink>
          </div>
          <nav className="space-y-1">
          {libraryLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={`${label}-${to}`}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
            onClick={() => {
              onPreferences();
              onClose();
            }}
          >
            <Globe2 size={19} />
            Preferences
          </button>
        </nav>
        </div>
        <EqualizerPanel />
      </aside>
    </>
  );
}
