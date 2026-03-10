import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  notifications: Record<string, boolean>;
  toggleNotification: (shiurId: string) => void;
  isNotificationEnabled: (shiurId: string) => boolean;
  favoriteChavruta: string[];
  toggleFavoriteChavruta: (id: string) => void;
  userName: string;
  userAvatar: string;
  setUserProfile: (name: string, avatar?: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      notifications: {},
      toggleNotification: (shiurId) =>
        set((s) => ({
          notifications: { ...s.notifications, [shiurId]: !s.notifications[shiurId] },
        })),
      isNotificationEnabled: (shiurId) => !!get().notifications[shiurId],
      favoriteChavruta: [],
      toggleFavoriteChavruta: (id) =>
        set((s) => ({
          favoriteChavruta: s.favoriteChavruta.includes(id)
            ? s.favoriteChavruta.filter((f) => f !== id)
            : [...s.favoriteChavruta, id],
        })),
      userName: '',
      userAvatar: '🧑',
      setUserProfile: (name, avatar) =>
        set({ userName: name, userAvatar: avatar ?? get().userAvatar }),
    }),
    { name: 'cteen-store', storage: createJSONStorage(() => AsyncStorage) }
  )
);
