import { create } from "zustand";
import type { User } from "../types";

type AuthState = {
  user: User | null;
  token: string | null;
  setSession: (user: User, token: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
};

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("musicwave_user") ?? "null") as User | null;
  } catch {
    localStorage.removeItem("musicwave_user");
    localStorage.removeItem("musicwave_token");
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem("musicwave_token"),
  setSession: (user, token) => {
    localStorage.setItem("musicwave_token", token);
    localStorage.setItem("musicwave_user", JSON.stringify(user));
    set({ user, token });
  },
  setUser: (user) => {
    if (user) {
      localStorage.setItem("musicwave_user", JSON.stringify(user));
    }
    set({ user });
  },
  logout: () => {
    localStorage.removeItem("musicwave_token");
    localStorage.removeItem("musicwave_user");
    set({ user: null, token: null });
  }
}));
