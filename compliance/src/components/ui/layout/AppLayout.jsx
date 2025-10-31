import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from '../../../lib/auth.js';

export default function AppLayout() {
  const nav = useNavigate();

  const linkStyle = ({ isActive }) => ({
    color: '#fff',
    textDecoration: 'none',
    padding: '8px 10px',
    borderRadius: 6,
    background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent'
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      nav('/login', { replace: true });
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 260, background: '#0f172a', color: '#fff', padding: 20 }}>
        <h3 style={{ marginBottom: 16 }}>Compliance</h3>
        <nav style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
          <NavLink to="/kontrolmal" style={linkStyle}>Kontrolmål</NavLink>
          <NavLink to="/approval" style={linkStyle}>Approval</NavLink>
        </nav>
        <button
          onClick={handleSignOut}
          style={{
            padding: '8px 10px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,.2)',
            background: 'transparent',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Log ud
        </button>
      </aside>

      <main style={{ flex: 1, padding: 24, background: '#f8fafc' }}>
        <Outlet />
      </main>
    </div>
  );
}
