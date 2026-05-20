const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { users, find, findOne, countDocs, insertDoc, updateDoc, removeDoc } = require('../database/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const safe = ({ _id, senha, ...r }) => ({ ...r, id: _id });

// GET /api/usuarios (admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', perfil, ativo } = req.query;
    const p = parseInt(page), l = parseInt(limit);
    let query = {};
    if (search) { const re = new RegExp(search, 'i'); query.$or = [{ nome: re }, { email: re }]; }
    if (perfil) query.perfil = perfil;
    if (ativo !== undefined) query.ativo = ativo === 'true';
    const total = await countDocs(users, query);
    const data = await find(users, query, { criado_em: -1 }, (p - 1) * l, l);
    res.json({ data: data.map(safe), pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/usuarios/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.perfil !== 'admin' && req.user.id !== req.params.id)
      return res.status(403).json({ error: 'Acesso negado' });
    const doc = await findOne(users, { _id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(safe(doc));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/usuarios (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { nome, email, senha, perfil = 'user', ativo = true } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    const now = new Date().toISOString();
    const doc = await insertDoc(users, {
      nome, email, senha: bcrypt.hashSync(senha, 10),
      perfil, ativo: Boolean(ativo), criado_em: now, atualizado_em: now
    });
    res.status(201).json(safe(doc));
  } catch (e) {
    if (e.errorType === 'uniqueViolated') return res.status(409).json({ error: 'Email já cadastrado' });
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/usuarios/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.perfil !== 'admin' && req.user.id !== req.params.id)
      return res.status(403).json({ error: 'Acesso negado' });
    const existing = await findOne(users, { _id: req.params.id });
    if (!existing) return res.status(404).json({ error: 'Usuário não encontrado' });
    const { nome, email, senha, perfil, ativo } = req.body;
    const emailConflict = await findOne(users, { email, _id: { $ne: req.params.id } });
    if (emailConflict) return res.status(409).json({ error: 'Email já em uso' });
    const upd = { nome, email, atualizado_em: new Date().toISOString() };
    if (req.user.perfil === 'admin') { upd.perfil = perfil || 'user'; upd.ativo = Boolean(ativo); }
    if (senha) upd.senha = bcrypt.hashSync(senha, 10);
    await updateDoc(users, { _id: req.params.id }, { $set: upd });
    const updated = await findOne(users, { _id: req.params.id });
    res.json(safe(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/usuarios/:id/toggle
router.patch('/:id/toggle', authenticate, requireAdmin, async (req, res) => {
  try {
    const doc = await findOne(users, { _id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Usuário não encontrado' });
    await updateDoc(users, { _id: req.params.id }, { $set: { ativo: !doc.ativo, atualizado_em: new Date().toISOString() } });
    res.json({ ativo: !doc.ativo });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/usuarios/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (req.user.id === req.params.id) return res.status(400).json({ error: 'Não é possível excluir o próprio usuário' });
    const n = await removeDoc(users, { _id: req.params.id });
    if (n === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ message: 'Usuário removido com sucesso' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
