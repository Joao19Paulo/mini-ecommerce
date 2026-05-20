const Datastore = require('@seald-io/nedb');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const users = new Datastore({ filename: path.join(dataDir, 'users.db'), autoload: true });
const produtos = new Datastore({ filename: path.join(dataDir, 'produtos.db'), autoload: true });
const categorias = new Datastore({ filename: path.join(dataDir, 'categorias.db'), autoload: true });

users.ensureIndex({ fieldName: 'email', unique: true });

const find = (db, query = {}, sort = {}, skip = 0, limit = 0) =>
  new Promise((res, rej) => {
    let cursor = db.find(query).sort(sort).skip(skip);
    if (limit > 0) cursor = cursor.limit(limit);
    cursor.exec((err, docs) => err ? rej(err) : res(docs));
  });

const findOne = (db, query) =>
  new Promise((res, rej) => db.findOne(query, (err, doc) => err ? rej(err) : res(doc)));

const countDocs = (db, query = {}) =>
  new Promise((res, rej) => db.count(query, (err, n) => err ? rej(err) : res(n)));

const insertDoc = (db, doc) =>
  new Promise((res, rej) => db.insert(doc, (err, d) => err ? rej(err) : res(d)));

const updateDoc = (db, query, upd, opts = {}) =>
  new Promise((res, rej) => db.update(query, upd, opts, (err, n) => err ? rej(err) : res(n)));

const removeDoc = (db, query, opts = {}) =>
  new Promise((res, rej) => db.remove(query, opts, (err, n) => err ? rej(err) : res(n)));

const seed = async () => {
  const now = new Date().toISOString();
  const catsList = ['Camisetas Básicas', 'Camisetas Estampadas', 'Polos', 'Regatas', 'Oversized'];

  for (const nome of catsList) {
    const exists = await findOne(categorias, { nome });
    if (!exists) await insertDoc(categorias, { nome, criado_em: now });
  }

  const adminExists = await findOne(users, { email: 'admin@camisas.com' });
  if (!adminExists) {
    await insertDoc(users, {
      nome: 'Administrador', email: 'admin@camisas.com',
      senha: bcrypt.hashSync('admin123', 10),
      perfil: 'admin', ativo: true,
      criado_em: now, atualizado_em: now
    });
  }

  const prodCount = await countDocs(produtos);
  if (prodCount === 0) {
    const getCat = async (nome) => { const c = await findOne(categorias, { nome }); return c?._id || null; };
    const items = [
      { nome: 'Camiseta Branca Premium', descricao: 'Algodão 100% pima, caimento perfeito para o dia a dia.', preco: 79.90, estoque: 50, categoria_nome: 'Camisetas Básicas', imagem_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', tamanhos: ['P','M','G','GG'], cores: ['Branco','Preto','Cinza'] },
      { nome: 'Camiseta Preta Clássica', descricao: 'Tecido premium com toque suave e durabilidade garantida.', preco: 69.90, estoque: 40, categoria_nome: 'Camisetas Básicas', imagem_url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600', tamanhos: ['P','M','G','GG','XGG'], cores: ['Preto','Branco'] },
      { nome: 'Camiseta Streetwear Gráfica', descricao: 'Design exclusivo com estampa artesanal em silk-screen.', preco: 119.90, estoque: 25, categoria_nome: 'Camisetas Estampadas', imagem_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600', tamanhos: ['P','M','G'], cores: ['Azul','Verde','Vermelho'] },
      { nome: 'Camiseta Floral Verão', descricao: 'Estampa vibrante perfeita para os dias quentes.', preco: 99.90, estoque: 30, categoria_nome: 'Camisetas Estampadas', imagem_url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600', tamanhos: ['P','M','G','GG'], cores: ['Multicolor'] },
      { nome: 'Polo Piquet Slim', descricao: 'Tecido piquet premium com botões madrepérola.', preco: 149.90, estoque: 20, categoria_nome: 'Polos', imagem_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600', tamanhos: ['P','M','G','GG'], cores: ['Azul Marinho','Branco','Verde'] },
      { nome: 'Polo Casual Weekend', descricao: 'Conforto e estilo para o final de semana.', preco: 139.90, estoque: 15, categoria_nome: 'Polos', imagem_url: 'https://images.unsplash.com/photo-1591196735322-17af89ad1a8b?w=600', tamanhos: ['M','G','GG'], cores: ['Cinza','Azul','Vermelho'] },
      { nome: 'Regata Dry Fit', descricao: 'Tecnologia dry fit para máxima performance nos treinos.', preco: 59.90, estoque: 60, categoria_nome: 'Regatas', imagem_url: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600', tamanhos: ['P','M','G','GG'], cores: ['Preto','Branco','Azul','Vermelho'] },
      { nome: 'Camiseta Oversized Drop', descricao: 'Caimento oversized moderno, perfeito para o streetwear.', preco: 129.90, estoque: 35, categoria_nome: 'Oversized', imagem_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600', tamanhos: ['M','G','GG','XGG'], cores: ['Bege','Preto','Cinza Chumbo'] },
    ];
    for (const item of items) {
      const { categoria_nome, ...data } = item;
      const catId = await getCat(categoria_nome);
      await insertDoc(produtos, { ...data, categoria_id: catId, categoria_nome, ativo: true, criado_em: now, atualizado_em: now });
    }
  }
  console.log('✅ Banco de dados inicializado');
};

seed().catch(console.error);

module.exports = { users, produtos, categorias, find, findOne, countDocs, insertDoc, updateDoc, removeDoc };
