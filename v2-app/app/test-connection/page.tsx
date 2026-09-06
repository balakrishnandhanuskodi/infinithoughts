'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestConnection() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    try {
      setLoading(true)
      setResult('Testing connection...')

      const supabase = createClient()

      // Try to fetch from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      if (error) {
        setResult(`❌ Error: ${error.message}`)
      } else {
        setResult(`✅ Success! Database connection working!\n\nProfiles table: ${data?.length || 0} records`)
      }
    } catch (err: any) {
      setResult(`❌ Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🧪 Supabase Connection Test</h1>

      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <button
          onClick={handleTest}
          disabled={loading}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {result && (
        <div
          style={{
            padding: '16px',
            backgroundColor: result.includes('✅') ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${result.includes('✅') ? '#86efac' : '#fca5a5'}`,
            borderRadius: '6px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '14px',
            color: result.includes('✅') ? '#166534' : '#991b1b',
          }}
        >
          {result}
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
        <h3>Setup Status:</h3>
        <ul>
          <li>✅ .env.local created</li>
          <li>✅ Packages installed</li>
          <li>✅ Database schema created</li>
          <li>✅ Storage buckets created</li>
          <li>⏳ Testing connection...</li>
        </ul>
      </div>
    </div>
  )
}
