import { FileInput, Globe2, Heart, Home, Library, ListMusic, Radio, Search, X } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/library", label: "Library", icon: Library },
  { to: "/library", label: "Playlists", icon: ListMusic },
  { to: "/online-playlists", label: "Online Playlists", icon: Radio },
  { to: "/import-playlist", label: "Import Playlist", icon: FileInput },
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
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-line bg-zinc-950/95 px-4 py-5 backdrop-blur transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3" onClick={onClose}>
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-wave text-xl font-black text-black">
              M
            </span>
            <span>
              <span className="block text-lg font-bold">MusicWave</span>
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
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={`${label}-${to}`}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
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
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
            onClick={() => {
              onPreferences();
              onClose();
            }}
          >
            <Globe2 size={19} />
            Preferences
          </button>
        </nav>
        <div className="mt-auto rounded-lg border border-line bg-panel p-4 text-sm text-zinc-400">
          Playback uses the official visible YouTube IFrame Player. No downloads, proxies, or audio extraction.
        </div>
      </aside>
    </>
  );
}
