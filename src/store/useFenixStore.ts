import { create } from 'zustand';
import api from '../api/client';

interface FenixState {
  progressoDashboard: any;
  disciplinas: any[];
  aps: any[];
  fetchProgresso: () => Promise<void>;
  fetchDisciplinas: () => Promise<void>;
  fetchAps: () => Promise<void>;
  marcarChecklist: (id: number, concluido: boolean) => Promise<void>;
  clearData: () => void;
}

export const useFenixStore = create<FenixState>((set, get) => ({
  progressoDashboard: null,
  disciplinas: [],
  aps: [],

  clearData: () => set({
    progressoDashboard: null,
    disciplinas: [],
    aps: []
  }),

  fetchProgresso: async () => {
    try {
      const { data } = await api.get('/insights/progresso');
      set({ progressoDashboard: data });
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
    }
  },

  fetchDisciplinas: async () => {
    try {
      const { data } = await api.get('/academic');
      set({ disciplinas: data });
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error);
    }
  },

  fetchAps: async () => {
    try {
      const { data } = await api.get('/activity');
      set({ aps: data });
    } catch (error) {
      console.error('Erro ao buscar APs:', error);
    }
  },

  marcarChecklist: async (id, concluido) => {
    try {
      await api.put(`/checklist/${id}`, { concluido });
      // Invalidação de cache / Reatividade imediata
      get().fetchProgresso();
      get().fetchAps();
    } catch (error) {
      console.error('Erro ao atualizar checklist:', error);
    }
  }
}));
