import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, is_superadmin, is_in_study, created_datetime_utc')
    .order('created_datetime_utc', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-1">Admin</div>
        <h1 className="text-2xl text-white tracking-tight">Users</h1>
        <p className="text-xs text-[#555] mt-1">{profiles?.length ?? 0} records (capped at 200)</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              {['Email', 'Name', 'Superadmin', 'In Study', 'Joined'].map((h) => (
                <th key={h} className="text-left text-[10px] text-[#444] tracking-[0.2em] uppercase px-4 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="border-b border-[#111] hover:bg-[#111] transition-colors">
                <td className="px-4 py-3 text-[#ccc]">{p.email ?? '—'}</td>
                <td className="px-4 py-3 text-[#777]">
                  {[p.first_name, p.last_name].filter(Boolean).join(' ') || '—'}
                </td>
                <td className="px-4 py-3">
                  {p.is_superadmin ? (
                    <span className="text-yellow-500 text-[10px] tracking-widest uppercase">yes</span>
                  ) : (
                    <span className="text-[#333] text-[10px]">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.is_in_study ? (
                    <span className="text-green-500 text-[10px] tracking-widest uppercase">yes</span>
                  ) : (
                    <span className="text-[#333] text-[10px]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#555]">
                  {p.created_datetime_utc
                    ? new Date(p.created_datetime_utc).toLocaleDateString()
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
