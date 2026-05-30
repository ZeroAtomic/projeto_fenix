# 🚀 Guia do Projeto Fênix (GitHub & Uso)

Este projeto foi desenvolvido com uma arquitetura **Local-First**. Isso significa que ele é rápido, funciona offline e prioriza sua privacidade. Aqui está tudo o que você precisa saber para levar seu projeto para o GitHub e usá-lo em qualquer lugar.

## 📦 Como rodar o projeto em um novo computador

Se você baixar o código do GitHub em outra máquina, precisará de:
1.  **Node.js instalado** (Versão 18 ou superior).
2.  **Passos para iniciar:**
    - Abra o terminal na pasta do projeto.
    - Rode `npm install` (para baixar as bibliotecas).
    - Rode `npm run dev` (para iniciar o projeto).
    - Abra o link que aparecer no terminal (geralmente `http://localhost:5173`).

---

## ☁️ Hospedagem Gratuita (Recomendado)

Em vez de baixar o código toda vez, você pode hospedar o projeto no **Vercel** ou **Netlify** direto do seu GitHub:
1.  Conecte seu repositório do GitHub em um desses sites.
2.  Eles vão te dar um link (ex: `meu-fenix.vercel.app`).
3.  Você pode acessar esse link de **qualquer lugar** (PC, Celular, Tablet).
4.  **Instalação:** No navegador, clique em "Instalar" para ter o ícone no seu dispositivo.

---

## 💾 Como sincronizar seus dados entre computadores

Como o projeto é **Local-First**, seus dados ficam salvos no navegador do computador atual. Se você mudar de computador:
1.  No computador antigo, vá ao Dashboard e clique em **"Exportar"**. Isso baixará um arquivo `.json`.
2.  No computador novo, abra o projeto, vá ao Dashboard e clique em **"Importar"**. Selecione o arquivo `.json`.
3.  **Pronto!** Seus dados estarão sincronizados.

---

## 🛠️ Tecnologias Utilizadas
- **React + Vite:** Frontend rápido e moderno.
- **Dexie.js:** Banco de dados local (IndexedDB).
- **TailwindCSS:** Estilização premium.
- **Lucide React:** Ícones modernos.
- **Electron:** (Opcional) Para gerar o executável `.exe`.

---

## 📝 Comandos Úteis
- `npm run dev`: Inicia o modo de desenvolvimento.
- `npm run build`: Prepara o projeto para publicação.
- `npm run electron:build`: Gera a versão `.exe` portátil na pasta `release`.

---
**Projeto Fênix — Organização Acadêmica Sem Limites.**
