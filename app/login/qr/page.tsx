'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function QrLoginContent() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    const origin = window.location.origin

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (error) {
      alert(error.message)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Controlla la tua email</h1>
        <p>Ti abbiamo inviato un link per accedere e lasciare il tuo Positive.</p>
      </main>
    )
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Accedi per lasciare un Positive</h1>

      <p className="mb-4 text-sm text-gray-600">
        Inserisci la tua email. Ti invieremo un link di accesso rapido.
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          required
          placeholder="La tua email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-3"
        />

        <button
          type="submit"
          className="w-full rounded bg-black text-white p-3"
        >
          Ricevi Magic Link
        </button>
      </form>
    </main>
  )
}

export default function QrLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="p-6">
          <p>Caricamento...</p>
        </main>
      }
    >
      <QrLoginContent />
    </Suspense>
  )
}