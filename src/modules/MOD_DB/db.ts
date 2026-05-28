import Dexie, { type EntityTable } from 'dexie';

// --- Interfaces ---

export interface Usuario {
  id?: number;
  nome: string;
  ra: string;
  email: string;
  senha_hash: string; // Senha real não deve ser exposta offline, mas guardamos um hash ou valor cru (para projeto offline)
  curso?: string;
  semestre_atual?: number;
  total_semestres?: number;
}

export interface Disciplina {
  id?: number;
  user_id: number;
  nome: string;
  professor: string;
  semestre: string;
}

export interface AP {
  id?: number;
  user_id: number;
  id_disciplina: number;
  titulo: string;
  tipo: string; // 'AP' ou 'PF'
}

export interface ChecklistItem {
  id?: number;
  id_ap: number;
  descricao: string;
  concluido: boolean;
  data_entrega?: string; // ISO date string
  arquivo_nome?: string; // Para exibir o nome original do arquivo
  arquivo_blob?: Blob; // Armazena o blob fisicamente no IndexedDB
}

// --- Definição do Banco ---

const db = new Dexie('FenixDatabase') as Dexie & {
  usuarios: EntityTable<Usuario, 'id'>;
  disciplinas: EntityTable<Disciplina, 'id'>;
  aps: EntityTable<AP, 'id'>;
  checklist: EntityTable<ChecklistItem, 'id'>;
};

// --- Schema (Apenas chaves indexadas) ---
// O `++id` significa auto-incremento. Índices secundários vêm em seguida separados por vírgula.
db.version(1).stores({
  usuarios: '++id, ra, email',
  disciplinas: '++id, user_id, semestre',
  aps: '++id, user_id, id_disciplina, tipo',
  checklist: '++id, id_ap, concluido, data_entrega'
});

// --- Dica 1: Blindar a Persistência ---
// Pede ao navegador para não limpar os dados silenciosamente
export async function tryPersist() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    console.log(`IndexedDB persistence granted: ${isPersisted}`);
  }
}

export { db };
