import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";
import api from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  fetchMe: () => Promise<void>;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isHydrated: false,

      login: async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        if (typeof window !== "undefined") localStorage.setItem("token", data.token);
        set({ user: data.user, token: data.token });
      },

      logout: () => {
        if (typeof window !== "undefined") localStorage.removeItem("token");
        set({ user: null, token: null });
      },

      setUser: (user) => set({ user }),

      fetchMe: async () => {
        const { token } = get();
        if (!token) return;
        if (typeof window !== "undefined") localStorage.setItem("token", token);
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data });
        } catch (err: any) {
          // Only clear on explicit 401/403, not network errors
          if (err?.response?.status === 401 || err?.response?.status === 403) {
            if (typeof window !== "undefined") localStorage.removeItem("token");
            set({ user: null, token: null });
          }
        }
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "fv-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => { state?.setHydrated(); },
    }
  )
);
