import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { authApi, getErrorMessage } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { useToastStore } from "../stores/toastStore";

const languages = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Kannada",
  "Bengali",
  "Marathi",
  "Punjabi",
  "Gujarati",
  "Urdu",
  "Odia",
  "Assamese"
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LanguagePreferencesModal({ open, onClose }: Props) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>(user?.languagePreferences ?? []);

  useEffect(() => {
    if (open) {
      setSelected(user?.languagePreferences ?? []);
    }
  }, [open, user?.languagePreferences]);

  const mutation = useMutation({
    mutationFn: () => authApi.updatePreferences(selected),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["music"] });
      showToast("Music preferences saved");
      onClose();
    },
    onError: (error) => showToast(getErrorMessage(error), "error")
  });

  if (!open || !user) return null;

  function toggle(language: string) {
    setSelected((current) =>
      current.includes(language)
        ? current.filter((item) => item !== language)
        : current.length < 6
          ? [...current, language]
          : current
    );
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 px-4">
      <div className="w-full max-w-xl rounded-lg border border-line bg-zinc-950 p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Choose your music languages</h2>
          <p className="mt-1 text-sm text-zinc-400">Pick up to 6 languages. Your home feed and recommendations will start with these.</p>
          </div>
          {user.languagePreferences?.length ? (
            <button className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900" onClick={onClose}>
              Close
            </button>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {languages.map((language) => {
            const active = selected.includes(language);
            return (
              <button
                key={language}
                type="button"
                onClick={() => toggle(language)}
                className={`h-11 rounded-lg border px-3 text-sm font-semibold transition ${
                  active ? "border-wave bg-wave text-black" : "border-line bg-zinc-900 text-zinc-200 hover:border-wave"
                }`}
              >
                {language}
              </button>
            );
          })}
        </div>
        <button
          className="mt-5 h-11 w-full rounded-lg bg-wave font-semibold text-black hover:brightness-110 disabled:opacity-50"
          disabled={selected.length === 0 || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Saving..." : "Save preferences"}
        </button>
      </div>
    </div>
  );
}
