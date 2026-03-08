'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/images', label: 'Images' },
  { href: '/captions', label: 'Captions' },
  { href: '/users', label: 'Users' },
]

export default function NavSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-48 border-r border-[#1e1e1e] bg-[#0a0a0a] flex flex-col">
      <div className="p-5 border-b border-[#1e1e1e]">
        <div className="text-[9px] text-[#444] tracking-[0.3em] uppercase mb-1">Crackd</div>
        <div className="text-sm text-white tracking-tight">Admin</div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 text-xs tracking-widest uppercase transition-colors ${
                active
                  ? 'bg-white text-black'
                  : 'text-[#666] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#1e1e1e]">
        <div className="text-[10px] text-[#444] truncate mb-2">{userEmail}</div>
        <button
          onClick={handleSignOut}
          className="text-[10px] text-[#555] hover:text-red-400 tracking-widest uppercase transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
