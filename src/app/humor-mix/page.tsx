'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function HumorMixPage() {
  const supabase = createClient()
  const [rows, setRows] = useState<any[]>([])
  const [cols, setCols] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('humor_flavor_mix')
      .select('*')
      .limit(200)
    if (error) setError(error.message)
    const fetched = data ?? []
    setRows(fetched)
    if (fetched.length > 0) setCols(Object.keys(fetched[0]))
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const editableCols = cols.filter(
    (c) => !['id', 'created_at', 'updated_at', 'profile_id'].includes(c)
  )

  const startEdit = (row: any) => {
    setEditingId(row.id)
    const form: Record<string, any> = {}
    editableCols.forEach((c) => { form[c] = row[c] })
    setEditForm(form)
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    const { error } = await supabase
      .from('humor_flavor_mix')
      .update(editForm)
      .eq('id', editingId)
    if (error) setError(error.message)
    else { setEditingId(null); fetchData() }
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-1">Admin</div>
        <h1 className="text-2xl text-white tracking-tight">Humor Mix</h1>
        <p className="text-xs text-[#555] mt-1">{rows.length} records</p>
      </div>

      {error && <p className="text-[10px] text-red-400">{error}</p>}

      {loading ? (
        <div className="text-[10px] text-[#444] tracking-widest uppercase">Loading...</div>
      ) : rows.length === 0 ? (
        <p className="text-xs text-[#444]">No humor mix records found.</p>
      ) : (
        <div className="space-y-px">
          {rows.map((row) => (
            <div key={row.id} className="bg-[#0f0f0f] border border-[#1a1a1a] p-4">
              {editingId === row.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {editableCols.map((col) => (
                      <div key={col}>
                        <label className="text-[10px] text-[#444] tracking-widest uppercase block mb-1">{col}</label>
                        {typeof row[col] === 'boolean' ? (
                          <input
                            type="checkbox"
                            checked={!!editForm[col]}
                            onChange={(e) => setEditForm({ ...editForm, [col]: e.target.checked })}
                            className="accent-white"
                          />
                        ) : (
                          <input
                            value={editForm[col] ?? ''}
                            onChange={(e) => setEditForm({ ...editForm, [col]: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-[#333] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#666]"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="text-[10px] tracking-widest uppercase border border-white px-3 py-1.5 text-white hover:bg-white hover:text-black transition-all disabled:opacity-30"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-[10px] tracking-widest uppercase text-[#555] hover:text-white px-3 py-1.5 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    {cols.map((col) => (
                      <div key={col}>
                        <span className="text-[9px] text-[#444] tracking-widest uppercase">{col}: </span>
                        <span className="text-xs text-[#aaa]">
                          {row[col] === null ? '—' :
                           typeof row[col] === 'boolean' ? (row[col] ? 'yes' : 'no') :
                           String(row[col]).length > 40 ? String(row[col]).slice(0, 40) + '…' : String(row[col])}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => startEdit(row)}
                    className="text-[10px] text-[#555] hover:text-white tracking-widest uppercase transition-colors flex-shrink-0"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
