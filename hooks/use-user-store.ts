import { create } from 'zustand';

interface UserState {
  userName: string | null;
  setUserName: (name: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userName: null, // Estado inicial
  setUserName: (name) => set({ userName: name }),
  logout: () => set({ userName: null }),
}));