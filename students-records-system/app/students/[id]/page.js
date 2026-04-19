'use client'

// app/students/[id]/page.js
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { computeGWA, getFullName } from '@/lib/helpers'
import StudentCard from '@/components/StudentCard'
import GradeDisplay from '@/components/GradeDisplay'
import ConfirmModal from '@/components/ConfirmModal'
import { RefreshCw, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function StudentProfilePage() {
  const { id }  = useParams()
  const router  = useRouter()

  const [student, setStudent]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [toDelete, setToDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState(null)

  useEffect(() => {
    async function fetchStudent() {
      try {
        const res  = await fetch(`/api/students/${id}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        const s = json.data
        s.gwa = computeGWA(s.grades ?? [])
        setStudent(s)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStudent()
  }, [id])

  async function handleDelete() {
    setDeleting(true)
    try {
      const res  = await fetch(`/api/students/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Student deleted.')
      router.push('/students')
      router.refresh()
    } catch (err) {
      toast.error(err.message)
      setDeleting(false)
      setToDelete(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
    </div>
  )

  if (error) return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-5 text-sm">
        Error: {error}
      </div>
    </div>
  )

  if (!student) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/students"
        className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition w-fit"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Students
      </Link>

      <StudentCard student={student} onDelete={() => setToDelete(true)} />
      <GradeDisplay grades={student.grades ?? []} gwa={student.gwa} />

      <ConfirmModal
        isOpen={toDelete}
        studentName={getFullName(student)}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(false)}
        loading={deleting}
      />
    </div>
  )
}