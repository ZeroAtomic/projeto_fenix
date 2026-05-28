# Projeto Fênix

Aplicação acadêmica local-first para organização de disciplinas, atividades parciais, checklist e progresso.

## Visão geral

- Frontend: React + TypeScript + Vite.
- Backend local: Express + Prisma + SQLite.
- Armazenamento de usuário/dados offline: IndexedDB via Dexie.
- Estado global leve: Zustand.
- Recursos: autenticação, onboarding, gestão de disciplinas, APs, checklist, upload de arquivos, backup/import e gráfico de progresso.

## Funcionalidades principais

- Cadastro de usuário e login com JWT.
- Onboarding inicial com curso, semestre atual e total de semestres.
- Dashboard com métricas de progresso e visões de tarefas pendentes.
- Lista de disciplinas com busca, edição e exclusão.
- Gestão de até 2 APs por disciplina (ex: Avaliação Parcial + Prova Final).
- Checklist por AP com conclusão de itens, data de entrega e upload de arquivos.
- Backup local JSON e importação de dados.
- Insights de progresso calculados automaticamente por disciplina.

## Estrutura do código

- `src/App.tsx`: roteamento principal e proteção de rotas.
- `src/store/useAppStore.ts`: estado de sessão e autenticação.
- `src/modules/MOD_AUTH`: login e cadastro.
- `src/modules/MOD_USER_PROFILE`: onboarding de curso e semestre.
- `src/modules/MOD_ACADEMIC_CORE`: dashboard, disciplinas e cards.
- `src/modules/MOD_ACTIVITY_MANAGER`: gerenciamento de APs por disciplina.
- `src/modules/MOD_CHECKLIST`: gerenciamento de itens de checklist.
- `src/modules/MOD_FILE_VAULT`: upload/download de arquivos e backup.
- `src/modules/MOD_INSIGHTS_ENGINE`: widget de progresso e gráfico.
- `src/modules/MOD_DB/db.ts`: definição de esquema Dexie para IndexedDB.
- `server/`: backend Express com rotas de autenticação, academic, activity, checklist e insights.

## Como rodar o projeto

1. Instalar dependências:
   ```powershell
   npm install
   ```
2. Iniciar o servidor e o frontend juntos:
   ```powershell
   npm run dev
   ```
3. Abrir o link gerado pelo Vite, geralmente `http://localhost:5173`.

### Comandos úteis

- `npm run dev`: inicia o servidor local e o app Vite.
- `npm run build`: compila o frontend e o TypeScript.
- `npm run lint`: executa o ESLint.
- `npm run preview`: pré-visualiza a build.

## Documentação adicional

- `INSTRUCOES.md`: guia de uso, backup e fluxo de execução.
- `contexto.md`: regras de negócio, arquitetura dos módulos e objetivos do projeto.

## Observações importantes

- O `README.md` original era um template genérico de React/Vite. Este README agora descreve o Projeto Fênix de forma específica.
- O módulo de insights (`MOD_INSIGHTS_ENGINE`) existe e mostra métricas de progresso. Atualmente ele não contém integração com IA; ele calcula porcentagens com base nos itens de checklist.

## Melhorias sugeridas

- Adicionar um README de desenvolvimento para detalhar as APIs do backend.
- Documentar a arquitetura de dados entre backend Prisma e IndexedDB local.
- Se desejar implementar IA, criar um módulo de recomendações ou sugestões de estudo baseado no progresso.
