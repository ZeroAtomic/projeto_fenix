import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { tryPersist } from './modules/MOD_DB/db';

// Solicita persistência de dados no IndexedDB logo na inicialização
tryPersist();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
