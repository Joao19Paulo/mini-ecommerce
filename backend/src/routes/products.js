const router = require('express').Router();
const { produtos, categorias, find, findOne, countDocs, insertDoc, updateDoc, removeDoc } = require('../database/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const safe = ({ _id, ...r }) => ({ ...r, id: _id });

// GET /api/produtos/categorias/lista
router.get('/categorias/lista', async (req, res) => {
  try {
    const cats = await find(categorias, {}, { nome: 1 });
    res.json(cats.map(c => ({ id: c._id, nome: c.nome })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/produtos
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', categoria_id, ativo } = req.query;
    const p = parseInt(page), l = parseInt(limit);

    let query = {};
    if (search) {
      const re = new RegExp(search, 'i');
      query.$or = [{ nome: re }, { descricao: re }];
    }
    if (categoria_id) query.categoria_id = categoria_id;
    if (ativo !== undefined) query.ativo = ativo === 'true';

    const total = await countDocs(produtos, query);
    const data = await find(produtos, query, { criado_em: -1 }, (p - 1) * l, l);

    res.json({
      data: data.map(safe),
      pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/produtos/:id
router.get('/:id', async (req, res) => {
  try {
    const doc = await findOne(produtos, { _id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(safe(doc));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/produtos (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { nome, descricao, preco, estoque, categoria_id, categoria_nome, imagem_url, imagem_base64, tamanhos, cores, ativo } = req.body;
    if (!nome || preco === undefined) return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    const now = new Date().toISOString();
    let catNome = categoria_nome;
    if (categoria_id && !catNome) {
      const cat = await findOne(categorias, { _id: categoria_id });
      catNome = cat?.nome || '';
    }
    const doc = await insertDoc(produtos, {
      nome, descricao: descricao || '', preco: parseFloat(preco),
      estoque: parseInt(estoque) || 0, categoria_id: categoria_id || null,
      categoria_nome: catNome || '',
      imagem_url: imagem_url || '', imagem_base64: imagem_base64 || '',
      tamanhos: tamanhos || [], cores: cores || [],
      ativo: ativo !== false, criado_em: now, atualizado_em: now
    });
    res.status(201).json(safe(doc));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/produtos/:id (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const existing = await findOne(produtos, { _id: req.params.id });
    if (!existing) return res.status(404).json({ error: 'Produto não encontrado' });
    const { nome, descricao, preco, estoque, categoria_id, categoria_nome, imagem_url, imagem_base64, tamanhos, cores, ativo } = req.body;
    let catNome = categoria_nome;
    if (categoria_id && !catNome) {
      const cat = await findOne(categorias, { _id: categoria_id });
      catNome = cat?.nome || '';
    }
    await updateDoc(produtos, { _id: req.params.id }, {
      $set: { nome, descricao, preco: parseFloat(preco), estoque: parseInt(estoque),
        categoria_id: categoria_id || null, categoria_nome: catNome || '',
        imagem_url: imagem_url || '', imagem_base64: imagem_base64 || '', tamanhos: tamanhos || [], cores: cores || [],
        ativo: Boolean(ativo), atualizado_em: new Date().toISOString() }
    });
    const updated = await findOne(produtos, { _id: req.params.id });
    res.json(safe(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/produtos/:id/toggle
router.patch('/:id/toggle', authenticate, requireAdmin, async (req, res) => {
  try {
    const doc = await findOne(produtos, { _id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Produto não encontrado' });
    await updateDoc(produtos, { _id: req.params.id }, { $set: { ativo: !doc.ativo, atualizado_em: new Date().toISOString() } });
    res.json({ ativo: !doc.ativo });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/produtos/:id (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const n = await removeDoc(produtos, { _id: req.params.id });
    if (n === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ message: 'Produto removido com sucesso' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
