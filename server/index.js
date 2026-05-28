import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Dica 9: Logs de Operação
});

app.use(cors());
app.use(express.json());

// Dica 1: Banco Autocriável e Portátil
// O Prisma push já resolve isso, mas vamos garantir que ele rode no boot se o banco não existir
const dbPath = path.resolve(__dirname, '../prisma/database.db');
if (!fs.existsSync(dbPath)) {
  console.log('Banco de dados não encontrado. Executando push do schema...');
  try {
    execSync('npx prisma db push', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
    console.log('Banco de dados criado com sucesso.');
  } catch (error) {
    console.error('Erro ao criar o banco de dados:', error);
  }
}

// Configuração de Uploads (Dica 2)
const uploadDir = path.resolve(__dirname, '../storage/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Rota estática para servir os arquivos
app.use('/storage/uploads', express.static(uploadDir));

// Rotas Básicas para testes de conexão
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor Fênix rodando' });
});

// Importação das rotas dos módulos (serão criadas a seguir)
import authRoutes from './routes/auth.js';
import academicRoutes from './routes/academic.js';
import activityRoutes from './routes/activity.js';
import checklistRoutes from './routes/checklist.js';
import insightsRoutes from './routes/insights.js';

app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/insights', insightsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export { prisma };
