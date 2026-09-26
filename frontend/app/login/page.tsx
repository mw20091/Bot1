export default function HomePage() {
  return (
    <main style={{ padding: 32, fontFamily: 'Arial, sans-serif' }}>
      <h1>WhatsApp Bot Testing Dashboard</h1>
      <p>Connect a linked WhatsApp session to test bot behavior.</p>

      <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
        <a href="/login" style={{ padding: '12px 20px', background: '#25d366', color: '#fff', borderRadius: 8, textDecoration: 'none' }}>
          Connect Session
        </a>
        <a href="/dashboard" style={{ padding: '12px 20px', background: '#111827', color: '#fff', borderRadius: 8, textDecoration: 'none' }}>
          Open Dashboard
        </a>
      </div>
    </main>
  );
}
