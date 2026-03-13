'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LLMModelsPage() {
  const supabase = createClient()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Record<string, any>>({})
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', model_slug: '', provider_id: '', is_active: true, max_tokens: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('llm_models')
      .select('*')
      .limit(200)
    if (error) setError(error.message)
    setRows(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const startEdit = (row: any) => {
    setEditingId(row.id)
    setEditForm({
      name: row.name,
      model_slug: row.model_slug,
      provider_id: row.provider_id,
      is_active: row.is_active,
      max_tokens: row.max_tokens,
    })
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    const payload = { ...editForm }
    if (payload.max_tokens !== '' && payload.max_tokens !== null) payload.max_tokens = Number(payload.max_tokens)
    const { error } = await supabase.from('llm_models').update(payload).eq('id', editingId)
    if (error) setError(error.message)
    else { setEditingId(null); fetchData() }
    setSaving(false)
  }

  const deleteRow = async (id: string) => {
    if (!confirm('Delete this model?')) return
    const { error } = await supabase.from('llm_models').delete().eq('id', id)
    if (error) setError(error.message)
    else fetchData()
  }

  const createRow = async () => {
    setSaving(true)
    const payload: Record<string, any> = { name: createForm.name, is_active: createForm.is_active }
    if (createForm.model_slug) payload.model_slug = createForm.model_slug
    if (createForm.provider_id) payload.provider_id = createForm.provider_id
    if (createForm.max_tokens) payload.max_tokens = Number(createForm.max_tokens)
    const { error } = await supabase.from('llm_models').insert(payload)
    if (error) setError(error.message)
    else { setShowCreate(false); setCreateForm({ name: '', model_slug: '', provider_id: '', is_active: true, max_tokens: '' }); fetchData() }
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-1">Admin</div>
          <h1 className="text-2xl text-white tracking-tight">LLM Models</h1>
          <p className="text-xs text-[#555] mt-1">{rows.length} records</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="text-[10px] tracking-widest uppercase border border-[#333] hover:border-white px-4 py-2 text-[#aaa] hover:text-white transition-all">
          {showCreate ? 'Cancel' : '+ New Model'}
        </button>
      </div>

      {error && <p className="text-[10px] text-red-400">{error}</p>}

      {showCreate && (
        <div className="border border-[#2a2a2a] p-6 space-y-4">
          <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase">New Model</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#555] tracking-widest uppercase block mb-1">Display Name *</label>
              <input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full bg-[#111] border border-[#222] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#555]" />
            </div>
            <div>
              <label className="text-[10px] text-[#555] tracking-widest uppercase block mb-1">Model Slug</label>
              <input value={createForm.model_slug} onChange={(e) => setCreateForm({ ...createForm, model_slug: e.target.value })}
                placeholder="gpt-4o"
                className="w-full bg-[#111] border border-[#222] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#555]" />
            </div>
            <div>
              <label className="text-[10px] text-[#555] tracking-widest uppercase block mb-1">Provider ID</label>
              <input value={createForm.provider_id} onChange={(e) => setCreateForm({ ...createForm, provider_id: e.target.value })}
                className="w-full bg-[#111] border border-[#222] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#555]" />
            </div>
            <div>
              <label className="text-[10px] text-[#555] tracking-widest uppercase block mb-1">Max Tokens</label>
              <input type="number" value={createForm.max_tokens} onChange={(e) => setCreateForm({ ...createForm, max_tokens: e.target.value })}
                className="w-full bg-[#111] border border-[#222] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#555]" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={createForm.is_active} onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })} className="accent-white" />
            <span className="text-[10px] text-[#555] tracking-widest uppercase">Active</span>
          </label>
          <button onClick={createRow} disabled={saving || !createForm.name}
            className="text-[10px] tracking-widest uppercase border border-white px-4 py-2 text-white hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            {saving ? 'Saving...' : 'Create'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-[10px] text-[#444] tracking-widest uppercase">Loading...</div>
      ) : rows.length === 0 ? (
        <p className="text-xs text-[#444]">No LLM models found.</p>
      ) : (
        <div className="space-y-px">
          {rows.map((row) => (
            <div key={row.id} className="bg-[#0f0f0f] border border-[#1a1a1a] p-4">
              {editingId === row.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'name', label: 'Display Name' },
                      { key: 'model_slug', label: 'Model Slug' },
                      { key: 'provider_id', label: 'Provider ID' },
                      { key: 'max_tokens', label: 'Max Tokens', type: 'number' },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label className="text-[10px] text-[#444] tracking-widest uppercase block mb-1">{label}</label>
                        <input type={type ?? 'text'} value={editForm[key] ?? ''} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                          className="w-full bg-[#0a0a0a] border border-[#333] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#666]" />
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })} className="accent-white" />
                    <span className="text-[10px] text-[#555] tracking-widest uppercase">Active</span>
                  </label>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving} className="text-[10px] tracking-widest uppercase border border-white px-3 py-1.5 text-white hover:bg-white hover:text-black transition-all disabled:opacity-30">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-[10px] tracking-widest uppercase text-[#555] hover:text-white px-3 py-1.5 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <span className="text-sm text-white">{row.name}</span>
                    {row.model_slug && <span className="text-xs text-[#777] font-mono">{row.model_slug}</span>}
                    {row.max_tokens && <span className="text-[10px] text-[#555]">{row.max_tokens} tokens</span>}
                    <span className={`text-[10px] tracking-widest uppercase ${row.is_active ? 'text-green-500' : 'text-[#444]'}`}>
                      {row.is_active ? 'active' : 'inactive'}
                    </span>
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
