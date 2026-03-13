'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Image = {
  id: string
  url: string
  additional_context: string | null
  is_public: boolean
  is_common_use: boolean
  created_datetime_utc: string
  image_description: string | null
}

export default function ImagesPage() {
  const supabase = createClient()
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Image>>({})
  const [uploading, setUploading] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newContext, setNewContext] = useState('')
  const [newIsPublic, setNewIsPublic] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all')
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchImages = async () => {
    setLoading(true)
    let query = supabase
      .from('images')
      .select('id, url, additional_context, is_public, is_common_use, created_datetime_utc, image_description')
      .order('created_datetime_utc', { ascending: false })
      .limit(100)

    if (filter === 'public') query = query.eq('is_public', true)
    if (filter === 'private') query = query.eq('is_public', false)

    const { data } = await query
    setImages(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchImages() }, [filter])

  const startEdit = (img: Image) => {
    setEditingId(img.id)
    setEditForm({
      additional_context: img.additional_context,
      is_public: img.is_public,
      is_common_use: img.is_common_use,
    })
  }

  const saveEdit = async () => {
    if (!editingId) return
    await supabase.from('images').update(editForm).eq('id', editingId)
    setEditingId(null)
    fetchImages()
  }

  const deleteImage = async (id: string) => {
    if (!confirm('Delete this image?')) return
    await supabase.from('images').delete().eq('id', id)
    fetchImages()
  }

  const createImageFromUrl = async () => {
    if (!newImageUrl.trim()) return
    setUploading(true)
    setUploadError(null)
    const { error } = await supabase.from('images').insert({
      url: newImageUrl.trim(),
      additional_context: newContext.trim() || null,
      is_public: newIsPublic,
      is_common_use: false,
    })
    if (error) setUploadError(error.message)
    else {
      setNewImageUrl('')
      setNewContext('')
      setNewIsPublic(false)
      setShowCreate(false)
      fetchImages()
    }
    setUploading(false)
  }

  const createImageFromFile = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)

    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filename, file, { upsert: false })

    if (uploadError) {
      setUploadError(`Storage error: ${uploadError.message}`)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filename)

    const { error: insertError } = await supabase.from('images').insert({
      url: publicUrl,
      additional_context: newContext.trim() || null,
      is_public: newIsPublic,
      is_common_use: false,
    })

    if (insertError) setUploadError(insertError.message)
    else {
      setNewContext('')
      setNewIsPublic(false)
      setShowCreate(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchImages()
    }
    setUploading(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase mb-1">Admin</div>
          <h1 className="text-2xl text-white tracking-tight">Images</h1>
          <p className="text-xs text-[#555] mt-1">{images.length} records (capped at 100)</p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); setUploadError(null) }}
          className="text-[10px] tracking-widest uppercase border border-[#333] hover:border-white px-4 py-2 text-[#aaa] hover:text-white transition-all"
        >
          {showCreate ? 'Cancel' : '+ New Image'}
        </button>
      </div>

      {showCreate && (
        <div className="border border-[#2a2a2a] p-6 space-y-4">
          <div className="text-[10px] text-[#444] tracking-[0.3em] uppercase">New Image</div>

          {/* Mode toggle */}
          <div className="flex gap-1">
            {(['url', 'file'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setUploadMode(m)}
                className={`text-[10px] tracking-widest uppercase px-3 py-1.5 transition-all ${
                  uploadMode === m ? 'bg-white text-black' : 'text-[#555] hover:text-white'
                }`}
              >
                {m === 'url' ? 'From URL' : 'Upload File'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {uploadMode === 'url' ? (
              <div>
                <label className="text-[10px] text-[#555] tracking-widest uppercase block mb-1">Image URL *</label>
                <input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#111] border border-[#222] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#555]"
                />
              </div>
            ) : (
              <div>
                <label className="text-[10px] text-[#555] tracking-widest uppercase block mb-1">Image File *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="w-full text-xs text-[#aaa] file:mr-3 file:py-1.5 file:px-3 file:border file:border-[#333] file:bg-transparent file:text-[10px] file:text-[#aaa] file:tracking-widest file:uppercase file:cursor-pointer"
                />
              </div>
            )}
            <div>
              <label className="text-[10px] text-[#555] tracking-widest uppercase block mb-1">Additional Context</label>
              <input
                value={newContext}
                onChange={(e) => setNewContext(e.target.value)}
                className="w-full bg-[#111] border border-[#222] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#555]"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newIsPublic}
                onChange={(e) => setNewIsPublic(e.target.checked)}
                className="accent-white"
              />
              <span className="text-[10px] text-[#555] tracking-widest uppercase">Public</span>
            </label>
            {uploadError && (
              <p className="text-[10px] text-red-400">{uploadError}</p>
            )}
            <button
              onClick={uploadMode === 'url' ? createImageFromUrl : createImageFromFile}
              disabled={uploading || (uploadMode === 'url' && !newImageUrl.trim())}
              className="text-[10px] tracking-widest uppercase border border-white px-4 py-2 text-white hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-1">
        {(['all', 'public', 'private'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[10px] tracking-widest uppercase px-3 py-1.5 transition-all ${
              filter === f ? 'bg-white text-black' : 'text-[#555] hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-[10px] text-[#444] tracking-widest uppercase">Loading...</div>
      ) : (
        <div className="space-y-px">
          {images.map((img) => (
            <div key={img.id} className="bg-[#0f0f0f] border border-[#1a1a1a] p-4">
              {editingId === img.id ? (
                <div className="flex gap-4">
                  <img
                    src={img.url}
                    alt=""
                    className="w-20 h-20 object-cover flex-shrink-0 opacity-60"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-[10px] text-[#444] tracking-widest uppercase block mb-1">Additional Context</label>
                      <input
                        value={editForm.additional_context ?? ''}
                        onChange={(e) => setEditForm({ ...editForm, additional_context: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-[#333] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#666]"
                      />
                    </div>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.is_public ?? false}
                          onChange={(e) => setEditForm({ ...editForm, is_public: e.target.checked })}
                          className="accent-white"
                        />
                        <span className="text-[10px] text-[#555] tracking-widest uppercase">Public</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.is_common_use ?? false}
                          onChange={(e) => setEditForm({ ...editForm, is_common_use: e.target.checked })}
                          className="accent-white"
                        />
                        <span className="text-[10px] text-[#555] tracking-widest uppercase">Common Use</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="text-[10px] tracking-widest uppercase border border-white px-3 py-1.5 text-white hover:bg-white hover:text-black transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-[10px] tracking-widest uppercase text-[#555] hover:text-white px-3 py-1.5 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 items-start">
                  <img
                    src={img.url}
                    alt=""
                    className="w-20 h-20 object-cover flex-shrink-0 opacity-80"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs text-[#777] truncate mb-1">{img.url}</p>
                        {img.additional_context && (
                          <p className="text-xs text-[#aaa] mb-1">{img.additional_context}</p>
                        )}
                        {img.image_description && (
                          <p className="text-[10px] text-[#555] line-clamp-2">{img.image_description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-[10px] tracking-widest uppercase ${img.is_public ? 'text-green-500' : 'text-[#444]'}`}>
                          {img.is_public ? 'public' : 'private'}
                        </span>
                        {img.is_common_use && (
                          <span className="text-[10px] tracking-widest uppercase text-blue-400">common</span>
                        )}
                        <span className="text-[10px] text-[#444]">
                          {new Date(img.created_datetime_utc).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => startEdit(img)}
                          className="text-[10px] text-[#555] hover:text-white tracking-widest uppercase transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteImage(img.id)}
                          className="text-[10px] text-[#555] hover:text-red-400 tracking-widest uppercase transition-colors"
                        >
                          Delete
                        </button>
                      </div>
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
