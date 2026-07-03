import { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Trash2, X } from "lucide-react";
import { usePlayerStore } from "../stores/playerStore";

export default function QueueDrawer() {
  const open = usePlayerStore((state) => state.queueOpen);
  const queue = usePlayerStore((state) => state.queue);
  const setOpen = usePlayerStore((state) => state.setQueueOpen);
  const remove = usePlayerStore((state) => state.removeFromQueue);
  const clear = usePlayerStore((state) => state.clearQueue);
  const reorderQueue = usePlayerStore((state) => state.reorderQueue);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const moveQueueItem = (index: number, offset: number) => {
    reorderQueue(index, index + offset);
  };

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
          {queue.map((song, index) => (
            <div
              key={song.videoId}
              draggable
              className={`flex items-center gap-2 rounded-lg border p-2 transition ${
                dropIndex === index
                  ? "border-wave bg-wave/10"
                  : draggedIndex === index
                    ? "border-line bg-zinc-900 opacity-60"
                    : "border-transparent bg-panel"
              }`}
              onDragStart={(event) => {
                setDraggedIndex(index);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(index));
              }}
              onDragEnter={() => setDropIndex(index)}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                event.preventDefault();
                const fromIndex = draggedIndex ?? Number(event.dataTransfer.getData("text/plain"));
                reorderQueue(fromIndex, index);
                setDraggedIndex(null);
                setDropIndex(null);
              }}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDropIndex(null);
              }}
            >
              <button
                className="grid h-9 w-7 shrink-0 cursor-grab place-items-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-white active:cursor-grabbing"
                title="Drag to reorder"
                aria-label="Drag to reorder"
              >
                <GripVertical size={17} />
              </button>
              <img src={song.thumbnail} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{song.title}</p>
                <p className="truncate text-xs text-zinc-500">{song.channelTitle}</p>
              </div>
              <div className="grid shrink-0 grid-rows-2 overflow-hidden rounded-lg border border-line">
                <button
                  className="grid h-5 w-8 place-items-center hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
                  onClick={() => moveQueueItem(index, -1)}
                  disabled={index === 0}
                  title="Move up"
                  aria-label="Move up"
                >
                  <ChevronUp size={15} />
                </button>
                <button
                  className="grid h-5 w-8 place-items-center hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
                  onClick={() => moveQueueItem(index, 1)}
                  disabled={index === queue.length - 1}
                  title="Move down"
                  aria-label="Move down"
                >
                  <ChevronDown size={15} />
                </button>
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
