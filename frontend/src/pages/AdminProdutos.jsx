import { useState, useEffect, useCallback } from 'react';
import { produtosAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Chips Input ─────────────────────────────────────────────────────────────
function ChipsInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('');
  const add = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) onChange([...value, input.trim()]);
      setInput('');
    }
  };
  const remove = (item) => onChange(value.filter(v => v !== item));
  return (
    <div className="chips-input">
      {value.map(v => (
        <span key={v} className="chip">
          {v} <span className="chip-remove" onClick={() => remove(v)}>×</span>
        </span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={add}
        placeholder={value.length === 0 ? placeholder : 'Adicionar...'} />
    </div>
  );
}

// ─── Product Form Modal ───────────────────────────────────────────────────────
function ProductModal({ product, categorias, onClose, onSaved }) {
  const { toast } = useToast();
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    nome: product?.nome || '', descricao: product?.descricao || '',
    preco: product?.preco || '', estoque: product?.estoque ?? '',
    categoria_id: product?.categoria_id || '', imagem_url: product?.imagem_url || '',
    imagem_base64: product?.imagem_base64 || '',
    tamanhos: product?.tamanhos || [], cores: product?.cores || [],
    ativo: product?.ativo !== false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      set('imagem_base64', reader.result);
      set('imagem_url', '');
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório';
    if (!form.preco || isNaN(form.preco) || Number(form.preco) < 0) e.preco = 'Preço inválido';
    if (form.estoque === '' || isNaN(form.estoque) || Number(form.estoque) < 0) e.estoque = 'Estoque inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        preco: parseFloat(form.preco),
        estoque: parseInt(form.estoque),
        imagem_url: form.imagem_base64 ? '' : form.imagem_url || '',
        imagem_base64: form.imagem_base64 || '',
      };
      // find categoria_nome
      const cat = categorias.find(c => c.id === form.categoria_id);
      if (cat) payload.categoria_nome = cat.nome;
      if (isEdit) await produtosAPI.update(product.id, payload);
      else await produtosAPI.create(payload);
      toast(isEdit ? 'Produto atualizado!' : 'Produto criado!', 'success');
      onSaved();
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao salvar produto', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input className="form-input" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Camiseta Premium" />
              {errors.nome && <span className="form-error">{errors.nome}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea className="form-input" rows={3} value={form.descricao}
                onChange={e => set('descricao', e.target.value)} placeholder="Descrição do produto..." style={{ resize: 'vertical' }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Preço (R$) *</label>
                <input className="form-input" type="number" step="0.01" min="0" value={form.preco}
                  onChange={e => set('preco', e.target.value)} placeholder="0,00" />
                {errors.preco && <span className="form-error">{errors.preco}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Estoque *</label>
                <input className="form-input" type="number" min="0" value={form.estoque}
                  onChange={e => set('estoque', e.target.value)} placeholder="0" />
                {errors.estoque && <span className="form-error">{errors.estoque}</span>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select className="form-input form-select" value={form.categoria_id} onChange={e => set('categoria_id', e.target.value)}>
                <option value="">Sem categoria</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">URL da Imagem</label>
              <input className="form-input" value={form.imagem_url} onChange={e => {
                set('imagem_url', e.target.value);
                if (e.target.value) set('imagem_base64', '');
              }} placeholder="https://..." />
              {form.imagem_url && (
                <img src={form.imagem_url} alt="preview" onError={e => e.target.style.display='none'}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, marginTop: 6 }} />
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Upload de imagem</label>
              <input type="file" accept="image/*" className="form-input" onChange={handleImageFile} />
              {(form.imagem_base64 || form.imagem_url) && (
                <img src={form.imagem_base64 || form.imagem_url} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, marginTop: 6 }} />
              )}
              <p style={{ margin: '8px 0 0', color: 'var(--gray-500)', fontSize: 12 }}>
                Envie uma imagem local ou use uma URL. A imagem local é armazenada em base64.
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Tamanhos <span style={{fontSize:11,color:'var(--gray-400)',fontWeight:400,textTransform:'none'}}>— Enter para adicionar</span></label>
              <ChipsInput value={form.tamanhos} onChange={v => set('tamanhos', v)} placeholder="P, M, G, GG..." />
            </div>
            <div className="form-group">
              <label className="form-label">Cores <span style={{fontSize:11,color:'var(--gray-400)',fontWeight:400,textTransform:'none'}}>— Enter para adicionar</span></label>
              <ChipsInput value={form.cores} onChange={v => set('cores', v)} placeholder="Preto, Branco..." />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.ativo} onChange={e => set('ativo', e.target.checked)} style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Produto ativo (visível no catálogo)</span>
            </label>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {isEdit ? 'Salvar alterações' : 'Criar produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header"><h2>Confirmar ação</h2></div>
        <div className="modal-body"><p style={{ fontSize: 15 }}>{message}</p></div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminProdutos() {
  const { toast } = useToast();
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [atoFilter, setAtoFilter] = useState('');
  const [modal, setModal] = useState(null); // null | { type: 'form'|'confirm', data }

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search };
      if (catFilter) params.categoria_id = catFilter;
      if (atoFilter !== '') params.ativo = atoFilter;
      const { data } = await produtosAPI.list(params);
      setProdutos(data.data);
      setPagination(data.pagination);
    } catch (e) { toast('Erro ao carregar produtos', 'error'); }
    finally { setLoading(false); }
  }, [search, catFilter, atoFilter]);

  useEffect(() => { produtosAPI.categorias().then(r => setCategorias(r.data)); }, []);
  useEffect(() => { load(1); }, [load]);

  const handleToggle = async (p) => {
    try {
      await produtosAPI.toggle(p.id);
      toast(`Produto ${p.ativo ? 'desativado' : 'ativado'}`, 'success');
      load(pagination.page);
    } catch { toast('Erro ao alterar status', 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      await produtosAPI.delete(id);
      toast('Produto excluído com sucesso', 'success');
      setModal(null);
      load(pagination.page);
    } catch (err) { toast(err.response?.data?.error || 'Erro ao excluir', 'error'); }
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '0.04em' }}>Gerenciar Produtos</h1>
          <p style={{ color: 'var(--gray-600)', marginTop: 4 }}>{pagination.total} produto(s) cadastrado(s)</p>
        </div>
        <button className="btn btn-accent" onClick={() => setModal({ type: 'form', data: null })}>
          + Novo Produto
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <form onSubmit={e => { e.preventDefault(); setSearch(searchInput); }} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 220 }}>
            <input className="form-input" placeholder="Buscar por nome ou descrição..." style={{ flex: 1 }}
              value={searchInput} onChange={e => setSearchInput(e.target.value)} />
            <button type="submit" className="btn btn-primary btn-sm">Buscar</button>
          </form>
          <select className="form-input form-select" style={{ minWidth: 160 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">Todas categorias</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <select className="form-input form-select" style={{ minWidth: 130 }} value={atoFilter} onChange={e => setAtoFilter(e.target.value)}>
            <option value="">Todos status</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
          {(search || catFilter || atoFilter) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setSearchInput(''); setCatFilter(''); setAtoFilter(''); }}>
              ✕ Limpar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : produtos.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📦</div>
            <h3>Nenhum produto encontrado</h3>
            <p>Crie um novo produto ou ajuste os filtros</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {p.imagem_base64 || p.imagem_url
                          ? <img src={p.imagem_base64 || p.imagem_url} alt={p.nome} className="product-thumb" onError={e => e.target.style.display='none'} />
                          : <div className="product-thumb-placeholder">👕</div>}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{p.nome}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                            {p.tamanhos?.join(', ') || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-gray">{p.categoria_nome || '—'}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmt(p.preco)}</span></td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', color: p.estoque <= 5 ? 'var(--warning)' : 'inherit', fontWeight: p.estoque <= 5 ? 600 : 400 }}>
                        {p.estoque}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.ativo ? 'badge-green' : 'badge-red'}`}>
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" title="Editar"
                          onClick={() => setModal({ type: 'form', data: p })}>✏️</button>
                        <button className="btn btn-ghost btn-sm" title={p.ativo ? 'Desativar' : 'Ativar'}
                          onClick={() => handleToggle(p)}>{p.ativo ? '🔴' : '🟢'}</button>
                        <button className="btn btn-ghost btn-sm" title="Excluir"
                          onClick={() => setModal({ type: 'confirm', data: p })}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination" style={{ padding: '16px' }}>
            <button className="page-btn" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>‹</button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${p === pagination.page ? 'active' : ''}`} onClick={() => load(p)}>{p}</button>
            ))}
            <button className="page-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => load(pagination.page + 1)}>›</button>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === 'form' && (
        <ProductModal
          product={modal.data} categorias={categorias}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(pagination.page); }}
        />
      )}
      {modal?.type === 'confirm' && (
        <ConfirmDialog
          message={`Deseja excluir "${modal.data.nome}"? Esta ação não pode ser desfeita.`}
          onConfirm={() => handleDelete(modal.data.id)}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
