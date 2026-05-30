# 🦅 Projeto Fênix

O **Projeto Fênix** é uma plataforma acadêmica projetada para ajudar estudantes a gerenciarem suas disciplinas, avaliações, checklists de tarefas e armazenarem arquivos com segurança e eficiência. 

A aplicação utiliza uma arquitetura moderna e robusta, com frontend em **React/Vite** e um backend integrado rodando **Express, Prisma e SQLite** localmente.

---

## 🚀 Principais Funcionalidades

- **Gestão Acadêmica Completa:** Crie disciplinas, acompanhe atividades pendentes (APs) e gerencie o progresso geral.
- **Checklists e Arquivos:** Cada atividade permite a criação de checklists e uploads de arquivos, tudo salvo diretamente no seu banco local SQLite.
- **Isolamento de Contas:** Sistema de autenticação local. Múltiplos alunos podem usar o sistema na mesma máquina sem que seus dados se cruzem.
- **Fenix AI Advisor:** Um módulo inteligente (integrado à API do Google Gemini) que analisa o seu progresso, checklists e atividades, oferecendo recomendações práticas e motivacionais personalizadas para os seus estudos.
- **Privacidade e Segurança:** Diferente de aplicações na nuvem tradicionais, seus arquivos e informações acadêmicas são gravados nativamente de forma persistida no backend local (`prisma/database.db`).

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React (com Vite):** Interface rápida e reativa.
- **TypeScript:** Segurança de tipagem em todo o código.
- **Zustand:** Gerenciamento de estado global da aplicação.

### Backend
- **Node.js + Express:** API local para intermediação segura.
- **Prisma ORM:** Modelagem estruturada e acesso otimizado aos dados.
- **SQLite:** Banco de dados relacional armazenado localmente em arquivo físico (migrado do IndexedDB para garantir maior persistência).

### Inteligência Artificial
- **Google Gemini API:** Utilizado no componente *AI Advisor* para interpretar os dados acadêmicos e retornar sugestões com base no progresso.

---

## ⚙️ Arquitetura e Fluxo de Dados

1. **Frontend (Vistas e Lógica):** Módulos segmentados (`MOD_ACADEMIC_CORE`, `MOD_ACTIVITY_MANAGER`, `MOD_INSIGHTS_ENGINE`, etc.) enviam requisições assíncronas para a API local.
2. **Store (Zustand):** O `useFenixStore` e `useAppStore` consolidam todos os dados em memória e controlam o estado reativo.
3. **Backend Local (Express):** Recebe a requisição garantindo autenticação e o isolamento de informações do usuário.
4. **Camada de Persistência:** O Prisma processa a query e grava definitivamente no arquivo SQLite.

---

## 💻 Como Rodar o Projeto

### Pré-requisitos
- Node.js (versão 18+ recomendada)
- NPM, Yarn ou pnpm instalado

### Comandos Úteis

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o projeto (executará o servidor backend e o frontend simultaneamente dependendo do script):**
   ```bash
   npm run dev
   ```

3. **Gerar builds ou verificar estilos:**
   - `npm run build`: compila o projeto.
   - `npm run lint`: executa a verificação de código.
   - `npm run preview`: visualiza a build de produção local.

---

## 🤖 Configurando o Fenix AI Advisor

Para que o Módulo de Insights Avançados funcione corretamente, é necessário configurar a IA:
1. Abra o painel (Dashboard).
2. Localize o **Insights Widget**.
3. Insira a sua API Key do Google Gemini (se solicitada pela interface). O sistema a utilizará localmente para as análises.
4. Clique em "Gerar Insight com IA" e receba dicas personalizadas!

---

*Para mais detalhes sobre as regras de negócio ou instruções detalhadas de backup, verifique os arquivos `contexto.md` e `INSTRUCOES.md`.*
