 'react';
import { Link, Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div style={{display:'flex', minHeight:'100vh'}}>
      <aside style={{width:260, background:'#0f172a', color:'#fff', padding:'20px'}}>
        <h3 style={{marginBottom:16}}>Compliance</h3>
        <nav style={{display:'grid', gap:8}}>
          <Link to="/setup" style={{color:'#fff'}}>Firma & Standard</Link>
        </nav>
      </aside>
      <main style={{flex:1, padding:24, background:'#f8fafc'}}>
        <Outlet />
      </main>
    </div>
  );
}
