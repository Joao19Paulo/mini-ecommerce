import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usuariosAPI } from '../services/api';

const fmtDate = (value) => value ? new Date(value).toLocaleString('pt-BR') : '—';

export default function AdminUsuarioDetalhe() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    usuariosAPI.get(id)
      .then((res) => setUsuario(res.data))
      .catch(() => setError('Usuário não encontrado ou sem permissão para visualizar.'))
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
        <Link to="/admin/usuarios" className="btn btn-ghost">← Voltar</Link>
        <div className="empty-state" style={{ marginTop: 24 }}>
          <div className="icon">⚠️</div>
          <h3>Erro</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 920, margin: '0 auto' }}>
      <Link to="/admin/usuarios" className="btn btn-ghost">← Voltar</Link>
      <div style={{ marginTop: 24, display: 'grid', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, margin: 0 }}>{usuario.nome}</h1>
              <p style={{ color: 'var(--gray-600)', marginTop: 6 }}>Perfil: <strong>{usuario.perfil === 'admin' ? 'Administrador' : 'Usuário'}</strong></p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span className={`badge ${usuario.ativo ? 'badge-green' : 'badge-red'}`}>{usuario.ativo ? 'Ativo' : 'Inativo'}</span>
              <span className="badge badge-gray">ID: {usuario.id}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ marginBottom: 10, color: 'var(--gray-500)', fontSize: 13 }}>Email</div>
              <div style={{ fontSize: 16 }}>{usuario.email}</div>
            </div>
            <div>
              <div style={{ marginBottom: 10, color: 'var(--gray-500)', fontSize: 13 }}>Cadastro</div>
              <div style={{ fontSize: 16 }}>{fmtDate(usuario.criado_em)}</div>
            </div>
            <div>
              <div style={{ marginBottom: 10, color: 'var(--gray-500)', fontSize: 13 }}>Última atualização</div>
              <div style={{ fontSize: 16 }}>{fmtDate(usuario.atualizado_em)}</div>
            </div>
            <div>
              <div style={{ marginBottom: 10, color: 'var(--gray-500)', fontSize: 13 }}>Status</div>
              <div style={{ fontSize: 16 }}>{usuario.ativo ? 'Ativo' : 'Inativo'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
