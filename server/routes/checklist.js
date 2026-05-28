import { Router } from 'express';
import { prisma } from '../index.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
router.use(authenticateToken);

// Dica 2: Upload de Arquivos Físicos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../storage/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post('/', async (req, res) => {
  const { descricao, atividadeId } = req.body;
  try {
    const ap = await prisma.atividadeAP.findFirst({
      where: { id: Number(atividadeId), disciplina: { usuarioId: req.userId } }
    });
    if (!ap) return res.status(403).json({ error: 'Acesso negado' });

    const novoChecklist = await prisma.checklistItem.create({
      data: { descricao, atividadeId: Number(atividadeId) }
    });
    res.json(novoChecklist);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar checklist' });
  }
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { concluido } = req.body;
  try {
    const cl = await prisma.checklistItem.findFirst({
      where: { id, atividade: { disciplina: { usuarioId: req.userId } } }
    });
    if (!cl) return res.status(403).json({ error: 'Acesso negado' });

    const atualizado = await prisma.checklistItem.update({
      where: { id },
      data: { concluido }
    });
    res.json(atualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar checklist' });
  }
});

router.post('/:id/upload', upload.single('arquivo'), async (req, res) => {
  const id = Number(req.params.id);
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  
  try {
    const cl = await prisma.checklistItem.findFirst({
      where: { id, atividade: { disciplina: { usuarioId: req.userId } } }
    });
    if (!cl) return res.status(403).json({ error: 'Acesso negado' });

    const arquivoUrl = `/storage/uploads/${req.file.filename}`;
    
    const atualizado = await prisma.checklistItem.update({
      where: { id },
      data: { arquivoUrl }
    });
    res.json(atualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao vincular arquivo ao checklist' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const cl = await prisma.checklistItem.findFirst({
      where: { id, atividade: { disciplina: { usuarioId: req.userId } } }
    });
    if (!cl) return res.status(403).json({ error: 'Acesso negado' });

    await prisma.checklistItem.delete({ where: { id } });
    res.json({ message: 'Checklist deletado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar checklist' });
  }
});

export default router;
