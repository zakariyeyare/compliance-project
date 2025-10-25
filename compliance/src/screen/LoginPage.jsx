console.log('Render: LoginPage');

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../lib/auth.js';



export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    const normalizedEmail = email.trim().toLowerCase();
    try {
      await signIn(normalizedEmail, password);
      nav('/setup', { replace: true });
    } catch (err) {
      setError(err.message || 'Login fejlede');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1 style={{textAlign:'center', fontSize:28, fontWeight:700, marginBottom:6}}>Compliance</h1>
      <p style={{textAlign:'center', color:'#64748b', marginBottom:20}}>Log ind til compliance management systemet</p>

      <form onSubmit={handleSubmit} style={{display:'grid', gap:14}}>
        <label style={{display:'grid', gap:6}}>
          <span>Brugernavn / Email</span>
          <input
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="Indtast brugernavn"
            required
            style={{padding:'10px 12px', border:'1px solid #cbd5e1', borderRadius:8}}
          />
        </label>

        <label style={{display:'grid', gap:6}}>
          <span>Adgangskode</span>
          <input
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            placeholder="Indtast adgangskode"
            required
            style={{padding:'10px 12px', border:'1px solid #cbd5e1', borderRadius:8}}
          />
        </label>

        {error && <div style={{color:'#b91c1c', fontSize:14}}>{error}</div>}

        <button
          disabled={busy}
          style={{
            marginTop:4, padding:'12px', border:'none', borderRadius:10,
            background:'#0b0b23', color:'#fff', fontWeight:600, cursor:'pointer',
            opacity: busy ? .7 : 1
          }}>
          {busy ? 'Logger ind…' : 'Log ind'}
        </button>
      </form>
      {/* Link til signup */}
        <div style={{ textAlign: 'center', fontSize: 14, marginTop: 10 }}>
          Har du ikke en konto? <Link to="/signup">Opret en</Link>
        </div>
    </>
  );
}
