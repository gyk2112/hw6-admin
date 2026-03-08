'use client'

import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-mono">
      <div className="w-full max-w-sm">
        <div className="border border-[#2a2a2a] p-8">
          <div className="mb-8">
            <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-2">Crackd</div>
            <h1 className="text-xl text-white tracking-tight">Admin Console</h1>
          </div>

          {error === 'not_superadmin' && (
            <div className="mb-6 border border-red-900 bg-red-950/30 p-3">
              <p className="text-red-400 text-xs">Access denied. Superadmin privileges required.</p>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full border border-[#333] hover:border-white hover:bg-white hover:text-black text-white text-xs tracking-widest uppercase py-3 px-4 transition-all duration-150"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
