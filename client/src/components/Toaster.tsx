import { X } from "lucide-react";
import { useToastStore } from "../stores/toastStore";

export default function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="fixed right-4 top-4 z-[80] w-[min(22rem,calc(100vw-2rem))] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-xl ${
            toast.tone === "error"
              ? "border-coral/40 bg-coral/15 text-rose-100"
              : "border-wave/40 bg-wave/15 text-emerald-100"
          }`}
        >
          <p className="min-w-0 flex-1">{toast.message}</p>
          <button onClick={() => dismiss(toast.id)} title="Dismiss">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
