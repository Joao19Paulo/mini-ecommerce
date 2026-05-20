import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';

export default function Login() {
  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.senha);
        toast('Bem-vindo de volta!', 'success');
        navigate('/');
      } else {
        await authAPI.register(form);
        toast('Conta criada! Faça o login.', 'success');
        setMode('login');
        setForm(f => ({ ...f, nome: '' }));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao processar');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: 'var(--black)',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: '60px 40px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px'
        }} />
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>👕</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 72, letterSpacing: '0.06em',
            color: 'var(--white)', lineHeight: 0.9, marginBottom: 8
          }}>DRIP<br /><span style={{ color: 'var(--accent)' }}>STORE</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginTop: 16 }}>
            Camisas premium para quem sabe o que quer usar.
          </p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['Camisetas Básicas', 'Estampadas', 'Polos', 'Oversized'].map(cat => (
              <div key={cat} style={{
                padding: '12px 20px', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 4, color: 'rgba(255,255,255,0.6)', fontSize: 14,
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <span style={{ color: 'var(--accent)' }}>→</span> {cat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{
        width: '480px', background: 'var(--cream)', display: 'flex',
        flexDirection: 'column', justifyContent: 'center', padding: '60px 48px'
      }}>
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 8 }}>
            {mode === 'login' ? 'Acessar conta' : 'Criar conta'}
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>
            {mode === 'login'
              ? 'Entre com suas credenciais para continuar'
              : 'Crie sua conta para começar a comprar'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input className="form-input" type="text" placeholder="Seu nome"
                value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="seu@email.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} required />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#fde8e7', border: '1px solid #f5c6c3', borderRadius: 4, color: 'var(--danger)', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4, padding: '14px', fontSize: 15 }}>
            {loading ? <span className="spinner" /> : null}
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <span style={{ color: 'var(--gray-600)', fontSize: 14 }}>
            {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--black)', fontWeight: 600, textDecoration: 'underline' }}>
              {mode === 'login' ? 'Criar conta' : 'Fazer login'}
            </button>
          </span>
        </div>

        {mode === 'login' && (
          <div style={{ marginTop: 32, padding: '14px', background: 'rgba(0,0,0,0.04)', borderRadius: 4, fontSize: 12, color: 'var(--gray-600)' }}>
            <strong>Demo:</strong> admin@camisas.com / admin123
          </div>
        )}
      </div>
    </div>
  );
}
