'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const SKIP_COLS = ['id', 'created_at', 'updated_at', 'created_datetime_utc', 'updated_datetime_utc']
const LONG_COLS = ['content', 'body', 'text', 'description', 'html', 'markdown']

export default function TermsPage() {
  const supabase = createClient()
  const [rows, setRows] = useState<any[]>([])
  const [cols, setCols] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Record<string, any>>({})
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('terms').select('*').limit(100)
    if (error) setError(error.message)
    const fetched = data ?? []
    setRows(fetched)
    if (fetched.length > 0) {
      const allCols = Object.keys(fetched[0])
      setCols(allCols)
      const editableCols = allCols.filter((c) => !SKIP_COLS.includes(c))
      const blank: Record<string, any> = {}
      editableCols.forEach((c) => { blank[c] = typeof fetched[0][c] === 'boolean' ? false : '' })
      setCreateForm(blank)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const editableCols = cols.filter((c) => !SKIP_COLS.includes(c))

  const startEdit = (row: any) => {
    setEditingId(row.id)
    const form: Record<string, any> = {}
    editableCols.forEach((c) => { form[c] = row[c] })
    setEditForm(form)
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    const { error } = await supabase.from('terms').update(editForm).eq('id', editingId)
    if (error) setError(error.message)
    else { setEditingId(null); fetchData() }
    setSaving(false)
  }

  const deleteRow = async (id: string) => {
    if (!confirm('Delete this term?')) return
    const { error } = await supabase.from('terms').delete().eq('id', id)
    if (error) setError(error.message)
    else fetchData()
  }

  const createRow = async () => {
    setSaving(true)
    const payload: Record<string, any> = {}
    Object.entries(createForm).forEach(([k, v]) => { if (v !== '' && v !== null) payload[k] = v })
    const { error } = await supabase.from('terms').insert(payload)
    if (error) setError(error.message)
    else { setShowCreate(false); fetchData() }
    setSaving(false)
  }

  const renderField = (col: string, value: any, onChange: (v: any) => void) => {
    if (typeof value === 'boolean') {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="accent-white" />
          <span className="text-[10px] text-[#555] tracking-widest uppercase">{col}</span>
        </label>
      )
    }
    if (LONG_COLS.includes(col)) {
      return (
        <div>
          <label className="text-[10px] text-[#444] tracking-widest uppercase block mb-1">{col}</label>
          <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={5}
            className="w-full bg-[#0a0a0a] border border-[#333] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#666] resize-none" />
        </div>
      )
    }
    return (
      <div>
        <label className="text-[10px] text-[#444] tracking-widest uppercase block mb-1">{col}</label>
        <input value={value ?? ''} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-[#333] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#666]" />
      </div>
    )
  }

  // Pick the best "title-like" column for the row summary
  const titleCol = editableCols.find((c) => ['title', 'name', 'term', 'label', 'heading'].includes(c))

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-1">Admin</div>
          <h1 className="text-2xl text-white tracking-tight">Terms</h1>
          <p className="text-xs text-[#555] mt-1">{rows.length} records</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="text-[10px] tracking-widest uppercase border border-[#333] hover:border-white px-4 py-2 text-[#aaa] hover:text-white transition-all">
          {showCreate ? 'Cancel' : '+ New Term'}
        </button>
      </div>

      {error && <p className="text-[10px] text-red-400">{error}</p>}

      {showCreate && cols.length > 0 && (
        <div className="border border-[#2a2a2a] p-6 space-y-4">
          <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase">New Term</div>
          <div className="space-y-3">
            {editableCols.map((col) => (
              <div key={col}>
                {renderField(col, createForm[col], (v) => setCreateForm({ ...createForm, [col]: v }))}
              </div>
            ))}
            <button onClick={createRow} disabled={saving}
              className="text-[10px] tracking-widest uppercase border border-white px-4 py-2 text-white hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              {saving ? 'Saving...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-[10px] text-[#444] tracking-widest uppercase">Loading...</div>
      ) : rows.length === 0 ? (
        <p className="text-xs text-[#444]">No terms found.</p>
      ) : (
        <div className="space-y-px">
          {rows.map((row) => (
            <div key={row.id} className="bg-[#0f0f0f] border border-[#1a1a1a] p-4">
              {editingId === row.id ? (
                <div className="space-y-3">
                  {editableCols.map((col) => (
                    <div key={col}>
                      {renderField(col, editForm[col], (v) => setEditForm({ ...editForm, [col]: v }))}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving} className="text-[10px] tracking-widest uppercase border border-white px-3 py-1.5 text-white hover:bg-white hover:text-black transition-all disabled:opacity-30">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-[10px] tracking-widest uppercase text-[#555] hover:text-white px-3 py-1.5 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Show all editable cols as key: value */}
                      {editableCols.map((col) => (
                        row[col] !== null && row[col] !== undefined && row[col] !== '' && (
                          <div key={col} className={LONG_COLS.includes(col) ? 'mt-1' : 'inline-block mr-4'}>
                            <span className="text-[9px] text-[#444] tracking-widest uppercase">{col}: </span>
                            {typeof row[col] === 'boolean' ? (
                              <span className={`text-[10px] tracking-widest uppercase ${row[col] ? 'text-green-500' : 'text-[#555]'}`}>
                                {row[col] ? 'yes' : 'no'}
                              </span>
                            ) : LONG_COLS.includes(col) ? (
                              <p className="text-xs text-[#777] line-clamp-2 mt-0.5">{String(row[col])}</p>
                            ) : (
                              <span className="text-xs text-white">{String(row[col])}</span>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                      <button onClick={() => startEdit(row)} className="text-[10px] text-[#555] hover:text-white tracking-widest uppercase transition-colors">Edit</button>
                      <button onClick={() => deleteRow(row.id)} className="text-[10px] text-[#555] hover:text-red-400 tracking-widest uppercase transition-colors">Delete</button>
                    </div>
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
