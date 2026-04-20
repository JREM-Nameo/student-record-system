'use client'

// app/courses/page.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { PlusCircle, Pencil, Trash2, RefreshCw, BookOpen } from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'

export default function CoursesPage() {
  const [courses, setCourses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function fetchCourses() {
    setLoading(true)
    try {
      const res  = await fetch('/api/courses')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setCourses(json.data ?? [])
    } catch (err) {
      toast.error('Failed to load courses: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [])

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      const res  = await fetch(`/api/courses/${toDelete.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(`"${toDelete.code}" deleted.`)
      setToDelete(null)
      fetchCourses()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="text-slate-400 text-sm mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''} available</p>
        </div>
        <Link
          href="/courses/add"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          Add Course
        </Link>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-slate-800 border border-slate-700 rounded-full p-5 mb-4">
            <BookOpen className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">No courses yet</h3>
          <p className="text-slate-400 text-sm mb-5">Add your first course to get started.</p>
          <Link href="/courses/add" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition">
            Add Course
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {courses.map((course) => (
                <tr key={course.id} className="bg-slate-800 hover:bg-slate-700/50 transition group">
                  <td className="px-4 py-3">
                    <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-full">
                      {course.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{course.name}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(course.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/courses/${course.id}/edit`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setToDelete(course)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={!!toDelete}
        studentName={toDelete ? `course "${toDelete.code} — ${toDelete.name}"` : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  )
}