'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [sessionName, setSessionName] = useState('Personal Test Session');
  const [userId, setUserId] = useState('00000000-0000-0000-0000-000000000000');
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createSession() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionName }),
      });

      const data = await res.json();
      const sessionId = data.session?.id;

      if (sessionId) {
        const qrRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/session/${sessionId}/qr`);
        const qrData = await qrRes.json();
        setQr(qrData.qr || null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: 24 }}>
      <h1>Connect WhatsApp Session</h1>

      <div style={{ display: 'grid', gap: 16 }}>
        <label>
          Session name
          <input value={sessionName} onChange={(e) => setSessionName(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 8, padding: 10 }} />
        </label>

        <label>
          User ID
          <input value={userId} onChange={(e) => setUserId(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 8, padding: 10 }} />
        </label>

        <button onClick={createSession} disabled={loading} style={{ padding: '12px 20px', background: '#25d366', color: '#fff', border: 'none', borderRadius: 8 }}>
          {loading ? 'Connecting...' : 'Create session'}
        </button>
      </div>

      {qr ? (
        <div style={{ marginTop: 32 }}>
          <h3>QR Code</h3>
          <img src={`data:image/png;base64,${qr}`} alt="WhatsApp QR" style={{ width: 300, height: 300, objectFit: 'contain', border: '1px solid #ddd' }} />
        </div>
      ) : null}
    </main>
  );
}
