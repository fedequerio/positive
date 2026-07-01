'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient()
      const next = searchParams.get('next') || '/'
      const code = searchParams.get('code')

      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }

      router.replace(next)
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <main className="p-6">
      <p>Accesso in corso...</p>
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="p-6">
          <p>Accesso in corso...</p>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}