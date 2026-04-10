import { create } from "zustand";

interface AuthState {
  user: any;
  token: string | null;
  setAuth: (data: any) => void;
  loadFromStorage: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  setAuth: (data) => {
    sessionStorage.setItem("token", data.token);

    set({
      user: data.user,
      token: data.token,
    });
  },

  loadFromStorage: () => {
    const token = sessionStorage.getItem("token");
    if (token) set({ token });
  },

  logout: () => {
    sessionStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));