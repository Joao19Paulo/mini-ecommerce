import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { produtosAPI } from '../services/api';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await produtosAPI.list({ page, limit: 8, search, categoria_id: catFilter, ativo: 'true' });
      setProdutos(data.data);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    produtosAPI.categorias().then(r => setCategorias(r.data));
  }, []);

  useEffect(() => { load(1); }, [search, catFilter]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '0.04em', marginBottom: 4 }}>
          Catálogo de Camisas
        </h1>
        <p style={{ color: 'var(--gray-600)' }}>{pagination.total} produto(s) disponíveis</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 240 }}>
          <input className="form-input" placeholder="Buscar camisas..." style={{ flex: 1 }}
            value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          <button type="submit" className="btn btn-primary">Buscar</button>
        </form>
        <select className="form-input form-select" style={{ minWidth: 180 }}
          value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        {(search || catFilter) && (
          <button className="btn btn-ghost" onClick={() => { setSearch(''); setSearchInput(''); setCatFilter(''); }}>
            ✕ Limpar filtros
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : produtos.length === 0 ? (
        <div className="empty-state">
          <div className="icon">👕</div>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente ajustar os filtros de busca</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {produtos.map(p => {
            const imageSrc = p.imagem_base64 || p.imagem_url;
            return (
              <Link key={p.id} to={`/produtos/${p.id}`} className="card" style={{ overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', textDecoration: 'none', color: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ position: 'relative', height: 260, overflow: 'hidden', background: 'var(--gray-100)' }}>
                  {imageSrc ? (
                    <img src={imageSrc} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = ''} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 60 }}>👕</div>
                  )}
                  <div style={{ position: 'absolute', top: 10, left: 10 }}>
                    <span className="badge badge-gray" style={{ backdropFilter: 'blur(4px)', background: 'rgba(255,255,255,0.9)' }}>
                      {p.categoria_nome}
                    </span>
                  </div>
                  {p.estoque <= 5 && p.estoque > 0 && (
                    <div style={{ position: 'absolute', top: 10, right: 10 }}>
                      <span className="badge badge-orange">Últimas peças</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>{p.nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 12, lineHeight: 1.4 }}>
                    {p.descricao?.substring(0, 70)}{p.descricao?.length > 70 ? '...' : ''}
                  </div>
                  {p.tamanhos?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                      {p.tamanhos.map(t => (
                        <span key={t} style={{ fontSize: 11, padding: '2px 8px', border: '1px solid var(--gray-200)', borderRadius: 2, fontWeight: 600 }}>{t}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--accent)' }}>{fmt(p.preco)}</span>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Estoque: {p.estoque}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>‹</button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn ${p === pagination.page ? 'active' : ''}`} onClick={() => load(p)}>{p}</button>
          ))}
          <button className="page-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => load(pagination.page + 1)}>›</button>
        </div>
      )}
    </div>
  );
}
