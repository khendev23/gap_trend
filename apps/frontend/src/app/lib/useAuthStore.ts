// store/useAuthStore.ts
import { create } from 'zustand';

export type AuthUser = {
    id: string;
    name?: string | null;
    role?: string | null;
    approval?: string | null;
} | null;

interface AuthState {
    user: AuthUser;
    setUser: (user: AuthUser | null) => void;
    isInitialized: boolean;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isInitialized: false, // 서버 데이터가 클라이언트에 주입되었는지 확인용
    setUser: (user) => set({ user, isInitialized: true }),
    logout: () => set({ user: null, isInitialized: true }),
}));