import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// MOD_INSIGHTS: Cálculos automáticos para o Dashboard
router.get('/progresso', async (req, res) => {
  try {
    // Busca dados para calcular progresso apenas do usuário logado
    const totalChecklists = await prisma.checklistItem.count({
      where: { atividade: { disciplina: { usuarioId: req.userId } } }
    });
    
    const concluidos = await prisma.checklistItem.count({
      where: { 
        concluido: true,
        atividade: { disciplina: { usuarioId: req.userId } }
      }
    });

    const progressoGeral = totalChecklists === 0 ? 0 : Math.round((concluidos / totalChecklists) * 100);

    res.json({
      totalChecklists,
      concluidos,
      progressoGeral
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar insights' });
  }
});

// Estatísticas detalhadas por disciplina
router.get('/progresso-por-disciplina', async (req, res) => {
  try {
    const disciplinas = await prisma.disciplina.findMany({
      where: { usuarioId: req.userId },
      include: {
        aps: {
          include: {
            checklists: true
          }
        }
      }
    });

    const progressoDisciplinas = disciplinas.map(disc => {
      let totalItems = 0;
      let itemsConcluidos = 0;

      disc.aps.forEach(ap => {
        totalItems += ap.checklists.length;
        itemsConcluidos += ap.checklists.filter(c => c.concluido).length;
      });

      const progresso = totalItems === 0 ? 0 : Math.round((itemsConcluidos / totalItems) * 100);

      return {
        id: disc.id,
        nome: disc.nome,
        progresso
      };
    });

    res.json(progressoDisciplinas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar progresso por disciplina' });
  }
});

export default router;
