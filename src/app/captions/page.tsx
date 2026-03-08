import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export default async function CaptionsPage() {
  const supabase = await createClient()

  const [{ data: topCaptions }, { data: bottomCaptions }] = await Promise.all([
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
  ])

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
