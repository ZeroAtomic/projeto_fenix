import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// MOD_ACTIVITY_MANAGER: CRUD APs
router.get('/', async (req, res) => {
  try {
    const aps = await prisma.atividadeAP.findMany({
      where: {
        disciplina: { usuarioId: req.userId }
      },
      include: { checklists: true, disciplina: true }
    });
    res.json(aps);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar APs' });
  }
});

router.post('/', async (req, res) => {
  const { titulo, descricao, disciplinaId } = req.body;
  
  try {
    // Verifica se a disciplina pertence ao usuário
    const disciplina = await prisma.disciplina.findFirst({
      where: { id: Number(disciplinaId), usuarioId: req.userId }
    });
    if (!disciplina) return res.status(403).json({ error: 'Disciplina não encontrada ou sem permissão.' });

    // Dica 3: Trava de Segurança SQL para APs (Máx 2 por disciplina)
    const countAps = await prisma.atividadeAP.count({
      where: { disciplinaId: Number(disciplinaId) }
    });

    if (countAps >= 2) {
      return res.status(400).json({ error: 'Limite máximo de 2 APs por disciplina atingido.' });
    }

    const novaAP = await prisma.atividadeAP.create({
      data: { titulo, descricao, disciplinaId: Number(disciplinaId) }
    });
    res.json(novaAP);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar AP', details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    // Verifica permissão
    const ap = await prisma.atividadeAP.findFirst({
      where: { id, disciplina: { usuarioId: req.userId } }
    });
    if (!ap) return res.status(403).json({ error: 'AP não encontrada ou acesso negado' });

    await prisma.atividadeAP.delete({ where: { id } });
    res.json({ message: 'AP deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar AP' });
  }
});

export default router;
