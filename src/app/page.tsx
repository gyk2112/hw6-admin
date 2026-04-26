import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalImages },
    { count: totalCaptions },
    { count: totalUsers },
    { count: totalPublicImages },
    { count: imagesWithNoContext },
    { data: topCaptioners },
    { data: recentImages },
  ] = await Promise.all([
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('*', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('images').select('*', { count: 'exact', head: true }).is('additional_context', null),
    supabase
      .from('captions')
      .select('profile_id, profiles!profile_id(email)')
      .limit(500),
    supabase
      .from('images')
      .select('id, url, created_datetime_utc, is_public')
      .order('created_datetime_utc', { ascending: false })
      .limit(5),
  ])

  // Compute top captioners from data
  const captionCounts: Record<string, { email: string; count: number }> = {}
  for (const c of topCaptioners ?? []) {
    const pid = c.profile_id as string
    const email = (c.profiles as any)?.email ?? pid
    if (!captionCounts[pid]) captionCounts[pid] = { email, count: 0 }
    captionCounts[pid].count++
  }
  const topUsers = Object.values(captionCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const stats = [
    { label: 'Total Images', value: totalImages?.toLocaleString() ?? '—' },
    { label: 'Total Captions', value: totalCaptions?.toLocaleString() ?? '—' },
    { label: 'Total Users', value: totalUsers?.toLocaleString() ?? '—' },
    { label: 'Public Images', value: totalPublicImages?.toLocaleString() ?? '—' },
    {
      label: 'Captions / Image',
      value:
        totalImages && totalCaptions
          ? (totalCaptions / totalImages).toFixed(1)
          : '—',
    },
    {
      label: 'Images Missing Context',
      value: imagesWithNoContext?.toLocaleString() ?? '—',
    },
  ]

  return (
    <div className="space-y-10">
      <div>
        <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-1">Overview</div>
        <h1 className="text-2xl text-white tracking-tight">Dashboard</h1>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-3 gap-px bg-[#1a1a1a]">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-[#0a0a0a] p-6">
            <div className="text-[10px] text-[#555] tracking-[0.2em] uppercase mb-2">{label}</div>
            <div className="text-3xl text-white tabular-nums">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Top captioners */}
        <div>
          <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-4">Top Captioners</div>
          <div className="space-y-px">
            {topUsers.map((u, i) => (
              <div key={u.email} className="flex items-center justify-between bg-[#111] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#444] w-4">{i + 1}</span>
                  <span className="text-xs text-[#aaa] truncate max-w-[180px]">{u.email}</span>
                </div>
                <span className="text-xs text-white tabular-nums">{u.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent images */}
        <div>
          <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-4">Recent Images</div>
          <div className="space-y-px">
            {(recentImages ?? []).map((img) => (
              <div key={img.id} className="flex items-center justify-between bg-[#111] px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={img.url}
                    alt=""
                    className="w-8 h-8 object-cover opacity-80"
                  />
                  <span className="text-[10px] text-[#555]">
                    {new Date(img.created_datetime_utc).toLocaleDateString()}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 ${img.is_public ? 'text-green-500' : 'text-[#555]'}`}>
                  {img.is_public ? 'public' : 'private'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
