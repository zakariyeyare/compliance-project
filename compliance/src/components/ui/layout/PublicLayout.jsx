import { Outlet } from 'react-router-dom';

export default function PublicLayout() {   // ← default export must be here
  return (
    <div style={{minHeight:'100vh', display:'grid', placeItems:'center', background:'#f1faf4'}}>
      <div style={{background:'#fff', padding:'28px', borderRadius:'12px', width:'100%', maxWidth:'420px', boxShadow:'0 10px 24px rgba(0,0,0,.08)'}}>
        <Outlet /> {/* Render child routes here */}
      </div>
    </div>
  );
}
