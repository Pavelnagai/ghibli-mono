import { create } from 'zustand';
import { User } from '@telegram-apps/sdk-react';

interface AuthState {
  telegramUser: User | null;
  setTelegramUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  telegramUser: null,
  setTelegramUser: (telegramUser) => set({ telegramUser }),
}));
