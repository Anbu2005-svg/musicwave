import { api } from "../services/api";
import { useToastStore } from "../stores/toastStore";

export async function downloadSong(song: { videoId: string; title: string }) {
  const showToast = useToastStore.getState().showToast;
  showToast(`Downloading "${song.title.slice(0, 30)}..."`, "success");

  const token = localStorage.getItem("musicwave_token");
  const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

  const safeTitle = song.title.replace(/[/\\?%*:|"<>]/g, "_").trim() || "song";

  try {
    const response = await api.get(`/music/download/${song.videoId}`, {
      params: { title: song.title },
      responseType: "blob"
    });

    const blob = new Blob([response.data], { type: "audio/mpeg" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${safeTitle}.mp3`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    showToast(`Downloaded "${song.title.slice(0, 30)}"`, "success");
  } catch {
    try {
      // Fallback: direct trigger
      const downloadUrl = `${baseURL}/music/download/${song.videoId}?token=${token}&title=${encodeURIComponent(song.title)}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.target = "_blank";
      link.setAttribute("download", `${safeTitle}.mp3`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Started download for "${song.title.slice(0, 30)}"`, "success");
    } catch {
      showToast("Download failed. Please try again.", "error");
    }
  }
}
