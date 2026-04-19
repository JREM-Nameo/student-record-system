'use client'

// app/students/add/page.js
import { useState, useEffect } from 'react'
import StudentForm from '@/components/StudentForm'
import Link from 'next/link'
import { ChevronLeft, RefreshCw } from 'lucide-react'

export default function AddStudentPage() {
  const [courses, setCourses]   = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    async function fetchFormData() {
      try {
        const [coursesRes, subjectsRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/subjects'),
        ])

        const [coursesJson, subjectsJson] = await Promise.all([
          coursesRes.json(),
          subjectsRes.json(),
        ])

        if (!coursesRes.ok)  throw new Error('Courses: ' + coursesJson.error)
        if (!subjectsRes.ok) throw new Error('Subjects: ' + subjectsJson.error)

        setCourses(coursesJson.data   ?? [])
        setSubjects(subjectsJson.data ?? [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchFormData()
  }, [])

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      <div>
        <Link
          href="/students"
          className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition mb-4 w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Students
        </Link>
        <h1 className="text-2xl font-bold text-white">Add Student</h1>
        <p className="text-slate-400 text-sm mt-1">Fill in the details to create a new student record.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">
          <p className="font-semibold mb-1">Failed to load form data:</p>
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Debug: remove after confirming */}
          {courses.length === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl p-3 text-xs">
              Warning: No courses loaded from API.
            </div>
          )}
          {subjects.length === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl p-3 text-xs">
              Warning: No subjects loaded from API.
            </div>
          )}
          <StudentForm courses={courses} subjects={subjects} />
        </>
      )}
    </div>
  )
}