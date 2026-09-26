export default function HomePage() {
  return (
    <main style={{ maxWidth: 700, margin: '80px auto', textAlign: 'center', padding: 24 }}>
      <h1>WhatsApp Bot</h1>
      <p>Personal session dashboard for testing WhatsApp bot flows.</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
        <a href="/login" style={{ background: '#25d366', color: '#fff', padding: '12px 18px', borderRadius: 8 }}>Login</a>
        <a href="/dashboard" style={{ background: '#111827', color: '#fff', padding: '12px 18px', borderRadius: 8 }}>Dashboard</a>
      </div>
    </main>
  );
}
