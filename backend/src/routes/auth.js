const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users, findOne, insertDoc } = require('../database/db');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    const user = await findOne(users, { email, ativo: true });
    if (!user || !bcrypt.compareSync(senha, user.senha))
      return res.status(401).json({ error: 'Credenciais inválidas' });
    const token = jwt.sign(
      { id: user._id, nome: user.nome, email: user.email, perfil: user.perfil },
      JWT_SECRET, { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user._id, nome: user.nome, email: user.email, perfil: user.perfil } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    const now = new Date().toISOString();
    const doc = await insertDoc(users, {
      nome, email, senha: bcrypt.hashSync(senha, 10),
      perfil: 'user', ativo: true, criado_em: now, atualizado_em: now
    });
    res.status(201).json({ id: doc._id, nome, email, perfil: 'user' });
  } catch (e) {
    if (e.errorType === 'uniqueViolated') return res.status(409).json({ error: 'Email já cadastrado' });
    res.status(500).json({ error: e.message });
  }
});

router.get('/me', authenticate, (req, res) => res.json(req.user));

module.exports = router;
