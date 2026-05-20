import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const NavItem = ({ to, icon, label, end }) => (
  <NavLink to={to} end={end} className={({ isActive }) =>
    `nav-item ${isActive ? 'active' : ''}`
  }>
    <span className="nav-icon">{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast('Sessão encerrada', 'info');
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Mobile header */}
      <header className="mobile-header">
        <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        <span className="logo-text">DRIP</span>
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">👕</span>
          <span className="logo-text">DRIP</span>
          <span className="logo-sub">STORE</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-label">Loja</span>
            <NavItem to="/" end icon="🏠" label="Dashboard" />
            <NavItem to="/produtos" icon="👕" label="Produtos" />
          </div>

          {isAdmin && (
            <div className="nav-section">
              <span className="nav-section-label">Admin</span>
              <NavItem to="/admin/produtos" icon="📦" label="Gerenciar Produtos" />
              <NavItem to="/admin/usuarios" icon="👥" label="Gerenciar Usuários" />
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.nome?.[0]?.toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{user?.nome}</span>
              <span className={`badge ${user?.perfil === 'admin' ? 'badge-orange' : 'badge-blue'} user-role`}>
                {user?.perfil}
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sair</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>

      <style>{`
        .layout { display: flex; min-height: 100vh; }
        .sidebar {
          width: 240px; background: var(--black); color: var(--white);
          display: flex; flex-direction: column; flex-shrink: 0;
          position: sticky; top: 0; height: 100vh; overflow-y: auto;
        }
        .sidebar-logo {
          padding: 24px 20px 20px;
          display: flex; align-items: baseline; gap: 6px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .logo-icon { font-size: 20px; }
        .logo-text { font-family: var(--font-display); font-size: 28px; letter-spacing: 0.08em; color: var(--white); }
        .logo-sub { font-family: var(--font-display); font-size: 14px; color: var(--accent); letter-spacing: 0.12em; }
        .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
        .nav-section { margin-bottom: 20px; }
        .nav-section-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.3); padding: 0 8px; display: block; margin-bottom: 6px; }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: var(--radius); font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.6); transition: all var(--transition); cursor: pointer;
        }
        .nav-item:hover { background: rgba(255,255,255,0.06); color: var(--white); }
        .nav-item.active { background: var(--accent); color: #fff; }
        .nav-icon { font-size: 16px; width: 20px; text-align: center; }
        .sidebar-footer { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.08); }
        .user-info { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .user-avatar {
          width: 36px; height: 36px; border-radius: 50%; background: var(--accent);
          display: flex; align-items: center; justify-content: center; font-weight: 700;
          font-size: 14px; flex-shrink: 0;
        }
        .user-details { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .user-name { font-size: 13px; font-weight: 600; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 10px; padding: 1px 7px; }
        .main-content { flex: 1; overflow-x: hidden; }
        .mobile-header { display: none; }
        .sidebar-overlay { display: none; }
        @media (max-width: 768px) {
          .layout { flex-direction: column; }
          .sidebar {
            position: fixed; top: 0; left: 0; z-index: 100;
            transform: translateX(-100%); transition: transform 0.3s;
            height: 100vh; width: 260px;
          }
          .sidebar.open { transform: translateX(0); }
          .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }
          .mobile-header {
            display: flex; align-items: center; gap: 16px; padding: 12px 16px;
            background: var(--black); color: var(--white); position: sticky; top: 0; z-index: 90;
          }
          .main-content { padding-top: 0; }
        }
      `}</style>
    </div>
  );
}
