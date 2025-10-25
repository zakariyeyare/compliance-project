console.log('Render: SignupPage');

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { signUp } from '../lib/auth.js';

console.log('Render: SignupPage');

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName  = fullName.trim();

  console.log('RAW:', JSON.stringify(email), 'LEN:', email.length);
  console.log('NORM:', JSON.stringify(normalizedEmail), 'LEN:', normalizedEmail.length);

    // Tegn-inspektør ✅
  for (let i = 0; i < email.length; i++) {
    console.log(`RAW[${i}] code=${email.charCodeAt(i)}`);
  }

    try {
  await signUp(normalizedEmail, password, normalizedName);
  setMessage('Konto oprettet! Tjek din e-mail for at bekræfte din konto.');
  setError('');
} catch (err) {
  if (err.code === "email-already-in-use") {
    setError("Denne e-mail findes allerede! Log ind i stedet.");
    return;
  }
  setError(err.message);
}finally {
  setLoading(false);
}
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
        Opret konto
      </h1>
      <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 20 }}>
        Lav en bruger til compliance-systemet
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
        {/* Fulde navn */}
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Fulde navn</span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Fx. Abdirahman Mohamed"
            required
            style={{
              padding: '10px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
            }}
          />
        </label>

        {/* Email */}
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            style={{
              padding: '10px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
            }}
          />
        </label>

        {/* Password */}
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Adgangskode</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 tegn"
            required
            style={{
              padding: '10px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
            }}
          />
        </label>

        {/* Fejl / beskeder */}
        {error && <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>}
        {message && <div style={{ color: '#15803d', fontSize: 14 }}>{message}</div>}

        {/* Submit-knap */}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 4,
            padding: '12px',
            border: 'none',
            borderRadius: 10,
            background: '#0b0b23',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Opretter...' : 'Opret konto'}
        </button>
      </form>
      <div style={{ textAlign: 'center', fontSize: 14, marginTop: 10 }}>
          Har du allerede en konto? <Link to="/login">Log ind</Link>
        </div>
    </div>
  );
}
