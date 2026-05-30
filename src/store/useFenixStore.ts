import { create } from 'zustand';
import api from '../api/client';

interface FenixState {
  progressoDashboard: any;
  disciplinas: any[];
  aps: any[];
  carregando: boolean;
  fetchProgresso: () => Promise<void>;
  fetchDisciplinas: () => Promise<void>;
  fetchAps: () => Promise<void>;
  marcarChecklist: (id: number, concluido: boolean) => Promise<void>;
  addDisciplina: (nome: string, descricao?: string) => Promise<void>;
  deleteDisciplina: (id: number) => Promise<void>;
  addAp: (titulo: string, tipo: string, disciplinaId: number) => Promise<void>;
  deleteAp: (id: number) => Promise<void>;
  addChecklistItem: (descricao: string, atividadeId: number) => Promise<void>;
  deleteChecklistItem: (id: number) => Promise<void>;
  uploadFile: (checklistItemId: number, file: File) => Promise<void>;
  aiInsight: string | null;
  gerandoInsight: boolean;
  apiKeySalva: boolean;
  saveGeminiKey: (key: string) => Promise<void>;
  checkGeminiKey: () => Promise<void>;
  fetchAiInsight: () => Promise<void>;
  clearData: () => void;
}

export const useFenixStore = create<FenixState>((set, get) => ({
  progressoDashboard: null,
  disciplinas: [],
  aps: [],
  carregando: false,
  aiInsight: null,
  gerandoInsight: false,
  apiKeySalva: false,

  clearData: () => set({
    progressoDashboard: null,
    disciplinas: [],
    aps: [],
    carregando: false,
    aiInsight: null,
    gerandoInsight: false,
    apiKeySalva: false
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
      // Reatividade imediata de toda a aplicação
      get().fetchProgresso();
      get().fetchAps();
      get().fetchDisciplinas();
    } catch (error) {
      console.error('Erro ao atualizar checklist:', error);
    }
  },

  addDisciplina: async (nome, descricao) => {
    try {
      set({ carregando: true });
      await api.post('/academic', { nome, descricao });
      await get().fetchDisciplinas();
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
    } finally {
      set({ carregando: false });
    }
  },

  deleteDisciplina: async (id) => {
    try {
      set({ carregando: true });
      await api.delete(`/academic/${id}`);
      await get().fetchDisciplinas();
      await get().fetchAps();
      await get().fetchProgresso();
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error);
    } finally {
      set({ carregando: false });
    }
  },

  addAp: async (titulo, tipo, disciplinaId) => {
    try {
      set({ carregando: true });
      // Guardamos o 'tipo' no campo descrição pois o banco relacional armazena titulo/descricao
      await api.post('/activity', { titulo, descricao: tipo, disciplinaId });
      await get().fetchAps();
      await get().fetchProgresso();
    } catch (error) {
      console.error('Erro ao adicionar AP:', error);
    } finally {
      set({ carregando: false });
    }
  },

  deleteAp: async (id) => {
    try {
      set({ carregando: true });
      await api.delete(`/activity/${id}`);
      await get().fetchAps();
      await get().fetchProgresso();
    } catch (error) {
      console.error('Erro ao deletar AP:', error);
    } finally {
      set({ carregando: false });
    }
  },

  addChecklistItem: async (descricao, atividadeId) => {
    try {
      set({ carregando: true });
      await api.post('/checklist', { descricao, atividadeId });
      await get().fetchAps();
      await get().fetchProgresso();
    } catch (error) {
      console.error('Erro ao adicionar item ao checklist:', error);
    } finally {
      set({ carregando: false });
    }
  },

  deleteChecklistItem: async (id) => {
    try {
      set({ carregando: true });
      await api.delete(`/checklist/${id}`);
      await get().fetchAps();
      await get().fetchProgresso();
    } catch (error) {
      console.error('Erro ao deletar item do checklist:', error);
    } finally {
      set({ carregando: false });
    }
  },

  uploadFile: async (checklistItemId, file) => {
    try {
      set({ carregando: true });
      const formData = new FormData();
      formData.append('arquivo', file);
      await api.post(`/checklist/${checklistItemId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      await get().fetchAps();
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw error;
    } finally {
      set({ carregando: false });
    }
  },

  saveGeminiKey: async (key) => {
    try {
      set({ carregando: true });
      await api.post('/insights/config-ai', { apiKey: key });
      set({ apiKeySalva: true });
    } catch (error) {
      console.error('Erro ao salvar chave da API:', error);
    } finally {
      set({ carregando: false });
    }
  },

  checkGeminiKey: async () => {
    try {
      const { data } = await api.get('/insights/config-ai');
      set({ apiKeySalva: data.hasKey });
    } catch (error) {
      console.error('Erro ao verificar chave da API:', error);
    }
  },

  fetchAiInsight: async () => {
    try {
      set({ gerandoInsight: true });
      const { data } = await api.get('/insights/ai-advisor');
      set({ aiInsight: data.insight });
    } catch (error) {
      console.error('Erro ao buscar insight:', error);
      // Opcionalmente podemos notificar o usuário aqui
    } finally {
      set({ gerandoInsight: false });
    }
  }
}));
