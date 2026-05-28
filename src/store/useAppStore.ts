import { create } from 'zustand';

// Estado efêmero da sessão (não salva dados offline pesados, apenas quem está logado no momento)
export interface UserProfile {
  ra: string;
  nome?: string;
  curso?: string;
  semestre_atual?: number;
  total_semestres?: number;
  email?: string;
  id?: number;
}

export interface AppState {
  // Autenticação e Sessão
  userProfile: UserProfile | null;
  authToken: string | null;

  // Ações
  setUserProfile: (profile: UserProfile) => void;
  setAuthToken: (token: string) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  userProfile: null,
  authToken: null,

  setUserProfile: (profile) => set({ userProfile: profile }),
  setAuthToken: (token) => set({ authToken: token }),
  logout: () => {
    localStorage.removeItem('fenix_token');
    localStorage.removeItem('fenix_user_profile');
    set({
      userProfile: null,
      authToken: null,
    });
  },
}));
