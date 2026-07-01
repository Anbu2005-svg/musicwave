import { FormEvent, useState } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: { name: string; description?: string }) => Promise<void> | void;
  initial?: { name: string; description?: string | null };
  title?: string;
};

export default function CreatePlaylistModal({ open, onClose, onSubmit, initial, title = "Create playlist" }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    await onSubmit({ name, description });
    setSaving(false);
    if (!initial) {
      setName("");
      setDescription("");
    }
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-line bg-zinc-950 p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button type="button" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-zinc-800" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>
        <label className="mb-4 block text-sm font-medium">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-line bg-zinc-900 px-3 text-white outline-none focus:border-wave"
            required
            maxLength={100}
          />
        </label>
        <label className="mb-5 block text-sm font-medium">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 min-h-24 w-full resize-none rounded-lg border border-line bg-zinc-900 p-3 text-white outline-none focus:border-wave"
            maxLength={300}
          />
        </label>
        <button className="h-11 w-full rounded-lg bg-wave font-semibold text-black hover:brightness-110 disabled:opacity-50" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
