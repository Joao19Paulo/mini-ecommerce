import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usuariosAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

// ─── User Form Modal ──────────────────────────────────────────────────────────
function UserModal({ user, onClose, onSaved }) {
  const { toast } = useToast();
  const isEdit = !!user?.id;
  const [form, setForm] = useState({
    nome: user?.nome || '', email: user?.email || '',
    senha: '', perfil: user?.perfil || 'user', ativo: user?.ativo !== false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório';
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = 'Email inválido';
    if (!isEdit && !form.senha) e.senha = 'Senha é obrigatória';
    if (form.senha && form.senha.length < 6) e.senha = 'Mínimo 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.senha) delete payload.senha;
      if (isEdit) await usuariosAPI.update(user.id, payload);
      else await usuariosAPI.create(payload);
      toast(isEdit ? 'Usuário atualizado!' : 'Usuário criado!', 'success');
      onSaved();
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao salvar usuário', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nome completo *</label>
              <input className="form-input" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome do usuário" />
              {errors.nome && <span className="form-error">{errors.nome}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@exemplo.com" />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">{isEdit ? 'Nova senha (deixe vazio para manter)' : 'Senha *'}</label>
              <input className="form-input" type="password" value={form.senha} onChange={e => set('senha', e.target.value)}
                placeholder={isEdit ? 'Mínimo 6 caracteres' : 'Senha'} />
              {errors.senha && <span className="form-error">{errors.senha}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Perfil</label>
                <select className="form-input form-select" value={form.perfil} onChange={e => set('perfil', e.target.value)}>
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end', paddingBottom: 2 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 'auto' }}>
                  <input type="checkbox" checked={form.ativo} onChange={e => set('ativo', e.target.checked)} style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>Usuário ativo</span>
                </label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {isEdit ? 'Salvar alterações' : 'Criar usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
export default function AdminUsuarios() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [perfilFilter, setPerfilFilter] = useState('');
  const [atoFilter, setAtoFilter] = useState('');
  const [modal, setModal] = useState(null);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search };
      if (perfilFilter) params.perfil = perfilFilter;
      if (atoFilter !== '') params.ativo = atoFilter;
      const { data } = await usuariosAPI.list(params);
      setUsuarios(data.data);
      setPagination(data.pagination);
    } catch (e) { toast('Erro ao carregar usuários', 'error'); }
    finally { setLoading(false); }
  }, [search, perfilFilter, atoFilter]);

  useEffect(() => { load(1); }, [load]);

  const handleToggle = async (u) => {
    if (u.id === currentUser?.id) return toast('Não é possível alterar o próprio status', 'error');
    try {
      await usuariosAPI.toggle(u.id);
      toast(`Usuário ${u.ativo ? 'desativado' : 'ativado'}`, 'success');
      load(pagination.page);
    } catch { toast('Erro ao alterar status', 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      await usuariosAPI.delete(id);
      toast('Usuário excluído com sucesso', 'success');
      setModal(null);
      load(pagination.page);
    } catch (err) { toast(err.response?.data?.error || 'Erro ao excluir', 'error'); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '0.04em' }}>Gerenciar Usuários</h1>
          <p style={{ color: 'var(--gray-600)', marginTop: 4 }}>{pagination.total} usuário(s) cadastrado(s)</p>
        </div>
        <button className="btn btn-accent" onClick={() => setModal({ type: 'form', data: null })}>
          + Novo Usuário
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <form onSubmit={e => { e.preventDefault(); setSearch(searchInput); }} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 220 }}>
            <input className="form-input" placeholder="Buscar por nome ou email..." style={{ flex: 1 }}
              value={searchInput} onChange={e => setSearchInput(e.target.value)} />
            <button type="submit" className="btn btn-primary btn-sm">Buscar</button>
          </form>
          <select className="form-input form-select" style={{ minWidth: 140 }} value={perfilFilter} onChange={e => setPerfilFilter(e.target.value)}>
            <option value="">Todos os perfis</option>
            <option value="admin">Admin</option>
            <option value="user">Usuário</option>
          </select>
          <select className="form-input form-select" style={{ minWidth: 130 }} value={atoFilter} onChange={e => setAtoFilter(e.target.value)}>
            <option value="">Todos status</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
          {(search || perfilFilter || atoFilter) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setSearchInput(''); setPerfilFilter(''); setAtoFilter(''); }}>
              ✕ Limpar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : usuarios.length === 0 ? (
          <div className="empty-state">
            <div className="icon">👥</div>
            <h3>Nenhum usuário encontrado</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} style={{ opacity: u.ativo ? 1 : 0.6 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: u.perfil === 'admin' ? 'var(--accent)' : 'var(--black)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: 14
                        }}>{u.nome?.[0]?.toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            <Link to={`/admin/usuarios/${u.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{u.nome}</Link>
                            {u.id === currentUser?.id && <span style={{ fontSize: 11, color: 'var(--gray-400)', marginLeft: 6 }}>(você)</span>}
                          </div>
                          <div className="font-mono" style={{ fontSize: 11, color: 'var(--gray-400)' }}>{u.id?.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 14 }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.perfil === 'admin' ? 'badge-orange' : 'badge-blue'}`}>
                        {u.perfil === 'admin' ? '👑 Admin' : '👤 Usuário'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.ativo ? 'badge-green' : 'badge-red'}`}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--gray-600)' }}>{fmtDate(u.criado_em)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" title="Editar"
                          onClick={() => setModal({ type: 'form', data: u })}>✏️</button>
                        <button className="btn btn-ghost btn-sm" title={u.ativo ? 'Desativar' : 'Ativar'}
                          onClick={() => handleToggle(u)} disabled={u.id === currentUser?.id}>
                          {u.ativo ? '🔴' : '🟢'}
                        </button>
                        <button className="btn btn-ghost btn-sm" title="Excluir"
                          onClick={() => setModal({ type: 'confirm', data: u })}
                          disabled={u.id === currentUser?.id}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

      {modal?.type === 'form' && (
        <UserModal user={modal.data} onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(pagination.page); }} />
      )}
      {modal?.type === 'confirm' && (
        <ConfirmDialog
          message={`Deseja excluir o usuário "${modal.data.nome}"? Esta ação não pode ser desfeita.`}
          onConfirm={() => handleDelete(modal.data.id)}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
