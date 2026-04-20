'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ChevronLeft, Loader2, RefreshCw } from 'lucide-react'

export default function EditSubjectPage() {
  const { id } = useParams()
  const router = useRouter()

  const [form, setForm]         = useState({ code: '', name: '', units: '3' })
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    async function fetchSubject() {
      try {
        const res  = await fetch(`/api/subjects/${id}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setForm({
          code:  json.data.code,
          name:  json.data.name,
          units: String(json.data.units),
        })
      } catch (err) {
        setFetchError(err.message)
      } finally {
        setFetching(false)
      }
    }
    fetchSubject()
  }, [id])

  function validate() {
    const e = {}
    if (!form.code.trim()) e.code = 'Subject code is required.'
    if (!form.name.trim()) e.name = 'Subject name is required.'
    if (!form.units || isNaN(form.units) || parseInt(form.units) < 1 || parseInt(form.units) > 6)
      e.units = 'Units must be between 1 and 6.'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setLoading(true)
    try {
      const res  = await fetch(`/api/subjects/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, units: parseInt(form.units) }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Subject updated!')
      router.push('/subjects')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="flex items-center justify-center py-32">
      <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
    </div>
  )

  if (fetchError) return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">
        Failed to load subject: {fetchError}
      </div>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Link href="/subjects" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition mb-4 w-fit">
          <ChevronLeft className="w-4 h-4" /> Back to Subjects
        </Link>
        <h1 className="text-2xl font-bold text-white">Edit Subject</h1>
        <p className="text-slate-400 text-sm mt-1">Update subject information.</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">
        <Field label="Subject Code" error={errors.code} required>
          <input
            value={form.code}
            onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
            placeholder="e.g. MATH101"
            className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </Field>

        <Field label="Subject Name" error={errors.name} required>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Mathematics"
            className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </Field>

        <Field label="Units" error={errors.units} required>
          <input
            type="number"
            min="1"
            max="6"
            value={form.units}
            onChange={(e) => setForm((p) => ({ ...p, units: e.target.value }))}
            className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </Field>

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={() => router.back()}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}