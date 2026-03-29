import { create } from "zustand";
import { api } from "@/lib/api";

interface User {
  id: string;
  username: string;
  display_name: string;
  role: string;
  email?: string;
  has_password?: boolean;
  has_passkey?: boolean;
  has_oauth?: boolean;
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  logout: async () => {
    await api.logout();
    set({ user: null });
  },
}));
