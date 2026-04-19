'use client'

// app/students/[id]/edit/page.js
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import StudentForm from '@/components/StudentForm'
import Link from 'next/link'
import { ChevronLeft, RefreshCw } from 'lucide-react'
import { getFullName } from '@/lib/helpers'

export default function EditStudentPage() {
  const { id } = useParams()

  const [student, setStudent]   = useState(null)
  const [courses, setCourses]   = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    async function fetchAllData() {
      try {
        const [studentRes, coursesRes, subjectsRes] = await Promise.all([
          fetch(`/api/students/${id}`),
          fetch('/api/courses'),
          fetch('/api/subjects'),
        ])
        const [studentJson, coursesJson, subjectsJson] = await Promise.all([
          studentRes.json(),
          coursesRes.json(),
          subjectsRes.json(),
        ])
        if (!studentRes.ok)  throw new Error(studentJson.error)
        if (!coursesRes.ok)  throw new Error(coursesJson.error)
        if (!subjectsRes.ok) throw new Error(subjectsJson.error)

        setStudent(studentJson.data   ?? null)
        setCourses(coursesJson.data   ?? [])
        setSubjects(subjectsJson.data ?? [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAllData()
  }, [id])

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Back + Header */}
      <div>
        <Link
          href={`/students/${id}`}
          className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition mb-4 w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Profile
        </Link>
        <h1 className="text-2xl font-bold text-white">Edit Student</h1>
        {student && (
          <p className="text-slate-400 text-sm mt-1">
            Updating record for{' '}
            <span className="text-white font-medium">{getFullName(student)}</span>
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">
          Failed to load data: {error}
        </div>
      ) : (
        <StudentForm
          initialData={student}
          courses={courses}
          subjects={subjects}
        />
      )}
    </div>
  )
}