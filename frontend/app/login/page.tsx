import { useState } from 'react';
import { useAuth } from '../auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' ? { email, password } : { username, email, password };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/` + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auth failed');
      login(data.token, data.user);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Auth failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: '60px auto', padding: 24 }}>
      <h1 style={{ marginBottom: 20 }}>{mode === 'login' ? 'Login' : 'Create account'}</h1>

      {mode === 'register' && (
        <label style={{ display: 'block', marginBottom: 16 }}>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
        </label>
      )}

      <label style={{ display: 'block', marginBottom: 16 }}>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      </label>

      <label style={{ display: 'block', marginBottom: 16 }}>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
      </label>

      {error && <div style={{ color: '#b91c1c', marginBottom: 16 }}>{error}</div>}

      <button onClick={submit} disabled={loading} style={buttonStyle}>
        {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
      </button>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer' }}>
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </main>
  );
}

const inputStyle = { width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', marginTop: 8 } as const;
const buttonStyle = { width: '100%', padding: '12px 18px', background: '#25d366', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' } as const;
