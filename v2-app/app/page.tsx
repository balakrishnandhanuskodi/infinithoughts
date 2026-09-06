export default function Home() {
  return (
    <main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Welcome to Infinithoughts</h1>
      <p>A Next.js + Supabase magazine platform</p>

      <div style={{ marginTop: '40px' }}>
        <h2>Quick Links</h2>
        <ul>
          <li><a href="/test-connection">Test Database Connection</a></li>
        </ul>
      </div>
    </main>
  )
}
