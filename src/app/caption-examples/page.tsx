'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type CaptionExample = {
  id: string
  image_id: string | null
  caption: string | null
  content: string | null
  humor_flavor_id: string | null
  is_approved: boolean | null
  created_at: string
  [key: string]: any
}

export default function CaptionExamplesPage() {
  const supabase = createClient()
  const [rows, setRows] = useState<CaptionExample[]>([])
  const [cols, setCols] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Record<string, any>>({})
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<Record<string, any>>({ caption: '', image_id: '', humor_flavor_id: '', is_approved: false })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('caption_examples')
      .select('*')
      .limit(200)
    if (error) setError(error.message)
    const fetched = data ?? []
    setRows(fetched)
    if (fetched.length > 0) setCols(Object.keys(fetched[0]))
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const editableCols = cols.filter((c) => !['id', 'created_at', 'updated_at'].includes(c))

  const startEdit = (row: CaptionExample) => {
    setEditingId(row.id)
    const form: Record<string, any> = {}
    editableCols.forEach((c) => { form[c] = row[c] })
    setEditForm(form)
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    const { error } = await supabase.from('caption_examples').update(editForm).eq('id', editingId)
    if (error) setError(error.message)
    else { setEditingId(null); fetchData() }
    setSaving(false)
  }

  const deleteRow = async (id: string) => {
    if (!confirm('Delete this caption example?')) return
    const { error } = await supabase.from('caption_examples').delete().eq('id', id)
    if (error) setError(error.message)
    else fetchData()
  }

  const createRow = async () => {
    setSaving(true)
    const payload: Record<string, any> = {}
    Object.entries(createForm).forEach(([k, v]) => {
      if (v !== '' && v !== null) payload[k] = v
    })
    const { error } = await supabase.from('caption_examples').insert(payload)
    if (error) setError(error.message)
    else { setShowCreate(false); setCreateForm({ caption: '', image_id: '', humor_flavor_id: '', is_approved: false }); fetchData() }
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-1">Admin</div>
          <h1 className="text-2xl text-white tracking-tight">Caption Examples</h1>
          <p className="text-xs text-[#555] mt-1">{rows.length} records</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-[10px] tracking-widest uppercase border border-[#333] hover:border-white px-4 py-2 text-[#aaa] hover:text-white transition-all"
        >
          {showCreate ? 'Cancel' : '+ New Example'}
        </button>
      </div>

      {error && <p className="text-[10px] text-red-400">{error}</p>}

      {showCreate && (
        <div className="border border-[#2a2a2a] p-6 space-y-4">
          <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase">New Caption Example</div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-[#555] tracking-widest uppercase block mb-1">Caption *</label>
              <textarea
                value={createForm.caption}
                onChange={(e) => setCreateForm({ ...createForm, caption: e.target.value })}
                rows={3}
                className="w-full bg-[#111] border border-[#222] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#555] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#555] tracking-widest uppercase block mb-1">Image ID</label>
                <input
                  value={createForm.image_id}
                  onChange={(e) => setCreateForm({ ...createForm, image_id: e.target.value })}
                  className="w-full bg-[#111] border border-[#222] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#555]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#555] tracking-widest uppercase block mb-1">Humor Flavor ID</label>
                <input
                  value={createForm.humor_flavor_id}
                  onChange={(e) => setCreateForm({ ...createForm, humor_flavor_id: e.target.value })}
                  className="w-full bg-[#111] border border-[#222] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#555]"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createForm.is_approved}
                onChange={(e) => setCreateForm({ ...createForm, is_approved: e.target.checked })}
                className="accent-white"
              />
              <span className="text-[10px] text-[#555] tracking-widest uppercase">Approved</span>
            </label>
            <button
              onClick={createRow}
              disabled={saving || !createForm.caption}
              className="text-[10px] tracking-widest uppercase border border-white px-4 py-2 text-white hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-[10px] text-[#444] tracking-widest uppercase">Loading...</div>
      ) : rows.length === 0 ? (
        <p className="text-xs text-[#444]">No caption examples found.</p>
      ) : (
        <div className="space-y-px">
          {rows.map((row) => (
            <div key={row.id} className="bg-[#0f0f0f] border border-[#1a1a1a] p-4">
              {editingId === row.id ? (
                <div className="space-y-3">
                  {editableCols.map((col) => (
                    <div key={col}>
                      <label className="text-[10px] text-[#444] tracking-widest uppercase block mb-1">{col}</label>
                      {typeof row[col] === 'boolean' || col === 'is_approved' ? (
                        <input
                          type="checkbox"
                          checked={!!editForm[col]}
                          onChange={(e) => setEditForm({ ...editForm, [col]: e.target.checked })}
                          className="accent-white"
                        />
                      ) : (
                        <textarea
                          value={editForm[col] ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, [col]: e.target.value })}
                          rows={col === 'caption' || col === 'content' ? 3 : 1}
                          className="w-full bg-[#0a0a0a] border border-[#333] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#666] resize-none"
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving} className="text-[10px] tracking-widest uppercase border border-white px-3 py-1.5 text-white hover:bg-white hover:text-black transition-all disabled:opacity-30">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-[10px] tracking-widest uppercase text-[#555] hover:text-white px-3 py-1.5 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm text-white leading-snug">
                      {row.caption ?? row.content ?? <span className="text-[#444]">—</span>}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      {row.image_id && <span className="text-[10px] text-[#555]">img: {String(row.image_id).slice(0, 8)}…</span>}
                      {row.humor_flavor_id && <span className="text-[10px] text-[#555]">flavor: {String(row.humor_flavor_id).slice(0, 8)}…</span>}
                      {row.is_approved !== null && (
                        <span className={`text-[10px] tracking-widest uppercase ${row.is_approved ? 'text-green-500' : 'text-[#555]'}`}>
                          {row.is_approved ? 'approved' : 'not approved'}
                        </span>
                      )}
                      <span className="text-[10px] text-[#444]">{new Date(row.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <button onClick={() => startEdit(row)} className="text-[10px] text-[#555] hover:text-white tracking-widest uppercase transition-colors">Edit</button>
                    <button onClick={() => deleteRow(row.id)} className="text-[10px] text-[#555] hover:text-red-400 tracking-widest uppercase transition-colors">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
