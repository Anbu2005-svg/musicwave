import { Trash2, X } from "lucide-react";
import { usePlayerStore } from "../stores/playerStore";

export default function QueueDrawer() {
  const open = usePlayerStore((state) => state.queueOpen);
  const queue = usePlayerStore((state) => state.queue);
  const setOpen = usePlayerStore((state) => state.setQueueOpen);
  const remove = usePlayerStore((state) => state.removeFromQueue);
  const clear = usePlayerStore((state) => state.clearQueue);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed bottom-0 right-0 top-0 z-[60] flex w-[min(26rem,100vw)] flex-col border-l border-line bg-zinc-950 p-5 transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-5 flex shrink-0 items-center justify-between">
          <h2 className="text-xl font-bold">Queue</h2>
          <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-zinc-800" onClick={() => setOpen(false)} title="Close queue">
            <X size={18} />
          </button>
        </div>
        <button
          className="mb-4 w-fit shrink-0 rounded-lg border border-line px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 disabled:opacity-40"
          onClick={clear}
          disabled={!queue.length}
        >
          Clear queue
        </button>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {queue.length === 0 && <p className="text-sm text-zinc-500">Your next songs will appear here.</p>}
          {queue.map((song) => (
            <div key={song.videoId} className="flex items-center gap-3 rounded-lg bg-panel p-2">
              <img src={song.thumbnail} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{song.title}</p>
                <p className="truncate text-xs text-zinc-500">{song.channelTitle}</p>
              </div>
              <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-zinc-800" onClick={() => remove(song.videoId)} title="Remove from queue">
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
