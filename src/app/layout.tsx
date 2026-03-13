import type { Metadata } from 'next'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import NavSidebar from './NavSidebar'

export const metadata: Metadata = {
  title: 'Crackd Admin',
  description: 'Admin Console',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = !user

  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white font-mono antialiased">
        {isAuthPage ? (
          children
        ) : (
          <div className="flex min-h-screen">
            <NavSidebar userEmail={user?.email ?? ''} />
            <main className="flex-1 ml-52 p-8 min-h-screen">
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  )
}
