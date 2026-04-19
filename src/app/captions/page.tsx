import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export default async function CaptionsPage() {
  const supabase = await createClient()

  const [{ data: topCaptions }, { data: bottomCaptions }, { data: allLikes }] = await Promise.all([
    supabase
      .from('captions')
      .select('id, content, like_count, profile_id, image_id, profiles(email), images(url)')
      .order('like_count', { ascending: false })
      .limit(5),
    supabase
      .from('captions')
      .select('id, content, like_count, profile_id, image_id, profiles(email), images(url)')
      .order('like_count', { ascending: true })
      .limit(5),
    supabase.from('captions').select('like_count'),
  ])

  const likeCounts = (allLikes ?? []).map((r) => r.like_count ?? 0)
  const totalCaptions = likeCounts.length
  const totalLikes = likeCounts.reduce((s, n) => s + n, 0)
  const avgLikes = totalCaptions > 0 ? totalLikes / totalCaptions : 0
  const maxLikes = totalCaptions > 0 ? Math.max(...likeCounts) : 0
  const ratedCount = likeCounts.filter((n) => n > 0).length
  const unratedCount = totalCaptions - ratedCount

  const ratingStats = [
    { label: 'Total Captions', value: totalCaptions.toLocaleString() },
    { label: 'Total Likes', value: totalLikes.toLocaleString() },
    { label: 'Avg Likes / Caption', value: avgLikes.toFixed(2) },
    { label: 'Max Likes', value: maxLikes.toLocaleString() },
    { label: 'Rated', value: ratedCount.toLocaleString() },
    { label: 'Unrated', value: unratedCount.toLocaleString() },
  ]

  const CaptionCard = ({
    caption,
    rank,
    sentiment,
  }: {
    caption: any
    rank: number
    sentiment: 'positive' | 'negative'
  }) => (
    <div className="flex gap-4 bg-[#111] p-4 border border-[#1a1a1a]">
      <div className="text-[10px] text-[#333] w-4 pt-1 tabular-nums">{rank}</div>
      {caption.images?.url && (
        <img
          src={caption.images.url}
          alt=""
          className="w-16 h-16 object-cover flex-shrink-0 opacity-80"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white leading-snug mb-2">{caption.content}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#555] truncate">{caption.profiles?.email ?? '—'}</span>
          <span className={`text-sm font-bold tabular-nums ${sentiment === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
            {sentiment === 'positive' ? '+' : ''}{caption.like_count ?? 0}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-10">
      <div>
        <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-1">Admin</div>
        <h1 className="text-2xl text-white tracking-tight">Captions</h1>
      </div>

      {/* Rating stats grid */}
      <div>
        <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-3">Rating Statistics</div>
        <div className="grid grid-cols-3 gap-px bg-[#1a1a1a]">
          {ratingStats.map(({ label, value }) => (
            <div key={label} className="bg-[#0a0a0a] p-6">
              <div className="text-[10px] text-[#555] tracking-[0.2em] uppercase mb-2">{label}</div>
              <div className="text-3xl text-white tabular-nums">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <div className="text-[10px] text-green-600 tracking-[0.3em] uppercase mb-4">Top 5 — Most Liked</div>
          <div className="space-y-px">
            {(topCaptions ?? []).map((c, i) => (
              <CaptionCard key={c.id} caption={c} rank={i + 1} sentiment="positive" />
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-red-600 tracking-[0.3em] uppercase mb-4">Bottom 5 — Most Disliked</div>
          <div className="space-y-px">
            {(bottomCaptions ?? []).map((c, i) => (
              <CaptionCard key={c.id} caption={c} rank={i + 1} sentiment="negative" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
