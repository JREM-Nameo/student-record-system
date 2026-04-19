'use client'

// components/StudentForm.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { validateStudentForm, getFieldError, getGradeError } from '@/lib/validation'
import { computeGWA, getGWARemark } from '@/lib/helpers'
import { Loader2 } from 'lucide-react'

const SEMESTERS = ['1st', '2nd']

function generateSchoolYears() {
  const current = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => {
    const y = current - 2 + i
    return `${y}-${y + 1}`
  })
}

const SCHOOL_YEARS = generateSchoolYears()

function buildFormState(initialData, subjects) {
  const enrolledIds = new Set(
    initialData?.student_subjects?.map((ss) => ss.subject_id) ?? []
  )

  return {
    student_id:         initialData?.student_id ?? '',
    first_name:         initialData?.first_name ?? '',
    last_name:          initialData?.last_name  ?? '',
    email:              initialData?.email      ?? '',
    course_id:          initialData?.course_id  ?? '',
    year_level:         initialData?.year_level ?? '',
    status:             initialData?.status     ?? 'Active',
    semester:           initialData?.grades?.[0]?.semester    ?? '1st',
    school_year:        initialData?.grades?.[0]?.school_year ?? SCHOOL_YEARS[2],
    enrolledSubjectIds: initialData ? [...enrolledIds] : [],
    grades: subjects.reduce((acc, s) => {
      const existing = initialData?.grades?.find((g) => g.subject_id === s.id)
      acc[s.code] = existing ? String(existing.grade) : ''
      return acc
    }, {}),
  }
}

export default function StudentForm({ initialData = null, courses = [], subjects = [] }) {
  const router = useRouter()
  const isEdit = !!initialData

  const [form, setForm]       = useState(() => buildFormState(initialData, subjects))
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (subjects.length > 0) {
      setForm(buildFormState(initialData, subjects))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects.length])

  const enrolledSubjects = subjects.filter((s) =>
    form.enrolledSubjectIds.includes(s.id)
  )

  const previewGrades = enrolledSubjects
    .map((s) => ({ grade: parseFloat(form.grades[s.code]), subjects: { units: s.units } }))
    .filter((g) => !isNaN(g.grade))

  const previewGWA = previewGrades.length === enrolledSubjects.length && enrolledSubjects.length > 0
    ? computeGWA(previewGrades)
    : null

  const previewRemark = previewGWA !== null ? getGWARemark(previewGWA) : null

  const remarkColorMap = {
    green:  'text-green-400',
    blue:   'text-blue-400',
    cyan:   'text-cyan-400',
    yellow: 'text-yellow-400',
    red:    'text-red-400',
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleGradeChange(code, value) {
    setForm((prev) => ({ ...prev, grades: { ...prev.grades, [code]: value } }))
    if (errors.grades?.[code]) {
      setErrors((prev) => ({ ...prev, grades: { ...prev.grades, [code]: undefined } }))
    }
  }

  function handleSubjectToggle(subject) {
    setForm((prev) => {
      const isEnrolled = prev.enrolledSubjectIds.includes(subject.id)
      const ids = isEnrolled
        ? prev.enrolledSubjectIds.filter((id) => id !== subject.id)
        : [...prev.enrolledSubjectIds, subject.id]
      const grades = { ...prev.grades }
      if (isEnrolled) grades[subject.code] = ''
      return { ...prev, enrolledSubjectIds: ids, grades }
    })
    if (errors.enrolledSubjectIds) {
      setErrors((prev) => ({ ...prev, enrolledSubjectIds: undefined }))
    }
  }

  async function handleSubmit() {
    const { isValid, errors: validationErrors } = validateStudentForm(form, enrolledSubjects)
    if (!isValid) {
      setErrors(validationErrors)
      toast.error('Please fix the errors before submitting.')
      return
    }

    setLoading(true)
    try {
      const url    = isEdit ? `/api/students/${initialData.id}` : '/api/students'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, subjects: enrolledSubjects }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')

      toast.success(isEdit ? 'Student updated!' : 'Student added successfully!')
      router.push(isEdit ? `/students/${initialData.id}` : '/students')
      router.refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">

      {/* Student Information */}
      <Section title="Student Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Student ID" error={getFieldError(errors, 'student_id')} required>
            <Input
              value={form.student_id}
              onChange={(v) => handleChange('student_id', v)}
              placeholder="e.g. 1001-26"
              disabled={isEdit}
            />
          </Field>

          <Field label="Status" error={getFieldError(errors, 'status')} required>
            <Select value={form.status} onChange={(v) => handleChange('status', v)}>
              {['Active', 'Inactive', 'Graduated', 'Dropped'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>

          <Field label="First Name" error={getFieldError(errors, 'first_name')} required>
            <Input
              value={form.first_name}
              onChange={(v) => handleChange('first_name', v)}
              placeholder="e.g. Juan"
            />
          </Field>

          <Field label="Last Name" error={getFieldError(errors, 'last_name')} required>
            <Input
              value={form.last_name}
              onChange={(v) => handleChange('last_name', v)}
              placeholder="e.g. Dela Cruz"
            />
          </Field>

          <Field label="Email" error={getFieldError(errors, 'email')} required className="sm:col-span-2">
            <Input
              type="email"
              value={form.email}
              onChange={(v) => handleChange('email', v)}
              placeholder="e.g. juan@email.com"
            />
          </Field>

          <Field label="Course" error={getFieldError(errors, 'course_id')} required>
            <Select value={form.course_id} onChange={(v) => handleChange('course_id', v)}>
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Year Level" error={getFieldError(errors, 'year_level')} required>
            <Select value={form.year_level} onChange={(v) => handleChange('year_level', v)}>
              <option value="">Select year level</option>
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      {/* Semester & School Year */}
      <Section title="Semester & School Year">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Semester" error={getFieldError(errors, 'semester')} required>
            <Select value={form.semester} onChange={(v) => handleChange('semester', v)}>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>{s} Semester</option>
              ))}
            </Select>
          </Field>
          <Field label="School Year" error={getFieldError(errors, 'school_year')} required>
            <Select value={form.school_year} onChange={(v) => handleChange('school_year', v)}>
              {SCHOOL_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      {/* Grades */}
      <Section title="Grades">

        {/* Subject selection */}
        <div className="mb-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3">
            Select Subjects to Enroll
          </p>
          {subjects.length === 0 ? (
            <p className="text-slate-500 text-sm">Loading subjects...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {subjects.map((subject) => {
                const checked = form.enrolledSubjectIds.includes(subject.id)
                return (
                  <label
                    key={subject.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition
                      ${checked
                        ? 'border-indigo-500/50 bg-indigo-500/10'
                        : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleSubjectToggle(subject)}
                      className="accent-indigo-500 w-4 h-4 shrink-0"
                    />
                    <div>
                      <p className="text-sm text-white font-medium">{subject.name}</p>
                      <p className="text-xs text-slate-400">{subject.units} units</p>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
          {errors.enrolledSubjectIds && (
            <p className="text-red-400 text-xs mt-2">{errors.enrolledSubjectIds}</p>
          )}
        </div>

        {/* GWA Preview */}
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl px-5 py-4 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">GWA Preview</p>
            <p className={`text-2xl font-bold mt-0.5 ${previewGWA !== null ? 'text-white' : 'text-slate-600'}`}>
              {previewGWA !== null ? previewGWA : '—'}
            </p>
          </div>
          {previewRemark
            ? <span className={`text-sm font-semibold ${remarkColorMap[previewRemark.color]}`}>{previewRemark.label}</span>
            : <span className="text-xs text-slate-500">Fill in all grades to preview GWA</span>
          }
        </div>

        {/* Grade inputs */}
        {form.enrolledSubjectIds.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">
            Select subjects above to enter grades.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {enrolledSubjects.map((subject) => (
              <Field
                key={subject.code}
                label={`${subject.name} (${subject.units} units)`}
                error={getGradeError(errors, subject.code)}
                required
              >
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.grades[subject.code] ?? ''}
                  onChange={(v) => handleGradeChange(subject.code, v)}
                  placeholder="0 – 100"
                />
              </Field>
            ))}
          </div>
        )}
      </Section>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
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
          {isEdit ? 'Save Changes' : 'Add Student'}
        </button>
      </div>
    </div>
  )
}

// ─── Reusable UI primitives ───────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 pb-3 border-b border-slate-700">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Field({ label, error, required, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-0.5">{error}</p>}
    </div>
  )
}

function Input({ type = 'text', value, onChange, placeholder, disabled, min, max, step }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      className="bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
    />
  )
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
    >
      {children}
    </select>
  )
}