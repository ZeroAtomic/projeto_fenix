import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// MOD_ACADEMIC_CORE: CRUD Disciplinas
router.get('/', async (req, res) => {
  try {
    const disciplinas = await prisma.disciplina.findMany({
      where: { usuarioId: req.userId },
      include: { aps: true }
    });
    res.json(disciplinas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar disciplinas' });
  }
});

router.post('/', async (req, res) => {
  const { nome, descricao } = req.body;
  try {
    const novaDisciplina = await prisma.disciplina.create({
      data: { 
        nome, 
        descricao,
        usuarioId: req.userId
      }
    });
    res.json(novaDisciplina);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar disciplina' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    // Verifica se a disciplina pertence ao usuário logado antes de deletar
    const disciplina = await prisma.disciplina.findFirst({
      where: { id, usuarioId: req.userId }
    });
    if (!disciplina) return res.status(403).json({ error: 'Acesso negado' });

    await prisma.disciplina.delete({ where: { id } });
    res.json({ message: 'Disciplina deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar disciplina' });
  }
});

export default router;
