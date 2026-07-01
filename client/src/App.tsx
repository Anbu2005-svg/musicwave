import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { authApi } from "./services/api";
import { useAuthStore } from "./stores/authStore";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Toaster from "./components/Toaster";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import LibraryPage from "./pages/LibraryPage";
import PlaylistDetailsPage from "./pages/PlaylistDetailsPage";
import LikedSongsPage from "./pages/LikedSongsPage";
import OnlinePlaylistsPage from "./pages/OnlinePlaylistsPage";
import ImportPlaylistPage from "./pages/ImportPlaylistPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!token) return;
    authApi.me().then(setUser).catch(logout);
  }, [token, setUser, logout]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/online-playlists" element={<OnlinePlaylistsPage />} />
          <Route path="/import-playlist" element={<ImportPlaylistPage />} />
          <Route path="/playlists/:id" element={<PlaylistDetailsPage />} />
          <Route path="/liked" element={<LikedSongsPage />} />
        </Route>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
