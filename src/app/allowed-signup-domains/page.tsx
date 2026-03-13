'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AllowedSignupDomainsPage() {
  const supabase = createClient()
  const [rows, setRows] = useState<any[]>([])
  const [cols, setCols] = useState<string[]>([])
  const [valueCol, setValueCol] = useState<string>('domain') // detected main column
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newValue, setNewValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('allowed_signup_domains')
      .select('*')
      .limit(200)
    if (error) setError(error.message)
    const fetched = data ?? []
    setRows(fetched)
    if (fetched.length > 0) {
      const allCols = Object.keys(fetched[0])
      setCols(allCols)
      // Detect the main value column: prefer known names, else first non-id string column
      const known = ['domain', 'name', 'email_domain', 'value']
      const detected = known.find((k) => allCols.includes(k))
        ?? allCols.find((c) => c !== 'id' && typeof fetched[0][c] === 'string' && !c.includes('_at') && !c.includes('datetime'))
        ?? allCols.find((c) => c !== 'id')
        ?? 'domain'
      setValueCol(detected)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    const { error } = await supabase
      .from('allowed_signup_domains')
      .update({ [valueCol]: editValue.trim() })
      .eq('id', editingId)
    if (error) setError(error.message)
    else { setEditingId(null); fetchData() }
    setSaving(false)
  }

  const deleteRow = async (id: string) => {
    if (!confirm('Remove this domain?')) return
    const { error } = await supabase.from('allowed_signup_domains').delete().eq('id', id)
    if (error) setError(error.message)
    else fetchData()
  }

  const createRow = async () => {
    if (!newValue.trim()) return
    setSaving(true)
    const { error } = await supabase.from('allowed_signup_domains').insert({ [valueCol]: newValue.trim() })
    if (error) setError(error.message)
    else { setShowCreate(false); setNewValue(''); fetchData() }
    setSaving(false)
  }

  // Extra display cols (besides the main value col and id)
  const extraCols = cols.filter((c) => c !== 'id' && c !== valueCol)

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-1">Admin</div>
          <h1 className="text-2xl text-white tracking-tight">Allowed Signup Domains</h1>
          <p className="text-xs text-[#555] mt-1">{rows.length} domains</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="text-[10px] tracking-widest uppercase border border-[#333] hover:border-white px-4 py-2 text-[#aaa] hover:text-white transition-all">
          {showCreate ? 'Cancel' : '+ Add Domain'}
        </button>
      </div>

      {error && <p className="text-[10px] text-red-400">{error}</p>}

      {showCreate && (
        <div className="border border-[#2a2a2a] p-6 space-y-3">
          <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase">New Domain</div>
          <div className="flex gap-3">
            <input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="example.com"
              onKeyDown={(e) => { if (e.key === 'Enter') createRow() }}
              className="flex-1 bg-[#111] border border-[#222] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#555]"
            />
            <button onClick={createRow} disabled={saving || !newValue.trim()}
              className="text-[10px] tracking-widest uppercase border border-white px-4 py-2 text-white hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-[10px] text-[#444] tracking-widest uppercase">Loading...</div>
      ) : rows.length === 0 ? (
        <p className="text-xs text-[#444]">No allowed signup domains configured.</p>
      ) : (
        <div className="space-y-px">
          {rows.map((row) => (
            <div key={row.id} className="bg-[#0f0f0f] border border-[#1a1a1a] px-4 py-3 flex items-center justify-between gap-4">
              {editingId === row.id ? (
                <>
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                    className="flex-1 bg-[#0a0a0a] border border-[#333] text-white text-xs px-3 py-1.5 focus:outline-none focus:border-[#666]"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving} className="text-[10px] tracking-widest uppercase border border-white px-3 py-1 text-white hover:bg-white hover:text-black transition-all disabled:opacity-30">
                      {saving ? '...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-[10px] tracking-widest uppercase text-[#555] hover:text-white transition-colors">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-6 min-w-0">
                    <span className="text-sm text-white font-mono">{row[valueCol]}</span>
                    {extraCols.map((c) => row[c] !== null && (
                      <span key={c} className="text-[10px] text-[#555]">
                        {c.includes('_at') || c.includes('datetime')
                          ? new Date(row[c]).toLocaleDateString()
                          : typeof row[c] === 'boolean'
                            ? <span className={row[c] ? 'text-green-500' : 'text-[#444]'}>{row[c] ? 'yes' : 'no'}</span>
                            : String(row[c])}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <button onClick={() => { setEditingId(row.id); setEditValue(row[valueCol] ?? '') }} className="text-[10px] text-[#555] hover:text-white tracking-widest uppercase transition-colors">Edit</button>
                    <button onClick={() => deleteRow(row.id)} className="text-[10px] text-[#555] hover:text-red-400 tracking-widest uppercase transition-colors">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
