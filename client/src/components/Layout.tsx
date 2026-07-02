import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import PlayerBar from "./PlayerBar";
import QueueDrawer from "./QueueDrawer";
import LanguagePreferencesModal from "./LanguagePreferencesModal";
import { useAuthStore } from "../stores/authStore";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const shouldAskPreferences = Boolean(user && (!user.languagePreferences || user.languagePreferences.length === 0));

  return (
    <div className="min-h-screen bg-transparent text-zinc-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onPreferences={() => setPreferencesOpen(true)} />
      <div className="min-h-screen pb-72 sm:pb-56 lg:pl-[18.5rem]">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 lg:px-7">
          <Outlet />
        </main>
      </div>
      <PlayerBar />
      <QueueDrawer />
      <LanguagePreferencesModal
        open={preferencesOpen || shouldAskPreferences}
        onClose={() => setPreferencesOpen(false)}
      />
    </div>
  );
}
