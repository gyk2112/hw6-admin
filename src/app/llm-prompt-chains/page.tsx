import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export default async function LLMPromptChainsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('llm_prompt_chains')
    .select('*')
    .limit(200)

  const rows = data ?? []
  const cols = rows.length > 0 ? Object.keys(rows[0]) : []

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-1">Admin</div>
        <h1 className="text-2xl text-white tracking-tight">LLM Prompt Chains</h1>
        <p className="text-xs text-[#555] mt-1">{rows.length} records</p>
      </div>

      {error && <p className="text-[10px] text-red-400">{error.message}</p>}

      {rows.length === 0 ? (
        <p className="text-xs text-[#444]">No prompt chains found.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((row: any, i) => (
            <div key={row.id ?? i} className="bg-[#0f0f0f] border border-[#1a1a1a] p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {row.name && <p className="text-sm text-white mb-1">{row.name}</p>}
                  {row.description && <p className="text-xs text-[#777]">{row.description}</p>}
                </div>
                {row.created_at && (
                  <span className="text-[10px] text-[#444] flex-shrink-0">
                    {new Date(row.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              {cols
                .filter((c) => !['id', 'name', 'description', 'created_at', 'updated_at'].includes(c))
                .map((col) => (
                  row[col] !== null && (
                    <div key={col}>
                      <div className="text-[9px] text-[#444] tracking-[0.2em] uppercase mb-1">{col}</div>
                      <pre className="text-xs text-[#888] whitespace-pre-wrap break-all bg-[#0a0a0a] p-3 border border-[#1a1a1a] max-h-40 overflow-y-auto">
                        {typeof row[col] === 'object' ? JSON.stringify(row[col], null, 2) : String(row[col])}
                      </pre>
                    </div>
                  )
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
