# Plano de Implementação - Migração Completa para SQLite

Este plano descreve as etapas necessárias para migrar o banco de dados da aplicação de **IndexedDB (Dexie.js)** para o **SQLite de forma nativa** (através da API Express + Prisma). Isso garantirá que absolutamente todos os dados criados pelo usuário (disciplinas, avaliações, checklists e uploads) sejam gravados diretamente no arquivo físico `database.db` no seu computador.

---

## 📌 Escopo e Objetivos

* **Eliminar a dependência do Dexie (IndexedDB) nas páginas:** Fazer com que o frontend consulte e salve tudo na API local do Express, que por sua vez manipula o SQLite via Prisma.
* **Isolamento de Dados Estrito:** Garantir que as rotas da API persistam as informações atreladas ao usuário autenticado (`req.userId`), impedindo vazamento de dados.
* **Apresentação Acadêmica de Sucesso:** Fornecer um painel limpo por padrão para novos usuários e preencher os dados de forma transparente no SQLite, permitindo demonstrar a persistência ao professor.

---

## 🛠️ Mudanças Propostas

Separamos as modificações necessárias por componentes.

### 1. Estado Global (Zustand Store)

#### [MODIFY] [useFenixStore.ts](file:///c:/Users/suporte/Desktop/projeto_fenix-main/src/store/useFenixStore.ts)
Expandir a store para gerenciar todas as operações assíncronas do backend e atualizar o estado reativo local instantaneamente:
* Adicionar estados: `carregando` (boolean).
* Adicionar ações:
  * `addDisciplina(nome: string, descricao?: string)`
  * `deleteDisciplina(id: number)`
  * `addAp(titulo: string, tipo: string, disciplinaId: number)`
  * `deleteAp(id: number)`
  * `addChecklistItem(descricao: string, atividadeId: number, dataEntrega?: string)`
  * `deleteChecklistItem(id: number)`
  * `uploadFile(checklistItemId: number, file: File)`

---

### 2. Módulos Frontend (Vistas e Lógica)

#### [MODIFY] [DashboardPage.tsx](file:///c:/Users/suporte/Desktop/projeto_fenix-main/src/modules/MOD_ACADEMIC_CORE/DashboardPage.tsx)
* Substituir os hooks `useLiveQuery` de Dexie por chamadas de carregamento da Store Zustand.
* Buscar os dados da API ao carregar o dashboard (`useEffect` chamando `fetchDisciplinas`, `fetchAps` e `fetchProgresso`).

#### [MODIFY] [DisciplinasPage.tsx](file:///c:/Users/suporte/Desktop/projeto_fenix-main/src/modules/MOD_ACADEMIC_CORE/DisciplinasPage.tsx)
* Substituir os métodos de banco locais `db.disciplinas.*` por ações da store: `fetchDisciplinas`, `addDisciplina`, `deleteDisciplina`.
* Remover a dependência do Dexie.

#### [MODIFY] [DisciplinaCard.tsx](file:///c:/Users/suporte/Desktop/projeto_fenix-main/src/modules/MOD_ACADEMIC_CORE/DisciplinaCard.tsx)
* Receber dados estáticos passados pelas listas ao invés de rodar queries internas ao Dexie.

#### [MODIFY] [APManagerPage.tsx](file:///c:/Users/suporte/Desktop/projeto_fenix-main/src/modules/MOD_ACTIVITY_MANAGER/APManagerPage.tsx)
* Substituir as queries do Dexie por dados da store.
* Chamar ações `addAp` e `deleteAp` da Store vinculadas à API.

#### [MODIFY] [ChecklistPanel.tsx](file:///c:/Users/suporte/Desktop/projeto_fenix-main/src/modules/MOD_CHECKLIST/ChecklistPanel.tsx)
* Carregar os itens do checklist da AP a partir dos dados do Zustand.
* Chamar `addChecklistItem` e `deleteChecklistItem` da Store.

#### [MODIFY] [FileUploadButton.tsx](file:///c:/Users/suporte/Desktop/projeto_fenix-main/src/modules/MOD_FILE_VAULT/FileUploadButton.tsx)
* Alterar a função de upload para disparar um `FormData` contendo o arquivo físico direto para a rota do Express `/api/checklist/:id/upload` (em vez de salvar o blob no navegador).

---

## 🧪 Plano de Verificação

### Testes Manuais de Isolamento e Persistência
1. **Cadastro de Usuário A:** Cadastrar o usuário "Aluno A", adicionar uma disciplina e algumas APs com checklist.
2. **Validação no SQLite:** Abrir e inspecionar os logs do servidor Express no terminal e garantir que os inserts no Prisma foram disparados com sucesso no banco SQLite.
3. **Persistência ao Recarregar:** Dar "F5" no navegador e ver se todos os dados inseridos reaparecem intactos.
4. **Isolamento de Contas:** Fazer logout e criar um "Aluno B". Garantir que o Dashboard dele inicie completamente vazio e que ele não veja nenhuma informação do Aluno A.

---

## 🚀 Funcionalidade Proposta: Fenix AI Advisor

Para atender à necessidade de um insight mais inteligente e qualitativo, será criado o **"Fenix AI Advisor"**. Este componente utilizará um modelo de linguagem para fornecer recomendações personalizadas aos usuários.

### Como Funciona:
1.  **Coleta de Dados:** O sistema coletará dados anônimos sobre as atividades do usuário:
    *   Taxa de conclusão de checklists.
    *   Disciplinas com menor e maior progresso.
    *   Atividades pendentes e seus tipos.

2.  **Processamento com IA:** Periodicamente, esses dados serão enviados a um modelo de IA (ex: API Gemini) com um prompt estruturado para atuar como um "tutor acadêmico".

    **Exemplo de Prompt:**
    ```
    "Aja como um tutor acadêmico. Com base nos seguintes dados de um estudante, forneça um insight e uma sugestão prática em português brasileiro.
    - Disciplinas e progresso: { "Cálculo": "25%", "Engenharia de Software": "80%" }
    - Atividades pendentes: { "Cálculo": ["Resolver lista de exercícios 2", "Estudar para prova 1"], "Engenharia de Software": ["Entregar protótipo final"] }

    Seja conciso (2-3 frases), motivador e forneça uma ação clara para o estudante."
    ```

3.  **Exibição do Insight:** O insight gerado pela IA será exibido em um novo widget no dashboard.

    **Exemplo de Insight Gerado:**
    > "Percebi que 'Cálculo' está com progresso mais lento. Que tal focar em 'Resolver lista de exercícios 2' hoje? Concluir essa tarefa pode te dar o impulso necessário para avançar na matéria!"

Este recurso irá além dos gráficos de progresso, oferecendo uma orientação acionável e inteligente para o usuário.

---

## 🛠️ Plano Técnico de Execução (AI Advisor & Correção da Migração)

### 1. Ajustes na Migração (Frontend)
- **Problema:** Componentes como `InsightsWidget.tsx` ainda usam Dexie (`db.disciplinas`, `useLiveQuery`).
- **Solução:** Remover Dexie e consumir `disciplinas` e `aps` da `useFenixStore` (que já busca do SQLite via Express).

### 2. Fenix AI Advisor (Backend & Banco de Dados)
- **Banco de Dados:** Adicionar o campo `apiKeyGemini String?` na tabela `Usuario` do `schema.prisma`. *Nota: para essa apresentação acadêmica, a chave ficará salva diretamente no banco local SQLite para facilitar a exibição e uso.*
- **Rotas (Express):**
  - `POST /api/insights/config-ai`: Salva a chave da API no banco para o usuário logado.
  - `GET /api/insights/ai-advisor`: Recupera a chave, busca o progresso do usuário, envia o prompt para o Gemini e retorna a resposta.
- **Dependências:** Utilizar o `@google/genai` ou `axios` no backend para comunicação com a IA.

### 3. Fenix AI Advisor (Frontend)
- **InsightsWidget.tsx:** 
  - Criar campo para inserir/salvar a Chave da API (caso não esteja salva).
  - Adicionar botão "Gerar Insight com IA".
  - Exibir a resposta gerada no dashboard.
- **useFenixStore.ts:**
  - Adicionar as funções `saveGeminiKey` e `fetchAiInsight`, além de variáveis para controlar estado de carregamento e guardar a resposta da IA.
