'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WhitelistedEmailsPage() {
  const supabase = createClient()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editEmail, setEditEmail] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Try common table names
  const TABLE = 'whitelist_email_addresses'

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .limit(500)
    if (error) setError(error.message)
    setRows(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    const { error } = await supabase.from(TABLE).update({ email: editEmail.trim() }).eq('id', editingId)
    if (error) setError(error.message)
    else { setEditingId(null); fetchData() }
    setSaving(false)
  }

  const deleteRow = async (id: string) => {
    if (!confirm('Remove this email?')) return
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) setError(error.message)
    else fetchData()
  }

  const createRow = async () => {
    if (!newEmail.trim()) return
    setSaving(true)
    const { error } = await supabase.from(TABLE).insert({ email: newEmail.trim() })
    if (error) setError(error.message)
    else { setShowCreate(false); setNewEmail(''); fetchData() }
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-1">Admin</div>
          <h1 className="text-2xl text-white tracking-tight">Whitelisted Emails</h1>
          <p className="text-xs text-[#555] mt-1">{rows.length} emails</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="text-[10px] tracking-widest uppercase border border-[#333] hover:border-white px-4 py-2 text-[#aaa] hover:text-white transition-all">
          {showCreate ? 'Cancel' : '+ Add Email'}
        </button>
      </div>

      {error && <p className="text-[10px] text-red-400">{error}</p>}

      {showCreate && (
        <div className="border border-[#2a2a2a] p-6 space-y-3">
          <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase">New Whitelisted Email</div>
          <div className="flex gap-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="user@example.com"
              onKeyDown={(e) => { if (e.key === 'Enter') createRow() }}
              className="flex-1 bg-[#111] border border-[#222] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#555]"
            />
            <button onClick={createRow} disabled={saving || !newEmail.trim()}
              className="text-[10px] tracking-widest uppercase border border-white px-4 py-2 text-white hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-[10px] text-[#444] tracking-widest uppercase">Loading...</div>
      ) : rows.length === 0 ? (
        <p className="text-xs text-[#444]">No whitelisted emails found.</p>
      ) : (
        <div className="space-y-px">
          {rows.map((row) => (
            <div key={row.id} className="bg-[#0f0f0f] border border-[#1a1a1a] px-4 py-3 flex items-center justify-between gap-4">
              {editingId === row.id ? (
                <>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
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
                  <span className="text-sm text-white">{row.email}</span>
                  <div className="flex items-center gap-4">
                    {row.created_at && <span className="text-[10px] text-[#444]">{new Date(row.created_at).toLocaleDateString()}</span>}
                    <button onClick={() => { setEditingId(row.id); setEditEmail(row.email) }} className="text-[10px] text-[#555] hover:text-white tracking-widest uppercase transition-colors">Edit</button>
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
