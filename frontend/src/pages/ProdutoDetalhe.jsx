import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { produtosAPI } from '../services/api';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    produtosAPI.get(id)
      .then((res) => setProduto(res.data))
      .catch(() => setError('Produto não encontrado ou indisponível.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 32 }}>
        <Link to="/produtos" className="btn btn-ghost">← Voltar ao catálogo</Link>
        <div className="empty-state" style={{ marginTop: 24 }}>
          <div className="icon">⚠️</div>
          <h3>Erro</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, display: 'grid', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
      <Link to="/produtos" className="btn btn-ghost">← Voltar ao catálogo</Link>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 380px) 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--gray-100)', minHeight: 380 }}>
          {produto.imagem_base64 || produto.imagem_url ? (
            <img src={produto.imagem_base64 || produto.imagem_url} alt={produto.nome}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>
              👕
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{produto.nome}</div>
            <div style={{ marginTop: 8, color: 'var(--gray-600)' }}>{produto.categoria_nome || 'Sem categoria'}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 32, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{fmt(produto.preco)}</div>
            <span className={`badge ${produto.ativo ? 'badge-green' : 'badge-red'}`}>{produto.ativo ? 'Disponível' : 'Indisponível'}</span>
            <span className="badge badge-gray">Estoque: {produto.estoque}</span>
          </div>
          <div style={{ padding: 20, borderRadius: 16, background: 'white', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ margin: 0, marginBottom: 12, fontSize: 18 }}>Descrição do produto</h3>
            <p style={{ margin: 0, color: 'var(--gray-700)', lineHeight: 1.75 }}>{produto.descricao || 'Nenhuma descrição cadastrada.'}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <div style={{ padding: 18, borderRadius: 16, background: 'white', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 8 }}>Tamanhos</div>
              <div>{produto.tamanhos?.length > 0 ? produto.tamanhos.join(', ') : '—'}</div>
            </div>
            <div style={{ padding: 18, borderRadius: 16, background: 'white', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 8 }}>Cores</div>
              <div>{produto.cores?.length > 0 ? produto.cores.join(', ') : '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
