'use client'

// app/students/page.js
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { attachGWA, getFullName } from '@/lib/helpers'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import StudentTable from '@/components/StudentTable'
import ConfirmModal from '@/components/ConfirmModal'
import { PlusCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [courses, setCourses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filters, setFilters]   = useState({ course: 'All', yearLevel: 'All', status: 'All' })
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch courses for the filter bar
  useEffect(() => {
    async function fetchCourses() {
      try {
        const res  = await fetch('/api/courses')
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setCourses(json.data ?? [])
      } catch (err) {
        toast.error('Could not load courses: ' + err.message)
      }
    }
    fetchCourses()
  }, [])

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        course:    filters.course,
        yearLevel: filters.yearLevel,
        status:    filters.status,
      })
      const res  = await fetch(`/api/students?${params}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setStudents(attachGWA(json.data ?? []))
    } catch (err) {
      toast.error('Failed to load students: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [search, filters])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      const res  = await fetch(`/api/students/${toDelete.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(`${getFullName(toDelete)} deleted.`)
      setToDelete(null)
      fetchStudents()
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
          <h1 className="text-2xl font-bold text-white">Students</h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? 'Loading...' : `${students.length} student${students.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <Link
          href="/students/add"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          Add Student
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
        <SearchBar value={search} onChange={setSearch} />
        <FilterBar courses={courses} filters={filters} onChange={setFilters} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      ) : (
        <StudentTable students={students} onDelete={setToDelete} />
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!toDelete}
        studentName={toDelete ? getFullName(toDelete) : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  )
}