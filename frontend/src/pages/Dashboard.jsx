import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { produtosAPI, usuariosAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon, label, value, color, link }) {
  return (
    <Link to={link || '#'} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ padding: '24px', cursor: link ? 'pointer' : 'default', transition: 'transform 0.2s, box-shadow 0.2s' }}
        onMouseEnter={e => { if (link) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
        <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', letterSpacing: '0.04em', color }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4, fontWeight: 500 }}>{label}</div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ produtos: 0, ativos: 0, usuarios: 0, estoque: 0 });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes] = await Promise.all([produtosAPI.list({ limit: 100 })]);
        const prods = prodRes.data.data;
        const ativos = prods.filter(p => p.ativo).length;
        const estoque = prods.reduce((s, p) => s + p.estoque, 0);
        setStats(s => ({ ...s, produtos: prods.length, ativos, estoque }));
        setRecentProducts(prods.slice(0, 4));

        if (isAdmin) {
          const usrRes = await usuariosAPI.list({ limit: 1 });
          setStats(s => ({ ...s, usuarios: usrRes.data.pagination.total }));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [isAdmin]);

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1200 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '0.04em' }}>
          Olá, {user?.nome?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--gray-600)', marginTop: 4 }}>Bem-vindo ao painel da DRIP Store</p>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard icon="👕" label="Total de Produtos" value={stats.produtos} link="/produtos" />
            <StatCard icon="✅" label="Produtos Ativos" value={stats.ativos} color="var(--success)" link="/produtos" />
            <StatCard icon="📦" label="Peças em Estoque" value={stats.estoque.toLocaleString('pt-BR')} />
            {isAdmin && <StatCard icon="👥" label="Usuários Cadastrados" value={stats.usuarios} link="/admin/usuarios" />}
          </div>

          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Produtos Recentes</h2>
              <Link to="/produtos" className="btn btn-outline btn-sm">Ver todos</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1, background: 'var(--gray-100)' }}>
              {recentProducts.map(p => (
                <div key={p.id} style={{ background: 'var(--white)', padding: '20px' }}>
                  {p.imagem_url ? (
                    <img src={p.imagem_url} alt={p.nome} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 4, marginBottom: 12 }} />
                  ) : (
                    <div style={{ width: '100%', height: 160, background: 'var(--gray-100)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 12 }}>👕</div>
                  )}
                  <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>{p.nome}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--accent)' }}>{fmt(p.preco)}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
                    {p.categoria_nome} · Estoque: {p.estoque}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div style={{ marginTop: 24, padding: '20px 24px', background: 'var(--black)', color: 'var(--white)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 4 }}>Painel Admin</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Gerencie produtos e usuários</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/admin/produtos" className="btn btn-accent">Gerenciar Produtos</Link>
                <Link to="/admin/usuarios" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'var(--white)' }}>Gerenciar Usuários</Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
