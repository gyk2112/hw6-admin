import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export default async function CaptionRequestsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('caption_requests')
    .select('*')
    .limit(200)

  const rows = data ?? []
  const cols = rows.length > 0 ? Object.keys(rows[0]) : []

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-1">Admin</div>
        <h1 className="text-2xl text-white tracking-tight">Caption Requests</h1>
        <p className="text-xs text-[#555] mt-1">{rows.length} records (capped at 200)</p>
      </div>

      {error && <p className="text-[10px] text-red-400">{error.message}</p>}

      {rows.length === 0 ? (
        <p className="text-xs text-[#444]">No caption requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                {cols.map((col) => (
                  <th key={col} className="text-left text-[10px] text-[#444] tracking-[0.2em] uppercase px-4 py-3 font-normal whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, i) => (
                <tr key={row.id ?? i} className="border-b border-[#111] hover:bg-[#111] transition-colors">
                  {cols.map((col) => (
                    <td key={col} className="px-4 py-3 text-[#aaa] max-w-xs truncate">
                      {row[col] === null ? (
                        <span className="text-[#333]">—</span>
                      ) : typeof row[col] === 'boolean' ? (
                        <span className={row[col] ? 'text-green-500' : 'text-[#444]'}>{row[col] ? 'yes' : 'no'}</span>
                      ) : col === 'status' ? (
                        <span className={`text-[10px] tracking-widest uppercase ${
                          row[col] === 'completed' ? 'text-green-500' :
                          row[col] === 'pending' ? 'text-yellow-500' :
                          row[col] === 'failed' ? 'text-red-400' : 'text-[#aaa]'
                        }`}>{row[col]}</span>
                      ) : (
                        <span className="truncate">{String(row[col])}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
