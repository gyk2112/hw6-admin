'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navSections = [
  {
    label: 'Overview',
    items: [
      { href: '/', label: 'Dashboard' },
      { href: '/users', label: 'Users' },
      { href: '/images', label: 'Images' },
    ],
  },
  {
    label: 'Captions',
    items: [
      { href: '/captions', label: 'Captions' },
      { href: '/caption-requests', label: 'Caption Requests' },
      { href: '/caption-examples', label: 'Caption Examples' },
    ],
  },
  {
    label: 'Humor',
    items: [
      { href: '/humor-flavors', label: 'Humor Flavors' },
      { href: '/humor-flavor-steps', label: 'Flavor Steps' },
      { href: '/humor-mix', label: 'Humor Mix' },
    ],
  },
  {
    label: 'LLM',
    items: [
      { href: '/llm-providers', label: 'Providers' },
      { href: '/llm-models', label: 'Models' },
      { href: '/llm-prompt-chains', label: 'Prompt Chains' },
      { href: '/llm-responses', label: 'Responses' },
    ],
  },
  {
    label: 'Config',
    items: [
      { href: '/terms', label: 'Terms' },
      { href: '/allowed-signup-domains', label: 'Signup Domains' },
      { href: '/whitelisted-emails', label: 'Whitelisted Emails' },
    ],
  },
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
    <aside className="fixed left-0 top-0 h-screen w-52 border-r border-[#1e1e1e] bg-[#0a0a0a] flex flex-col overflow-y-auto">
      <div className="p-5 border-b border-[#1e1e1e]">
        <div className="text-[9px] text-[#444] tracking-[0.3em] uppercase mb-1">Crackd</div>
        <div className="text-sm text-white tracking-tight">Admin</div>
      </div>

      <nav className="flex-1 p-3 space-y-4">
        {navSections.map(({ label, items }) => (
          <div key={label}>
            <div className="text-[9px] text-[#333] tracking-[0.25em] uppercase px-3 mb-1">{label}</div>
            <div className="space-y-0.5">
              {items.map(({ href, label: itemLabel }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`block px-3 py-1.5 text-xs tracking-widest uppercase transition-colors ${
                      active
                        ? 'bg-white text-black'
                        : 'text-[#666] hover:text-white hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {itemLabel}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
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
