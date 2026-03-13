import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export default async function LLMResponsesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('llm_model_responses')
    .select('*')
    .limit(100)

  const rows = data ?? []
  const cols = rows.length > 0 ? Object.keys(rows[0]) : []

  // Separate preview cols (short) from content cols (long)
  const longCols = ['input', 'output', 'response', 'prompt', 'completion', 'content']
  const previewCols = cols.filter((c) => !longCols.includes(c))
  const bodyCols = cols.filter((c) => longCols.includes(c))

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-1">Admin</div>
        <h1 className="text-2xl text-white tracking-tight">LLM Responses</h1>
        <p className="text-xs text-[#555] mt-1">{rows.length} records (capped at 100)</p>
      </div>

      {error && <p className="text-[10px] text-red-400">{error.message}</p>}

      {rows.length === 0 ? (
        <p className="text-xs text-[#444]">No LLM responses found.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((row: any, i) => (
            <div key={row.id ?? i} className="bg-[#0f0f0f] border border-[#1a1a1a] p-4 space-y-3">
              {/* Metadata row */}
              <div className="flex flex-wrap gap-4">
                {previewCols.map((col) => (
                  row[col] !== null && (
                    <div key={col}>
                      <span className="text-[9px] text-[#444] tracking-widest uppercase">{col}: </span>
                      <span className="text-[10px] text-[#888]">
                        {typeof row[col] === 'boolean'
                          ? (row[col] ? 'yes' : 'no')
                          : String(row[col]).length > 50
                          ? String(row[col]).slice(0, 50) + '…'
                          : String(row[col])}
                      </span>
                    </div>
                  )
                ))}
              </div>
              {/* Body content */}
              {bodyCols.map((col) => (
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
