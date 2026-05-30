import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';
import { GoogleGenAI } from '@google/genai';
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

// Fenix AI Advisor: Salvar Chave
router.post('/config-ai', async (req, res) => {
  try {
    const { apiKey } = req.body;
    await prisma.usuario.update({
      where: { id: req.userId },
      data: { apiKeyGemini: apiKey }
    });
    res.json({ message: 'Chave salva com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar chave da API' });
  }
});

// Fenix AI Advisor: Verificar se tem Chave
router.get('/config-ai', async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.userId },
      select: { apiKeyGemini: true }
    });
    res.json({ hasKey: !!usuario?.apiKeyGemini });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar chave da API' });
  }
});

// Fenix AI Advisor: Gerar Insight
router.get('/ai-advisor', async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.userId },
      include: {
        disciplinas: {
          include: {
            aps: {
              include: { checklists: true }
            }
          }
        }
      }
    });

    if (!usuario || !usuario.apiKeyGemini) {
      return res.status(400).json({ error: 'Chave da API não configurada' });
    }

    // Preparar os dados para a IA
    const progressoData = {};
    const pendenciasData = {};

    usuario.disciplinas.forEach(disc => {
      let totalItems = 0;
      let itemsConcluidos = 0;
      let pendentes = [];

      disc.aps.forEach(ap => {
        ap.checklists.forEach(c => {
          totalItems++;
          if (c.concluido) {
            itemsConcluidos++;
          } else {
            pendentes.push(c.descricao);
          }
        });
      });

      const progresso = totalItems === 0 ? 0 : Math.round((itemsConcluidos / totalItems) * 100);
      progressoData[disc.nome] = `${progresso}%`;
      
      if (pendentes.length > 0) {
        pendenciasData[disc.nome] = pendentes;
      }
    });

    const ai = new GoogleGenAI({ apiKey: usuario.apiKeyGemini });
    const prompt = `Aja como um tutor acadêmico. Com base nos seguintes dados de um estudante, forneça um insight e uma sugestão prática em português brasileiro.
- Disciplinas e progresso: ${JSON.stringify(progressoData)}
- Atividades pendentes: ${JSON.stringify(pendenciasData)}

Seja conciso (2-3 frases), motivador e forneça uma ação clara para o estudante.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ insight: response.text });
  } catch (error) {
    console.error('Erro na IA:', error);
    res.status(500).json({ error: 'Erro ao gerar insight com a IA' });
  }
});

export default router;
