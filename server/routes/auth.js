import { Router } from 'express';
import { prisma } from '../index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const SECRET_KEY = process.env.JWT_SECRET || 'fenix_super_secret_key';

// MOD_AUTH: Autenticação via JWT local
router.post('/login', async (req, res) => {
  const { ra, senha } = req.body;
  try {
    const user = await prisma.usuario.findUnique({
      where: { ra }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'RA ou senha inválidos' });
    }

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(401).json({ error: 'RA ou senha inválidos' });
    }

    // Gera o Token JWT com duração de 7 dias
    const token = jwt.sign({ id: user.id, ra: user.ra }, SECRET_KEY, { expiresIn: '7d' });

    res.json({ message: 'Login bem-sucedido', token, user });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor', details: error.message });
  }
});

router.post('/register', async (req, res) => {
  const { nome, ra, email, senha } = req.body;
  try {
    const existingUser = await prisma.usuario.findFirst({
      where: {
        OR: [{ ra }, { email }]
      }
    });
    if (existingUser) {
      if (existingUser.ra === ra) {
        return res.status(400).json({ error: 'RA já cadastrado' });
      }
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    const newUser = await prisma.usuario.create({
      data: { nome, ra, email, senha: hashedPassword }
    });

    const token = jwt.sign({ id: newUser.id, ra: newUser.ra }, SECRET_KEY, { expiresIn: '7d' });

    res.json({ message: 'Usuário registrado com sucesso', token, user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar usuário', details: error.message });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: req.userId },
      select: { id: true, nome: true, email: true, ra: true }
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor', details: error.message });
  }
});

export default router;
