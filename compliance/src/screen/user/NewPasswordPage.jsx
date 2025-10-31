console.log('Render: LoginPage');

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminSignIn, requestUserCode, verifyUserCode } from '../lib/auth.js';

export default function LoginPage() {
  const [mode, setMode] = useState('user'); // 'user' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const nav = useNavigate();

  const onSwitch = (m) => {
    setMode(m);
    setError('');
    setInfo('');
    setPassword('');
    setCode('');
    setCodeSent(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === 'admin') {
        await adminSignIn(normalizedEmail, password);
        nav('/setup', { replace: true });
        return;
      }

      // User flow (6-digit code)
      if (!codeSent) {
        await requestUserCode(normalizedEmail);
        setCodeSent(true);
        setInfo('En 6-cifret kode er sendt til din e-mail.');
        return;
      }

      if (code.trim().length !== 6) throw new Error('Koden skal være 6 cifre.');
      await verifyUserCode(normalizedEmail, code.trim());
      nav('/setup', { replace: true });
    } catch (err) {
      setError(err.message || 'Login fejlede');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1 style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Login</h1>
      <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 16 }}>Vælg din logintype nedenfor</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => onSwitch('user')}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 999,
            border: '1px solid #cbd5e1',
            background: mode === 'user' ? '#1d4ed8' : '#fff',
            color: mode === 'user' ? '#fff' : '#0b0b23',
            fontWeight: 600, cursor: 'pointer'
          }}
        >
          Bruger
        </button>
        <button
          type="button"
          onClick={() => onSwitch('admin')}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 999,
            border: '1px solid #cbd5e1',
            background: mode === 'admin' ? '#1d4ed8' : '#fff',
            color: mode === 'admin' ? '#fff' : '#0b0b23',
            fontWeight: 600, cursor: 'pointer'
          }}
        >
          Administrator
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din.email@virksomhed.dk"
            required
            style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8 }}
          />
        </label>

        {mode === 'admin' ? (
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Adgangskode</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Indtast adgangskode"
              required
              style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8 }}
            />
          </label>
        ) : (
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Adgangskode (6 cifre)</span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              disabled={!codeSent}
              style={{
                padding: '10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                background: codeSent ? '#fff' : '#f1f5f9'
              }}
            />
            <small style={{ color: '#64748b' }}>
              Din adgangskode er sendt til din email af administrator.
            </small>
          </label>
        )}

        {error && <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>}
        {info && <div style={{ color: '#0f766e', fontSize: 14 }}>{info}</div>}

        <button
          disabled={busy || (mode === 'admin' ? !email || !password : !email)}
          style={{
            marginTop: 4, padding: '12px', border: 'none', borderRadius: 10,
            background: '#1d4ed8', color: '#fff', fontWeight: 600, cursor: 'pointer',
            opacity: busy ? 0.7 : 1
          }}
        >
          {busy
            ? 'Arbejder…'
            : mode === 'admin'
              ? 'Log ind som Administrator'
              : codeSent ? 'Log ind som Bruger' : 'Send kode til email'}
        </button>

        {mode === 'user' && codeSent && (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              try {
                setBusy(true); setError(''); setInfo('');
                await requestUserCode(email.trim().toLowerCase());
                setInfo('Ny kode er sendt til din e-mail.');
              } catch (err) {
                setError(err.message || 'Kunne ikke sende ny kode');
              } finally {
                setBusy(false);
              }
            }}
            style={{
              padding: '10px', border: '1px solid #cbd5e1', borderRadius: 8,
              background: '#fff', color: '#0b0b23', fontWeight: 600, cursor: 'pointer'
            }}
          >
            Send ny kode
          </button>
        )}
      </form>
    </>
  );
}